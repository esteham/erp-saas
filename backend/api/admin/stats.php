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
    
    // Get total users count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE status = 'active'");
    $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get active workers count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM workers w 
                        JOIN users u ON w.user_id = u.id 
                        WHERE w.status = 'active' AND u.status = 'active'");
    $activeWorkers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total service requests
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM service_requests");
    $totalRequests = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total revenue from completed requests
    $stmt = $pdo->query("SELECT COALESCE(SUM(price), 0) as total FROM service_requests 
                        WHERE status = 'completed'");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get pending requests count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM service_requests 
                        WHERE status = 'pending'");
    $pendingApprovals = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get active sessions (this would depend on your session management)
    $activeSessions = 0; // Placeholder - implement based on your session storage
    
    $stats = [
        'totalUsers' => (int)$totalUsers,
        'activeWorkers' => (int)$activeWorkers,
        'totalRequests' => (int)$totalRequests,
        'totalRevenue' => (float)$totalRevenue,
        'pendingApprovals' => (int)$pendingApprovals,
        'activeSessions' => (int)$activeSessions
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Stats API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch statistics'
    ]);
}
?>
