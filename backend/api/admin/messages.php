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

// First, let's create the messages table if it doesn't exist
function createMessagesTable($pdo) {
    $createTableQuery = "
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('support', 'complaint', 'inquiry', 'feedback') DEFAULT 'inquiry',
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            status ENUM('unread', 'read', 'replied', 'closed') DEFAULT 'unread',
            is_broadcast BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ";
    
    $pdo->exec($createTableQuery);
}

try {
    $pdo = DatabaseConfig::getConnection();
    createMessagesTable($pdo);
    
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
    error_log('Messages API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Messages API error',
        'error' => $e->getMessage()
    ]);
}

function handleGetRequest($pdo) {
    $action = $_GET['action'] ?? 'list';
    
    switch ($action) {
        case 'list':
            getMessages($pdo);
            break;
        case 'stats':
            getMessageStats($pdo);
            break;
        case 'single':
            getSingleMessage($pdo);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getMessages($pdo) {
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;
    
    $search = $_GET['search'] ?? '';
    $type = $_GET['type'] ?? '';
    $status = $_GET['status'] ?? '';
    $priority = $_GET['priority'] ?? '';
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if (!empty($search)) {
        $whereClause .= " AND (m.subject LIKE ? OR m.message LIKE ? OR u.username LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($type)) {
        $whereClause .= " AND m.type = ?";
        $params[] = $type;
    }
    
    if (!empty($status)) {
        $whereClause .= " AND m.status = ?";
        $params[] = $status;
    }
    
    if (!empty($priority)) {
        $whereClause .= " AND m.priority = ?";
        $params[] = $priority;
    }
    
    $query = "
        SELECT 
            m.id,
            m.subject,
            m.message,
            m.type,
            m.priority,
            m.status,
            m.is_broadcast,
            m.created_at,
            m.updated_at,
            u.username as sender_name,
            u.email as sender_email,
            receiver.username as receiver_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN users receiver ON m.receiver_id = receiver.id
        $whereClause
        ORDER BY 
            CASE m.priority 
                WHEN 'urgent' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                WHEN 'low' THEN 4 
            END,
            m.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $messages = $stmt->fetchAll();
    
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN users receiver ON m.receiver_id = receiver.id
        $whereClause
    ";
    
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $totalCount = $stmt->fetch()['total'];
    
    $response = [
        'success' => true,
        'data' => [
            'messages' => $messages,
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

function getMessageStats($pdo) {
    $statsQuery = "
        SELECT 
            COUNT(*) as total_messages,
            SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread_count,
            SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
            SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
            SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
            SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_count,
            SUM(CASE WHEN type = 'support' THEN 1 ELSE 0 END) as support_count,
            SUM(CASE WHEN type = 'complaint' THEN 1 ELSE 0 END) as complaint_count
        FROM messages
    ";
    
    $stmt = $pdo->prepare($statsQuery);
    $stmt->execute();
    $stats = $stmt->fetch();
    
    $response = [
        'success' => true,
        'data' => [
            'stats' => $stats
        ]
    ];
    
    echo json_encode($response);
}

function getSingleMessage($pdo) {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        throw new Exception('Message ID is required');
    }
    
    $query = "
        SELECT 
            m.*,
            u.username as sender_name,
            u.email as sender_email,
            receiver.username as receiver_name,
            receiver.email as receiver_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN users receiver ON m.receiver_id = receiver.id
        WHERE m.id = ?
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    $message = $stmt->fetch();
    
    if (!$message) {
        throw new Exception('Message not found');
    }
    
    $response = [
        'success' => true,
        'data' => [
            'message' => $message
        ]
    ];
    
    echo json_encode($response);
}

function handlePostRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'send':
            sendMessage($pdo, $input);
            break;
        case 'broadcast':
            broadcastMessage($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function sendMessage($pdo, $data) {
    $senderId = $data['sender_id'] ?? 1; // Default to admin
    $receiverId = $data['receiver_id'] ?? null;
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'inquiry';
    $priority = $data['priority'] ?? 'medium';
    
    if (empty($subject) || empty($message)) {
        throw new Exception('Subject and message are required');
    }
    
    $query = "
        INSERT INTO messages (sender_id, receiver_id, subject, message, type, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, 'unread')
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$senderId, $receiverId, $subject, $message, $type, $priority]);
    
    $messageId = $pdo->lastInsertId();
    
    $response = [
        'success' => true,
        'message' => 'Message sent successfully',
        'data' => [
            'message_id' => $messageId
        ]
    ];
    
    echo json_encode($response);
}

function broadcastMessage($pdo, $data) {
    $senderId = $data['sender_id'] ?? 1; // Default to admin
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'inquiry';
    $priority = $data['priority'] ?? 'medium';
    $targetRole = $data['target_role'] ?? 'user'; // user, worker, agent, all
    
    if (empty($subject) || empty($message)) {
        throw new Exception('Subject and message are required');
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
    
    // Insert broadcast message for each user
    $insertQuery = "
        INSERT INTO messages (sender_id, receiver_id, subject, message, type, priority, status, is_broadcast)
        VALUES (?, ?, ?, ?, ?, ?, 'unread', TRUE)
    ";
    
    $insertStmt = $pdo->prepare($insertQuery);
    $messageCount = 0;
    
    foreach ($users as $user) {
        $insertStmt->execute([$senderId, $user['id'], $subject, $message, $type, $priority]);
        $messageCount++;
    }
    
    $response = [
        'success' => true,
        'message' => "Broadcast message sent to $messageCount users",
        'data' => [
            'messages_sent' => $messageCount
        ]
    ];
    
    echo json_encode($response);
}

function handlePutRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'update_status':
            updateMessageStatus($pdo, $input);
            break;
        case 'bulk_update':
            bulkUpdateMessages($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function updateMessageStatus($pdo, $data) {
    $messageId = $data['message_id'] ?? '';
    $status = $data['status'] ?? '';
    
    if (empty($messageId) || empty($status)) {
        throw new Exception('Message ID and status are required');
    }
    
    $query = "UPDATE messages SET status = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$status, $messageId]);
    
    $response = [
        'success' => true,
        'message' => 'Message status updated successfully'
    ];
    
    echo json_encode($response);
}

function bulkUpdateMessages($pdo, $data) {
    $messageIds = $data['message_ids'] ?? [];
    $status = $data['status'] ?? '';
    
    if (empty($messageIds) || empty($status)) {
        throw new Exception('Message IDs and status are required');
    }
    
    $placeholders = str_repeat('?,', count($messageIds) - 1) . '?';
    $query = "UPDATE messages SET status = ?, updated_at = NOW() WHERE id IN ($placeholders)";
    
    $params = array_merge([$status], $messageIds);
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $updatedCount = $stmt->rowCount();
    
    $response = [
        'success' => true,
        'message' => "$updatedCount messages updated successfully"
    ];
    
    echo json_encode($response);
}

function handleDeleteRequest($pdo) {
    $id = $_GET['id'] ?? '';
    $bulk = $_GET['bulk'] ?? '';
    
    if (!empty($bulk)) {
        $ids = explode(',', $bulk);
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        $query = "DELETE FROM messages WHERE id IN ($placeholders)";
        $stmt = $pdo->prepare($query);
        $stmt->execute($ids);
        $deletedCount = $stmt->rowCount();
        
        $response = [
            'success' => true,
            'message' => "$deletedCount messages deleted successfully"
        ];
    } else {
        if (empty($id)) {
            throw new Exception('Message ID is required');
        }
        
        $query = "DELETE FROM messages WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$id]);
        
        $response = [
            'success' => true,
            'message' => 'Message deleted successfully'
        ];
    }
    
    echo json_encode($response);
}
?>
