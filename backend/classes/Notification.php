<?php

require_once 'DB.php';

class Notification {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    /* ==============
    Notification Management
    ================*/
    public function getAllNotifications($filters = []) {
        $sql = "SELECT n.*, u.username, u.role
                FROM notifications n
                LEFT JOIN users u ON n.user_id = u.id
                WHERE 1=1";
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $sql .= " AND n.user_id = ?";
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['type'])) {
            $sql .= " AND n.type = ?";
            $params[] = $filters['type'];
        }
        
        if (isset($filters['is_read'])) {
            $sql .= " AND n.is_read = ?";
            $params[] = $filters['is_read'] ? 1 : 0;
        }
        
        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(n.created_at) >= ?";
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(n.created_at) <= ?";
            $params[] = $filters['date_to'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (n.title LIKE ? OR n.message LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY n.created_at DESC";
        
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
            error_log('Get notifications failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve notifications'];
        }
    }
    
    public function getNotificationById($id) {
        try {
            $sql = "SELECT n.*, u.username, u.role
                    FROM notifications n
                    LEFT JOIN users u ON n.user_id = u.id
                    WHERE n.id = ?";
            
            $notification = $this->db->fetch($sql, [$id]);
            
            if (!$notification) {
                return ['success' => false, 'message' => 'Notification not found'];
            }
            
            return [
                'success' => true,
                'data' => $notification
            ];
        } catch (Exception $e) {
            error_log('Get notification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve notification'];
        }
    }
    
    public function createNotification($data) {
        $requiredFields = ['user_id', 'title', 'message'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return ['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'];
            }
        }
        
        // Validate type
        $validTypes = ['info', 'success', 'warning', 'error'];
        if (!empty($data['type']) && !in_array($data['type'], $validTypes)) {
            return ['success' => false, 'message' => 'Invalid notification type'];
        }
        
        try {
            $insertData = [
                'user_id' => $data['user_id'],
                'title' => $data['title'],
                'message' => $data['message'],
                'type' => $data['type'] ?? 'info',
                'is_read' => false
            ];
            
            $notificationId = $this->db->insert('notifications', $insertData);
            
            return [
                'success' => true,
                'message' => 'Notification created successfully',
                'data' => ['id' => $notificationId]
            ];
        } catch (Exception $e) {
            error_log('Create notification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create notification'];
        }
    }
    
    public function createBulkNotifications($userIds, $title, $message, $type = 'info') {
        if (empty($userIds) || !is_array($userIds)) {
            return ['success' => false, 'message' => 'User IDs are required'];
        }
        
        if (empty($title) || empty($message)) {
            return ['success' => false, 'message' => 'Title and message are required'];
        }
        
        // Validate type
        $validTypes = ['info', 'success', 'warning', 'error'];
        if (!in_array($type, $validTypes)) {
            return ['success' => false, 'message' => 'Invalid notification type'];
        }
        
        try {
            $this->db->beginTransaction();
            
            $createdCount = 0;
            foreach ($userIds as $userId) {
                $insertData = [
                    'user_id' => $userId,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'is_read' => false
                ];
                
                $this->db->insert('notifications', $insertData);
                $createdCount++;
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "Successfully created $createdCount notifications",
                'data' => ['created_count' => $createdCount]
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Create bulk notifications failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create bulk notifications'];
        }
    }
    
    public function markAsRead($id) {
        try {
            $result = $this->db->update('notifications', ['is_read' => true], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Notification marked as read'];
            } else {
                return ['success' => false, 'message' => 'Notification not found'];
            }
        } catch (Exception $e) {
            error_log('Mark notification as read failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to mark notification as read'];
        }
    }
    
    public function markAsUnread($id) {
        try {
            $result = $this->db->update('notifications', ['is_read' => false], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Notification marked as unread'];
            } else {
                return ['success' => false, 'message' => 'Notification not found'];
            }
        } catch (Exception $e) {
            error_log('Mark notification as unread failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to mark notification as unread'];
        }
    }
    
    public function markAllAsRead($userId) {
        try {
            $result = $this->db->update('notifications', ['is_read' => true], ['user_id' => $userId]);
            
            return ['success' => true, 'message' => 'All notifications marked as read'];
        } catch (Exception $e) {
            error_log('Mark all notifications as read failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to mark all notifications as read'];
        }
    }
    
    public function deleteNotification($id) {
        try {
            $result = $this->db->delete('notifications', ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Notification deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Notification not found'];
            }
        } catch (Exception $e) {
            error_log('Delete notification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete notification'];
        }
    }
    
    public function deleteAllRead($userId) {
        try {
            $result = $this->db->delete('notifications', ['user_id' => $userId, 'is_read' => true]);
            
            return ['success' => true, 'message' => 'All read notifications deleted successfully'];
        } catch (Exception $e) {
            error_log('Delete all read notifications failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete read notifications'];
        }
    }
    
    public function getUnreadCount($userId) {
        try {
            $result = $this->db->fetch(
                "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
                [$userId]
            );
            
            return [
                'success' => true,
                'data' => ['unread_count' => $result['count']]
            ];
        } catch (Exception $e) {
            error_log('Get unread count failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get unread count'];
        }
    }
    
    public function getNotificationStats($filters = []) {
        try {
            $stats = [];
            $whereClause = "WHERE 1=1";
            $params = [];
            
            // Apply filters
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
            
            // Total notifications
            $total = $this->db->fetch("SELECT COUNT(*) as count FROM notifications $whereClause", $params);
            $stats['total_notifications'] = $total['count'];
            
            // Read/Unread counts
            $readStats = $this->db->fetchAll(
                "SELECT is_read, COUNT(*) as count FROM notifications $whereClause GROUP BY is_read",
                $params
            );
            
            foreach ($readStats as $stat) {
                if ($stat['is_read']) {
                    $stats['read_count'] = $stat['count'];
                } else {
                    $stats['unread_count'] = $stat['count'];
                }
            }
            
            // Notifications by type
            $typeStats = $this->db->fetchAll(
                "SELECT type, COUNT(*) as count FROM notifications $whereClause GROUP BY type",
                $params
            );
            
            foreach ($typeStats as $stat) {
                $stats['by_type'][$stat['type']] = $stat['count'];
            }
            
            // Daily stats for the last 7 days
            $dailyStats = $this->db->fetchAll(
                "SELECT DATE(created_at) as date, COUNT(*) as count 
                 FROM notifications $whereClause 
                 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 GROUP BY DATE(created_at) 
                 ORDER BY date DESC",
                $params
            );
            $stats['daily_stats'] = $dailyStats;
            
            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            error_log('Get notification stats failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve notification statistics'];
        }
    }
    
    /* ==============
    System Notification Templates
    ================*/
    public function notifyServiceRequestCreated($userId, $serviceRequestId, $serviceTitle) {
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'New Service Request',
            'message' => "Your service request '$serviceTitle' has been created and is pending assignment.",
            'type' => 'info'
        ]);
    }
    
    public function notifyServiceRequestAssigned($userId, $serviceRequestId, $workerName) {
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Service Request Assigned',
            'message' => "Your service request has been assigned to $workerName.",
            'type' => 'success'
        ]);
    }
    
    public function notifyServiceRequestStarted($userId, $serviceRequestId) {
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Service Started',
            'message' => "Work has started on your service request.",
            'type' => 'info'
        ]);
    }
    
    public function notifyServiceRequestCompleted($userId, $serviceRequestId) {
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Service Completed',
            'message' => "Your service request has been completed. Please review the work.",
            'type' => 'success'
        ]);
    }
    
    public function notifyServiceRequestCancelled($userId, $serviceRequestId, $reason = '') {
        $message = "Your service request has been cancelled.";
        if ($reason) {
            $message .= " Reason: $reason";
        }
        
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Service Request Cancelled',
            'message' => $message,
            'type' => 'warning'
        ]);
    }
    
    public function notifyWorkerNewAssignment($workerId, $serviceRequestId, $serviceTitle) {
        return $this->createNotification([
            'user_id' => $workerId,
            'title' => 'New Work Assignment',
            'message' => "You have been assigned to work on '$serviceTitle'.",
            'type' => 'info'
        ]);
    }
    
    public function notifyPaymentReceived($userId, $amount, $serviceRequestId) {
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Payment Received',
            'message' => "Payment of $$amount has been received for your service.",
            'type' => 'success'
        ]);
    }
    
    public function notifyAccountStatusChange($userId, $newStatus) {
        $type = $newStatus === 'active' ? 'success' : 'warning';
        return $this->createNotification([
            'user_id' => $userId,
            'title' => 'Account Status Updated',
            'message' => "Your account status has been changed to: $newStatus",
            'type' => $type
        ]);
    }
}

?>
