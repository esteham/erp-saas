<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Get all service requests with customer and worker details
    $sql = "SELECT 
                sr.id,
                sr.service_name,
                sr.address,
                sr.phone,
                sr.price,
                sr.status,
                sr.created_at,
                sr.customer_id,
                sr.worker_id,
                CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
                cu.email as customer_email,
                CONCAT(wu.first_name, ' ', wu.last_name) as worker_name,
                wu.email as worker_email,
                c.name as category_name
            FROM service_requests sr
            LEFT JOIN users cu ON sr.customer_id = cu.id
            LEFT JOIN workers w ON sr.worker_id = w.id
            LEFT JOIN users wu ON w.user_id = wu.id
            LEFT JOIN categories c ON sr.category_id = c.id
            ORDER BY sr.created_at DESC";
    
    $stmt = $pdo->query($sql);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for frontend consumption
    $formattedRequests = array_map(function($request) {
        return [
            'id' => (int)$request['id'],
            'service_name' => $request['service_name'],
            'customer_name' => $request['customer_name'],
            'customer_id' => (int)$request['customer_id'],
            'customer_email' => $request['customer_email'],
            'address' => $request['address'],
            'phone' => $request['phone'],
            'price' => (float)$request['price'],
            'status' => $request['status'],
            'created_at' => $request['created_at'],
            'worker_id' => $request['worker_id'] ? (int)$request['worker_id'] : null,
            'worker_name' => $request['worker_name'],
            'worker_email' => $request['worker_email'],
            'category_name' => $request['category_name']
        ];
    }, $requests);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedRequests
    ]);
    
} catch (Exception $e) {
    error_log("Service Requests API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch service requests'
    ]);
}
?>
