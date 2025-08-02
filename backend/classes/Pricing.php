<?php

require_once 'DB.php';

class Pricing {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    public function calculateDynamicPrice($serviceId, $zoneId, $requestTime = null, $urgency = 'normal') {
        if (!$requestTime) {
            $requestTime = date('Y-m-d H:i:s');
        }
        
        try {
            // Get base service price
            $service = $this->db->fetch(
                "SELECT base_price, category_id FROM services WHERE id = ?",
                [$serviceId]
            );
            
            if (!$service) {
                return ['success' => false, 'message' => 'Service not found'];
            }
            
            $basePrice = $service['base_price'];
            $finalPrice = $basePrice;
            $priceBreakdown = [
                'base_price' => $basePrice,
                'multipliers' => []
            ];
            
            // Zone-based pricing multiplier
            $zoneMultiplier = $this->getZoneMultiplier($zoneId);
            if ($zoneMultiplier > 0) {
                $finalPrice *= $zoneMultiplier;
                $priceBreakdown['multipliers']['zone'] = [
                    'factor' => $zoneMultiplier,
                    'description' => 'Zone-based pricing'
                ];
            }
            
            // Time-based pricing (peak hours, weekends)
            $timeMultiplier = $this->getTimeMultiplier($requestTime);
            if ($timeMultiplier != 1.0) {
                $finalPrice *= $timeMultiplier;
                $priceBreakdown['multipliers']['time'] = [
                    'factor' => $timeMultiplier,
                    'description' => 'Time-based pricing'
                ];
            }
            
            // Demand-supply multiplier
            $demandMultiplier = $this->getDemandMultiplier($serviceId, $zoneId, $requestTime);
            if ($demandMultiplier != 1.0) {
                $finalPrice *= $demandMultiplier;
                $priceBreakdown['multipliers']['demand'] = [
                    'factor' => $demandMultiplier,
                    'description' => 'Demand-supply based pricing'
                ];
            }
            
            // Urgency multiplier
            $urgencyMultiplier = $this->getUrgencyMultiplier($urgency);
            if ($urgencyMultiplier != 1.0) {
                $finalPrice *= $urgencyMultiplier;
                $priceBreakdown['multipliers']['urgency'] = [
                    'factor' => $urgencyMultiplier,
                    'description' => 'Urgency-based pricing'
                ];
            }
            
            // Provider availability multiplier
            $availabilityMultiplier = $this->getAvailabilityMultiplier($serviceId, $zoneId);
            if ($availabilityMultiplier != 1.0) {
                $finalPrice *= $availabilityMultiplier;
                $priceBreakdown['multipliers']['availability'] = [
                    'factor' => $availabilityMultiplier,
                    'description' => 'Provider availability based pricing'
                ];
            }
            
            $priceBreakdown['final_price'] = round($finalPrice, 2);
            
            return [
                'success' => true,
                'data' => [
                    'final_price' => round($finalPrice, 2),
                    'breakdown' => $priceBreakdown
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Price calculation failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Price calculation failed'];
        }
    }
    
    private function getZoneMultiplier($zoneId) {
        try {
            $zoneRule = $this->db->fetch(
                "SELECT multiplier FROM pricing_rules WHERE zone_id = ? AND status = 'active'",
                [$zoneId]
            );
            
            return $zoneRule ? $zoneRule['multiplier'] : 1.0;
        } catch (Exception $e) {
            return 1.0;
        }
    }
    
    private function getTimeMultiplier($requestTime) {
        $hour = (int)date('H', strtotime($requestTime));
        $dayOfWeek = date('N', strtotime($requestTime)); // 1 = Monday, 7 = Sunday
        
        // Peak hours (8-10 AM, 6-8 PM) - 1.2x multiplier
        if (($hour >= 8 && $hour <= 10) || ($hour >= 18 && $hour <= 20)) {
            return 1.2;
        }
        
        // Weekend multiplier - 1.15x
        if ($dayOfWeek >= 6) {
            return 1.15;
        }
        
        // Late night/early morning (10 PM - 6 AM) - 1.3x multiplier
        if ($hour >= 22 || $hour <= 6) {
            return 1.3;
        }
        
        return 1.0;
    }
    
    private function getDemandMultiplier($serviceId, $zoneId, $requestTime) {
        try {
            // Count requests in the last 2 hours for same service and area
            $recentRequests = $this->db->fetch(
                "SELECT COUNT(*) as count FROM service_requests sr
                 LEFT JOIN areas a ON sr.area_id = a.id
                 WHERE sr.service_id = ? AND a.zone_id = ? 
                 AND sr.created_at >= DATE_SUB(?, INTERVAL 2 HOUR)",
                [$serviceId, $zoneId, $requestTime]
            );
            
            $requestCount = $recentRequests['count'];
            
            // High demand (>5 requests) - 1.5x multiplier
            if ($requestCount > 5) {
                return 1.5;
            }
            // Medium demand (3-5 requests) - 1.2x multiplier
            elseif ($requestCount >= 3) {
                return 1.2;
            }
            // Low demand - normal price
            else {
                return 1.0;
            }
            
        } catch (Exception $e) {
            return 1.0;
        }
    }
    
    private function getUrgencyMultiplier($urgency) {
        switch ($urgency) {
            case 'emergency':
                return 2.0;
            case 'urgent':
                return 1.5;
            case 'normal':
            default:
                return 1.0;
        }
    }
    
    private function getAvailabilityMultiplier($serviceId, $zoneId) {
        try {
            // Count available providers for this service in this zone
            $availableProviders = $this->db->fetch(
                "SELECT COUNT(DISTINCT w.id) as count 
                 FROM workers w 
                 JOIN worker_services ws ON w.id = ws.worker_id 
                 JOIN worker_zones wz ON w.id = wz.worker_id 
                 WHERE ws.service_id = ? AND wz.zone_id = ? 
                 AND w.availability = 'available' AND w.status = 'active'",
                [$serviceId, $zoneId]
            );
            
            $providerCount = $availableProviders['count'];
            
            // Very few providers (1-2) - 1.3x multiplier
            if ($providerCount <= 2) {
                return 1.3;
            }
            // Few providers (3-5) - 1.1x multiplier
            elseif ($providerCount <= 5) {
                return 1.1;
            }
            // Adequate providers - normal price
            else {
                return 1.0;
            }
            
        } catch (Exception $e) {
            return 1.0;
        }
    }
    
    public function getPricingRules($zoneId = null) {
        try {
            $sql = "SELECT pr.*, z.name as zone_name 
                    FROM pricing_rules pr 
                    JOIN zones z ON pr.zone_id = z.id 
                    WHERE pr.status = 'active'";
            $params = [];
            
            if ($zoneId) {
                $sql .= " AND pr.zone_id = ?";
                $params[] = $zoneId;
            }
            
            $sql .= " ORDER BY z.name";
            
            return [
                'success' => true,
                'data' => $this->db->fetchAll($sql, $params)
            ];
        } catch (Exception $e) {
            error_log('Get pricing rules failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve pricing rules'];
        }
    }
    
    public function createPricingRule($ruleData) {
        $requiredFields = ['zone_id', 'multiplier'];
        foreach ($requiredFields as $field) {
            if (empty($ruleData[$field])) {
                return ['success' => false, 'message' => ucfirst($field) . ' is required'];
            }
        }
        
        if ($ruleData['multiplier'] <= 0) {
            return ['success' => false, 'message' => 'Multiplier must be greater than 0'];
        }
        
        try {
            $insertData = [
                'zone_id' => $ruleData['zone_id'],
                'time_start' => $ruleData['time_start'] ?? '00:00:00',
                'time_end' => $ruleData['time_end'] ?? '23:59:59',
                'multiplier' => $ruleData['multiplier'],
                'description' => $ruleData['description'] ?? '',
                'status' => 'active'
            ];
            
            $ruleId = $this->db->insert('pricing_rules', $insertData);
            
            return [
                'success' => true,
                'message' => 'Pricing rule created successfully',
                'data' => ['id' => $ruleId]
            ];
        } catch (Exception $e) {
            error_log('Create pricing rule failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create pricing rule'];
        }
    }
    
    public function updatePricingRule($ruleId, $ruleData) {
        if (isset($ruleData['multiplier']) && $ruleData['multiplier'] <= 0) {
            return ['success' => false, 'message' => 'Multiplier must be greater than 0'];
        }
        
        try {
            $result = $this->db->update('pricing_rules', $ruleData, ['id' => $ruleId]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Pricing rule updated successfully'];
            } else {
                return ['success' => false, 'message' => 'No changes made'];
            }
        } catch (Exception $e) {
            error_log('Update pricing rule failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update pricing rule'];
        }
    }
    
    public function deletePricingRule($ruleId) {
        try {
            $result = $this->db->update('pricing_rules', ['status' => 'inactive'], ['id' => $ruleId]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Pricing rule deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete pricing rule'];
            }
        } catch (Exception $e) {
            error_log('Delete pricing rule failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete pricing rule'];
        }
    }
    
    public function getPriceHistory($serviceId, $zoneId, $days = 30) {
        try {
            $sql = "SELECT DATE(created_at) as date, AVG(final_price) as avg_price, 
                           MIN(final_price) as min_price, MAX(final_price) as max_price,
                           COUNT(*) as request_count
                    FROM service_requests 
                    WHERE service_id = ? AND zone_id = ? 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC";
            
            return [
                'success' => true,
                'data' => $this->db->fetchAll($sql, [$serviceId, $zoneId, $days])
            ];
        } catch (Exception $e) {
            error_log('Get price history failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve price history'];
        }
    }
}

?>