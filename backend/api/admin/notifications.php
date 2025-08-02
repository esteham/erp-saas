<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

try {
    $pdo = DatabaseConfig::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetRequest($pdo);
            break;
        case 'POST':
            handlePostRequest($pdo);
            break;
        case 'PUT':
            handlePutRequest($pdo);
            break;
        case 'DELETE':
            handleDeleteRequest($pdo);
            break;
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    error_log('Notifications API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Notifications API error',
        'error' => $e->getMessage()
    ]);
}

function handleGetRequest($pdo) {
    $action = $_GET['action'] ?? 'list';
    
    switch ($action) {
        case 'list':
            getNotifications($pdo);
            break;
        case 'stats':
            getNotificationStats($pdo);
            break;
        case 'single':
            getSingleNotification($pdo);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getNotifications($pdo) {
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;
    
    $search = $_GET['search'] ?? '';
    $type = $_GET['type'] ?? '';
    $isRead = $_GET['is_read'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if (!empty($search)) {
        $whereClause .= " AND (n.title LIKE ? OR n.message LIKE ? OR u.username LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($type)) {
        $whereClause .= " AND n.type = ?";
        $params[] = $type;
    }
    
    if ($isRead !== '') {
        $whereClause .= " AND n.is_read = ?";
        $params[] = $isRead;
    }
    
    if (!empty($userId)) {
        $whereClause .= " AND n.user_id = ?";
        $params[] = $userId;
    }
    
    $query = "
        SELECT 
            n.id,
            n.title,
            n.message,
            n.type,
            n.is_read,
            n.created_at,
            u.username as user_name,
            u.email as user_email,
            u.role as user_role
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        $whereClause
        ORDER BY n.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();
    
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        $whereClause
    ";
    
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $totalCount = $stmt->fetch()['total'];
    
    $response = [
        'success' => true,
        'data' => [
            'notifications' => $notifications,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($totalCount / $limit),
                'total_items' => (int)$totalCount,
                'items_per_page' => $limit
            ]
        ]
    ];
    
    echo json_encode($response);
}

function getNotificationStats($pdo) {
    $statsQuery = "
        SELECT 
            COUNT(*) as total_notifications,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
            SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info_count,
            SUM(CASE WHEN type = 'success' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning_count,
            SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END) as error_count,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as today_count,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_count
        FROM notifications
    ";
    
    $stmt = $pdo->prepare($statsQuery);
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Get notifications by user role
    $roleStatsQuery = "
        SELECT 
            u.role,
            COUNT(n.id) as notification_count,
            SUM(CASE WHEN n.is_read = 0 THEN 1 ELSE 0 END) as unread_count
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        GROUP BY u.role
    ";
    
    $stmt = $pdo->prepare($roleStatsQuery);
    $stmt->execute();
    $roleStats = $stmt->fetchAll();
    
    $response = [
        'success' => true,
        'data' => [
            'stats' => $stats,
            'role_stats' => $roleStats
        ]
    ];
    
    echo json_encode($response);
}

function getSingleNotification($pdo) {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        throw new Exception('Notification ID is required');
    }
    
    $query = "
        SELECT 
            n.*,
            u.username as user_name,
            u.email as user_email,
            u.role as user_role
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        WHERE n.id = ?
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    $notification = $stmt->fetch();
    
    if (!$notification) {
        throw new Exception('Notification not found');
    }
    
    $response = [
        'success' => true,
        'data' => [
            'notification' => $notification
        ]
    ];
    
    echo json_encode($response);
}

function handlePostRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'create':
            createNotification($pdo, $input);
            break;
        case 'broadcast':
            broadcastNotification($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function createNotification($pdo, $data) {
    $userId = $data['user_id'] ?? '';
    $title = $data['title'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'info';
    
    if (empty($userId) || empty($title) || empty($message)) {
        throw new Exception('User ID, title, and message are required');
    }
    
    $query = "
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, FALSE)
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$userId, $title, $message, $type]);
    
    $notificationId = $pdo->lastInsertId();
    
    $response = [
        'success' => true,
        'message' => 'Notification created successfully',
        'data' => [
            'notification_id' => $notificationId
        ]
    ];
    
    echo json_encode($response);
}

function broadcastNotification($pdo, $data) {
    $title = $data['title'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'info';
    $targetRole = $data['target_role'] ?? 'user'; // user, worker, agent, admin, all
    
    if (empty($title) || empty($message)) {
        throw new Exception('Title and message are required');
    }
    
    // Get target users
    $userQuery = "SELECT id FROM users WHERE status = 'active'";
    if ($targetRole !== 'all') {
        $userQuery .= " AND role = ?";
        $stmt = $pdo->prepare($userQuery);
        $stmt->execute([$targetRole]);
    } else {
        $stmt = $pdo->prepare($userQuery);
        $stmt->execute();
    }
    
    $users = $stmt->fetchAll();
    
    // Insert notification for each user
    $insertQuery = "
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, FALSE)
    ";
    
    $insertStmt = $pdo->prepare($insertQuery);
    $notificationCount = 0;
    
    foreach ($users as $user) {
        $insertStmt->execute([$user['id'], $title, $message, $type]);
        $notificationCount++;
    }
    
    $response = [
        'success' => true,
        'message' => "Broadcast notification sent to $notificationCount users",
        'data' => [
            'notifications_sent' => $notificationCount
        ]
    ];
    
    echo json_encode($response);
}

function handlePutRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'mark_read':
            markNotificationRead($pdo, $input);
            break;
        case 'mark_unread':
            markNotificationUnread($pdo, $input);
            break;
        case 'bulk_mark_read':
            bulkMarkNotificationsRead($pdo, $input);
            break;
        case 'mark_all_read':
            markAllNotificationsRead($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function markNotificationRead($pdo, $data) {
    $notificationId = $data['notification_id'] ?? '';
    
    if (empty($notificationId)) {
        throw new Exception('Notification ID is required');
    }
    
    $query = "UPDATE notifications SET is_read = TRUE WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$notificationId]);
    
    $response = [
        'success' => true,
        'message' => 'Notification marked as read'
    ];
    
    echo json_encode($response);
}

function markNotificationUnread($pdo, $data) {
    $notificationId = $data['notification_id'] ?? '';
    
    if (empty($notificationId)) {
        throw new Exception('Notification ID is required');
    }
    
    $query = "UPDATE notifications SET is_read = FALSE WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$notificationId]);
    
    $response = [
        'success' => true,
        'message' => 'Notification marked as unread'
    ];
    
    echo json_encode($response);
}

function bulkMarkNotificationsRead($pdo, $data) {
    $notificationIds = $data['notification_ids'] ?? [];
    
    if (empty($notificationIds)) {
        throw new Exception('Notification IDs are required');
    }
    
    $placeholders = str_repeat('?,', count($notificationIds) - 1) . '?';
    $query = "UPDATE notifications SET is_read = TRUE WHERE id IN ($placeholders)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($notificationIds);
    
    $updatedCount = $stmt->rowCount();
    
    $response = [
        'success' => true,
        'message' => "$updatedCount notifications marked as read"
    ];
    
    echo json_encode($response);
}

function markAllNotificationsRead($pdo, $data) {
    $userId = $data['user_id'] ?? '';
    
    if (!empty($userId)) {
        $query = "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$userId]);
    } else {
        $query = "UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    }
    
    $updatedCount = $stmt->rowCount();
    
    $response = [
        'success' => true,
        'message' => "$updatedCount notifications marked as read"
    ];
    
    echo json_encode($response);
}

function handleDeleteRequest($pdo) {
    $id = $_GET['id'] ?? '';
    $bulk = $_GET['bulk'] ?? '';
    $userId = $_GET['user_id'] ?? '';
    
    if (!empty($bulk)) {
        $ids = explode(',', $bulk);
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        $query = "DELETE FROM notifications WHERE id IN ($placeholders)";
        $stmt = $pdo->prepare($query);
        $stmt->execute($ids);
        $deletedCount = $stmt->rowCount();
        
        $response = [
            'success' => true,
            'message' => "$deletedCount notifications deleted successfully"
        ];
    } elseif (!empty($userId)) {
        // Delete all notifications for a specific user
        $query = "DELETE FROM notifications WHERE user_id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$userId]);
        $deletedCount = $stmt->rowCount();
        
        $response = [
            'success' => true,
            'message' => "$deletedCount notifications deleted for user"
        ];
    } else {
        if (empty($id)) {
            throw new Exception('Notification ID is required');
        }
        
        $query = "DELETE FROM notifications WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$id]);
        
        $response = [
            'success' => true,
            'message' => 'Notification deleted successfully'
        ];
    }
    
    echo json_encode($response);
}
?>
