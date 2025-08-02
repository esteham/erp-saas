<?php

require_once 'DB.php';

class Provider {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    public function registerProvider($providerData) {
        $requiredFields = ['user_id', 'phone', 'address', 'skills'];
        foreach ($requiredFields as $field) {
            if (empty($providerData[$field])) {
                return ['success' => false, 'message' => ucfirst($field) . ' is required'];
            }
        }
        
        // Validate phone number format
        if (!preg_match('/^[0-9+\-\s()]+$/', $providerData['phone'])) {
            return ['success' => false, 'message' => 'Invalid phone number format'];
        }
        
        try {
            // Check if provider already exists
            $existingProvider = $this->db->fetch(
                "SELECT id FROM workers WHERE user_id = ?",
                [$providerData['user_id']]
            );
            
            if ($existingProvider) {
                return ['success' => false, 'message' => 'Provider already registered'];
            }
            
            $insertData = [
                'user_id' => $providerData['user_id'],
                'phone' => $providerData['phone'],
                'address' => $providerData['address'],
                'skills' => $providerData['skills'],
                'experience' => $providerData['experience'] ?? 0,
                'hourly_rate' => $providerData['hourly_rate'] ?? 0,
                'availability' => $providerData['availability'] ?? 'available',
                'status' => 'pending',
                'rating' => 0,
                'total_jobs' => 0
            ];
            
            $providerId = $this->db->insert('workers', $insertData);
            
            return [
                'success' => true,
                'message' => 'Provider registered successfully',
                'data' => ['id' => $providerId]
            ];
        } catch (Exception $e) {
            error_log('Provider registration failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Provider registration failed'];
        }
    }
    
    public function getAllProviders($filters = []) {
        $sql = "SELECT w.*, u.username, u.email 
                FROM workers w 
                JOIN users u ON w.user_id = u.id 
                WHERE 1=1";
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND w.status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['availability'])) {
            $sql .= " AND w.availability = ?";
            $params[] = $filters['availability'];
        }
        
        if (!empty($filters['skill'])) {
            $sql .= " AND w.skills LIKE ?";
            $params[] = '%' . $filters['skill'] . '%';
        }
        
        if (!empty($filters['zone_id'])) {
            $sql .= " AND EXISTS (SELECT 1 FROM worker_zones wz WHERE wz.worker_id = w.id AND wz.zone_id = ?)";
            $params[] = $filters['zone_id'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (u.username LIKE ? OR w.skills LIKE ? OR w.address LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY w.rating DESC, w.total_jobs DESC";
        
        try {
            return [
                'success' => true,
                'data' => $this->db->fetchAll($sql, $params)
            ];
        } catch (Exception $e) {
            error_log('Get providers failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve providers'];
        }
    }
    
    public function getProviderById($id) {
        try {
            $provider = $this->db->fetch(
                "SELECT w.*, u.username, u.email 
                 FROM workers w 
                 JOIN users u ON w.user_id = u.id 
                 WHERE w.id = ?",
                [$id]
            );
            
            if (!$provider) {
                return ['success' => false, 'message' => 'Provider not found'];
            }
            
            // Get provider's services
            $services = $this->db->fetchAll(
                "SELECT s.id, s.name, s.description 
                 FROM services s 
                 JOIN worker_services ws ON s.id = ws.service_id 
                 WHERE ws.worker_id = ?",
                [$id]
            );
            
            // Get provider's zones
            $zones = $this->db->fetchAll(
                "SELECT z.id, z.name 
                 FROM zones z 
                 JOIN worker_zones wz ON z.id = wz.zone_id 
                 WHERE wz.worker_id = ?",
                [$id]
            );
            
            $provider['services'] = $services;
            $provider['zones'] = $zones;
            
            return [
                'success' => true,
                'data' => $provider
            ];
        } catch (Exception $e) {
            error_log('Get provider failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve provider'];
        }
    }
    
    public function updateProvider($id, $providerData) {
        // Remove fields that shouldn't be updated directly
        unset($providerData['id'], $providerData['user_id'], $providerData['rating'], $providerData['total_jobs']);
        
        if (empty($providerData)) {
            return ['success' => false, 'message' => 'No data to update'];
        }
        
        // Validate phone number if provided
        if (isset($providerData['phone']) && !preg_match('/^[0-9+\-\s()]+$/', $providerData['phone'])) {
            return ['success' => false, 'message' => 'Invalid phone number format'];
        }
        
        try {
            $result = $this->db->update('workers', $providerData, ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Provider updated successfully'];
            } else {
                return ['success' => false, 'message' => 'No changes made'];
            }
        } catch (Exception $e) {
            error_log('Update provider failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update provider'];
        }
    }
    
    public function approveProvider($id) {
        try {
            $result = $this->db->update('workers', ['status' => 'active'], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Provider approved successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to approve provider'];
            }
        } catch (Exception $e) {
            error_log('Approve provider failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to approve provider'];
        }
    }
    
    public function rejectProvider($id, $reason = '') {
        try {
            $updateData = ['status' => 'rejected'];
            if ($reason) {
                $updateData['rejection_reason'] = $reason;
            }
            
            $result = $this->db->update('workers', $updateData, ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Provider rejected successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to reject provider'];
            }
        } catch (Exception $e) {
            error_log('Reject provider failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to reject provider'];
        }
    }
    
    public function setAvailability($id, $availability) {
        $validStatuses = ['available', 'busy', 'offline'];
        if (!in_array($availability, $validStatuses)) {
            return ['success' => false, 'message' => 'Invalid availability status'];
        }
        
        try {
            $result = $this->db->update('workers', ['availability' => $availability], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Availability updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update availability'];
            }
        } catch (Exception $e) {
            error_log('Set availability failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update availability'];
        }
    }
    
    public function assignServices($providerId, $serviceIds) {
        if (empty($serviceIds) || !is_array($serviceIds)) {
            return ['success' => false, 'message' => 'Service IDs are required'];
        }
        
        try {
            $this->db->beginTransaction();
            
            // Remove existing service assignments
            $this->db->delete('worker_services', ['worker_id' => $providerId]);
            
            // Add new service assignments
            foreach ($serviceIds as $serviceId) {
                $this->db->insert('worker_services', [
                    'worker_id' => $providerId,
                    'service_id' => $serviceId
                ]);
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Services assigned successfully'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Assign services failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to assign services'];
        }
    }
    
    public function assignZones($providerId, $zoneIds) {
        if (empty($zoneIds) || !is_array($zoneIds)) {
            return ['success' => false, 'message' => 'Zone IDs are required'];
        }
        
        try {
            $this->db->beginTransaction();
            
            // Remove existing zone assignments
            $this->db->delete('worker_zones', ['worker_id' => $providerId]);
            
            // Add new zone assignments
            foreach ($zoneIds as $zoneId) {
                $this->db->insert('worker_zones', [
                    'worker_id' => $providerId,
                    'zone_id' => $zoneId
                ]);
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Zones assigned successfully'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Assign zones failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to assign zones'];
        }
    }
    
    public function getProviderStats($providerId = null) {
        try {
            $stats = [];
            
            if ($providerId) {
                // Individual provider stats
                $provider = $this->db->fetch(
                    "SELECT rating, total_jobs, status, availability FROM workers WHERE id = ?",
                    [$providerId]
                );
                
                if (!$provider) {
                    return ['success' => false, 'message' => 'Provider not found'];
                }
                
                $stats = $provider;
                
                // Completed jobs this month
                $monthlyJobs = $this->db->fetch(
                    "SELECT COUNT(*) as count FROM service_requests 
                     WHERE worker_id = ? AND status = 'completed' 
                     AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())",
                    [$providerId]
                );
                $stats['monthly_jobs'] = $monthlyJobs['count'];
                
                // Earnings this month
                $monthlyEarnings = $this->db->fetch(
                    "SELECT SUM(final_price) as earnings FROM service_requests 
                     WHERE worker_id = ? AND status = 'completed' 
                     AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())",
                    [$providerId]
                );
                $stats['monthly_earnings'] = $monthlyEarnings['earnings'] ?? 0;
                
            } else {
                // Overall provider stats
                $totalProviders = $this->db->fetch("SELECT COUNT(*) as count FROM workers");
                $stats['total_providers'] = $totalProviders['count'];
                
                $activeProviders = $this->db->fetch("SELECT COUNT(*) as count FROM workers WHERE status = 'active'");
                $stats['active_providers'] = $activeProviders['count'];
                
                $availableProviders = $this->db->fetch("SELECT COUNT(*) as count FROM workers WHERE availability = 'available'");
                $stats['available_providers'] = $availableProviders['count'];
                
                $pendingProviders = $this->db->fetch("SELECT COUNT(*) as count FROM workers WHERE status = 'pending'");
                $stats['pending_providers'] = $pendingProviders['count'];
            }
            
            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            error_log('Get provider stats failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve provider statistics'];
        }
    }
    
    public function updateRating($providerId, $rating, $reviewCount = 1) {
        if ($rating < 1 || $rating > 5) {
            return ['success' => false, 'message' => 'Rating must be between 1 and 5'];
        }
        
        try {
            $provider = $this->db->fetch(
                "SELECT rating, total_jobs FROM workers WHERE id = ?",
                [$providerId]
            );
            
            if (!$provider) {
                return ['success' => false, 'message' => 'Provider not found'];
            }
            
            // Calculate new average rating
            $currentRating = $provider['rating'];
            $totalJobs = $provider['total_jobs'];
            
            if ($totalJobs == 0) {
                $newRating = $rating;
            } else {
                $newRating = (($currentRating * $totalJobs) + $rating) / ($totalJobs + $reviewCount);
            }
            
            $result = $this->db->update('workers', 
                [
                    'rating' => round($newRating, 2),
                    'total_jobs' => $totalJobs + $reviewCount
                ], 
                ['id' => $providerId]
            );
            
            if ($result) {
                return ['success' => true, 'message' => 'Rating updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update rating'];
            }
        } catch (Exception $e) {
            error_log('Update rating failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update rating'];
        }
    }
}

?>