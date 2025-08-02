<?php

require_once 'DB.php';

class ServiceRequest {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    /* ==============
    Service Request Management
    ================*/
    public function getAllServiceRequests($filters = []) {
        $sql = "SELECT sr.*, 
                s.name as service_name, c.name as category_name,
                u.username as customer_name, u.email as customer_email,
                w.first_name as worker_first_name, w.last_name as worker_last_name,
                a.name as area_name, z.name as zone_name
                FROM service_requests sr
                LEFT JOIN services s ON sr.service_id = s.id
                LEFT JOIN categories c ON s.category_id = c.id
                LEFT JOIN users u ON sr.user_id = u.id
                LEFT JOIN workers w ON sr.worker_id = w.id
                LEFT JOIN areas a ON sr.area_id = a.id
                LEFT JOIN zones z ON a.zone_id = z.id
                WHERE 1=1";
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND sr.status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['urgency'])) {
            $sql .= " AND sr.urgency = ?";
            $params[] = $filters['urgency'];
        }
        
        if (!empty($filters['worker_id'])) {
            $sql .= " AND sr.worker_id = ?";
            $params[] = $filters['worker_id'];
        }
        
        if (!empty($filters['user_id'])) {
            $sql .= " AND sr.user_id = ?";
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['service_id'])) {
            $sql .= " AND sr.service_id = ?";
            $params[] = $filters['service_id'];
        }
        
        if (!empty($filters['area_id'])) {
            $sql .= " AND sr.area_id = ?";
            $params[] = $filters['area_id'];
        }
        
        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(sr.created_at) >= ?";
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(sr.created_at) <= ?";
            $params[] = $filters['date_to'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (sr.title LIKE ? OR sr.description LIKE ? OR u.username LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY sr.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT ?";
            $params[] = (int)$filters['limit'];
        }
        
        try {
            return [
                'success' => true,
                'data' => $this->db->fetchAll($sql, $params)
            ];
        } catch (Exception $e) {
            error_log('Get service requests failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve service requests'];
        }
    }
    
    public function getServiceRequestById($id) {
        try {
            $sql = "SELECT sr.*, 
                    s.name as service_name, s.description as service_description, c.name as category_name,
                    u.username as customer_name, u.email as customer_email,
                    w.first_name as worker_first_name, w.last_name as worker_last_name, w.phone as worker_phone,
                    a.name as area_name, z.name as zone_name, up.name as upazila_name, d.name as district_name
                    FROM service_requests sr
                    LEFT JOIN services s ON sr.service_id = s.id
                    LEFT JOIN categories c ON s.category_id = c.id
                    LEFT JOIN users u ON sr.user_id = u.id
                    LEFT JOIN workers w ON sr.worker_id = w.id
                    LEFT JOIN areas a ON sr.area_id = a.id
                    LEFT JOIN zones z ON a.zone_id = z.id
                    LEFT JOIN upazilas up ON z.upazila_id = up.id
                    LEFT JOIN districts d ON up.district_id = d.id
                    WHERE sr.id = ?";
            
            $serviceRequest = $this->db->fetch($sql, [$id]);
            
            if (!$serviceRequest) {
                return ['success' => false, 'message' => 'Service request not found'];
            }
            
            return [
                'success' => true,
                'data' => $serviceRequest
            ];
        } catch (Exception $e) {
            error_log('Get service request failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve service request'];
        }
    }
    
    public function createServiceRequest($data) {
        $requiredFields = ['user_id', 'service_id', 'area_id', 'title', 'description', 'address', 'service_type', 'base_price', 'final_price'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return ['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'];
            }
        }
        
        try {
            $insertData = [
                'user_id' => $data['user_id'],
                'service_id' => $data['service_id'],
                'area_id' => $data['area_id'],
                'title' => $data['title'],
                'description' => $data['description'],
                'address' => $data['address'],
                'service_type' => $data['service_type'],
                'urgency' => $data['urgency'] ?? 'normal',
                'status' => 'pending',
                'base_price' => $data['base_price'],
                'final_price' => $data['final_price'],
                'price_breakdown' => isset($data['price_breakdown']) ? json_encode($data['price_breakdown']) : null,
                'scheduled_at' => $data['scheduled_at'] ?? null
            ];
            
            $serviceRequestId = $this->db->insert('service_requests', $insertData);
            
            return [
                'success' => true,
                'message' => 'Service request created successfully',
                'data' => ['id' => $serviceRequestId]
            ];
        } catch (Exception $e) {
            error_log('Create service request failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create service request'];
        }
    }
    
    public function updateServiceRequest($id, $data) {
        // Remove fields that shouldn't be updated directly
        unset($data['id'], $data['user_id'], $data['created_at']);
        
        if (empty($data)) {
            return ['success' => false, 'message' => 'No data to update'];
        }
        
        try {
            $result = $this->db->update('service_requests', $data, ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Service request updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Service request not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log('Update service request failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update service request'];
        }
    }
    
    public function updateStatus($id, $status, $additionalData = []) {
        $validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            return ['success' => false, 'message' => 'Invalid status'];
        }
        
        try {
            $updateData = ['status' => $status];
            
            // Add timestamp fields based on status
            switch ($status) {
                case 'in_progress':
                    $updateData['started_at'] = date('Y-m-d H:i:s');
                    break;
                case 'completed':
                    $updateData['completed_at'] = date('Y-m-d H:i:s');
                    break;
                case 'cancelled':
                    $updateData['cancelled_at'] = date('Y-m-d H:i:s');
                    if (!empty($additionalData['cancellation_reason'])) {
                        $updateData['cancellation_reason'] = $additionalData['cancellation_reason'];
                    }
                    break;
            }
            
            $result = $this->db->update('service_requests', $updateData, ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Service request status updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Service request not found'];
            }
        } catch (Exception $e) {
            error_log('Update service request status failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update service request status'];
        }
    }
    
    public function assignWorker($serviceRequestId, $workerId) {
        try {
            // Check if service request exists and is in pending status
            $serviceRequest = $this->db->fetch(
                "SELECT id, status FROM service_requests WHERE id = ?",
                [$serviceRequestId]
            );
            
            if (!$serviceRequest) {
                return ['success' => false, 'message' => 'Service request not found'];
            }
            
            if ($serviceRequest['status'] !== 'pending') {
                return ['success' => false, 'message' => 'Service request is not in pending status'];
            }
            
            // Check if worker exists and is available
            $worker = $this->db->fetch(
                "SELECT id, availability, status FROM workers WHERE id = ?",
                [$workerId]
            );
            
            if (!$worker) {
                return ['success' => false, 'message' => 'Worker not found'];
            }
            
            if ($worker['status'] !== 'active') {
                return ['success' => false, 'message' => 'Worker is not active'];
            }
            
            // Assign worker and update status
            $result = $this->db->update('service_requests', [
                'worker_id' => $workerId,
                'status' => 'assigned'
            ], ['id' => $serviceRequestId]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Worker assigned successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to assign worker'];
            }
        } catch (Exception $e) {
            error_log('Assign worker failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to assign worker'];
        }
    }
    
    public function getServiceRequestStats($filters = []) {
        try {
            $stats = [];
            $whereClause = "WHERE 1=1";
            $params = [];
            
            // Apply filters
            if (!empty($filters['worker_id'])) {
                $whereClause .= " AND worker_id = ?";
                $params[] = $filters['worker_id'];
            }
            
            if (!empty($filters['user_id'])) {
                $whereClause .= " AND user_id = ?";
                $params[] = $filters['user_id'];
            }
            
            if (!empty($filters['date_from'])) {
                $whereClause .= " AND DATE(created_at) >= ?";
                $params[] = $filters['date_from'];
            }
            
            if (!empty($filters['date_to'])) {
                $whereClause .= " AND DATE(created_at) <= ?";
                $params[] = $filters['date_to'];
            }
            
            // Total requests
            $total = $this->db->fetch("SELECT COUNT(*) as count FROM service_requests $whereClause", $params);
            $stats['total_requests'] = $total['count'];
            
            // Requests by status
            $statusStats = $this->db->fetchAll(
                "SELECT status, COUNT(*) as count FROM service_requests $whereClause GROUP BY status",
                $params
            );
            
            foreach ($statusStats as $stat) {
                $stats['by_status'][$stat['status']] = $stat['count'];
            }
            
            // Revenue stats
            $revenue = $this->db->fetch(
                "SELECT SUM(final_price) as total_revenue, AVG(final_price) as avg_price 
                 FROM service_requests $whereClause AND status = 'completed'",
                $params
            );
            $stats['total_revenue'] = $revenue['total_revenue'] ?? 0;
            $stats['average_price'] = $revenue['avg_price'] ?? 0;
            
            // Monthly stats
            $monthlyStats = $this->db->fetchAll(
                "SELECT MONTH(created_at) as month, YEAR(created_at) as year, 
                        COUNT(*) as requests, SUM(final_price) as revenue
                 FROM service_requests $whereClause 
                 GROUP BY YEAR(created_at), MONTH(created_at) 
                 ORDER BY year DESC, month DESC 
                 LIMIT 12",
                $params
            );
            $stats['monthly_stats'] = $monthlyStats;
            
            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            error_log('Get service request stats failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve service request statistics'];
        }
    }
    
    public function getAvailableWorkers($serviceId, $areaId) {
        try {
            $sql = "SELECT DISTINCT w.*, u.username, u.email
                    FROM workers w
                    JOIN users u ON w.user_id = u.id
                    JOIN worker_services ws ON w.id = ws.worker_id
                    LEFT JOIN worker_zones wz ON w.id = wz.worker_id
                    LEFT JOIN areas a ON ? = a.id
                    WHERE ws.service_id = ? 
                    AND w.status = 'active' 
                    AND w.availability = 'available'
                    AND (wz.zone_id = a.zone_id OR w.zone_id = a.zone_id)
                    ORDER BY w.rating DESC, w.total_jobs DESC";
            
            $workers = $this->db->fetchAll($sql, [$areaId, $serviceId]);
            
            return [
                'success' => true,
                'data' => $workers
            ];
        } catch (Exception $e) {
            error_log('Get available workers failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve available workers'];
        }
    }
    
    public function deleteServiceRequest($id) {
        try {
            // Check if service request can be deleted (only pending or cancelled requests)
            $serviceRequest = $this->db->fetch(
                "SELECT status FROM service_requests WHERE id = ?",
                [$id]
            );
            
            if (!$serviceRequest) {
                return ['success' => false, 'message' => 'Service request not found'];
            }
            
            if (!in_array($serviceRequest['status'], ['pending', 'cancelled'])) {
                return ['success' => false, 'message' => 'Cannot delete service request with current status'];
            }
            
            $result = $this->db->delete('service_requests', ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Service request deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete service request'];
            }
        } catch (Exception $e) {
            error_log('Delete service request failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete service request'];
        }
    }
}

?>
