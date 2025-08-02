<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

try {
    $pdo = DatabaseConfig::getConnection();
    
    // Get time range parameter
    $range = $_GET['range'] ?? 'month';
    
    // Calculate date ranges
    $now = new DateTime();
    $currentStart = clone $now;
    $previousStart = clone $now;
    $previousEnd = clone $now;
    
    switch ($range) {
        case 'week':
            $currentStart->modify('-7 days');
            $previousStart->modify('-14 days');
            $previousEnd->modify('-7 days');
            break;
        case 'quarter':
            $currentStart->modify('-3 months');
            $previousStart->modify('-6 months');
            $previousEnd->modify('-3 months');
            break;
        case 'year':
            $currentStart->modify('-1 year');
            $previousStart->modify('-2 years');
            $previousEnd->modify('-1 year');
            break;
        default: // month
            $currentStart->modify('-1 month');
            $previousStart->modify('-2 months');
            $previousEnd->modify('-1 month');
            break;
    }
    
    // Revenue Analytics
    $revenueQuery = "
        SELECT 
            SUM(CASE WHEN created_at >= ? AND created_at <= ? THEN final_price ELSE 0 END) as current_revenue,
            SUM(CASE WHEN created_at >= ? AND created_at < ? THEN final_price ELSE 0 END) as previous_revenue
        FROM service_requests 
        WHERE status = 'completed'
    ";
    
    $stmt = $pdo->prepare($revenueQuery);
    $stmt->execute([
        $currentStart->format('Y-m-d H:i:s'),
        $now->format('Y-m-d H:i:s'),
        $previousStart->format('Y-m-d H:i:s'),
        $previousEnd->format('Y-m-d H:i:s')
    ]);
    $revenueData = $stmt->fetch();
    
    $currentRevenue = (float)($revenueData['current_revenue'] ?? 0);
    $previousRevenue = (float)($revenueData['previous_revenue'] ?? 0);
    $revenueGrowth = $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
    
    // Users Analytics
    $usersQuery = "
        SELECT 
            COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as current_users,
            COUNT(CASE WHEN created_at >= ? AND created_at < ? THEN 1 END) as previous_users
        FROM users 
        WHERE role = 'user'
    ";
    
    $stmt = $pdo->prepare($usersQuery);
    $stmt->execute([
        $currentStart->format('Y-m-d H:i:s'),
        $now->format('Y-m-d H:i:s'),
        $previousStart->format('Y-m-d H:i:s'),
        $previousEnd->format('Y-m-d H:i:s')
    ]);
    $usersData = $stmt->fetch();
    
    $currentUsers = (int)($usersData['current_users'] ?? 0);
    $previousUsers = (int)($usersData['previous_users'] ?? 0);
    $usersGrowth = $previousUsers > 0 ? (($currentUsers - $previousUsers) / $previousUsers) * 100 : 0;
    
    // Service Requests Analytics
    $requestsQuery = "
        SELECT 
            COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as current_requests,
            COUNT(CASE WHEN created_at >= ? AND created_at < ? THEN 1 END) as previous_requests
        FROM service_requests
    ";
    
    $stmt = $pdo->prepare($requestsQuery);
    $stmt->execute([
        $currentStart->format('Y-m-d H:i:s'),
        $now->format('Y-m-d H:i:s'),
        $previousStart->format('Y-m-d H:i:s'),
        $previousEnd->format('Y-m-d H:i:s')
    ]);
    $requestsData = $stmt->fetch();
    
    $currentRequests = (int)($requestsData['current_requests'] ?? 0);
    $previousRequests = (int)($requestsData['previous_requests'] ?? 0);
    $requestsGrowth = $previousRequests > 0 ? (($currentRequests - $previousRequests) / $previousRequests) * 100 : 0;
    
    // Workers Analytics
    $workersQuery = "
        SELECT 
            COUNT(CASE WHEN w.created_at >= ? AND w.created_at <= ? THEN 1 END) as current_workers,
            COUNT(CASE WHEN w.created_at >= ? AND w.created_at < ? THEN 1 END) as previous_workers
        FROM workers w 
        JOIN users u ON w.user_id = u.id 
        WHERE w.status = 'active'
    ";
    
    $stmt = $pdo->prepare($workersQuery);
    $stmt->execute([
        $currentStart->format('Y-m-d H:i:s'),
        $now->format('Y-m-d H:i:s'),
        $previousStart->format('Y-m-d H:i:s'),
        $previousEnd->format('Y-m-d H:i:s')
    ]);
    $workersData = $stmt->fetch();
    
    $currentWorkers = (int)($workersData['current_workers'] ?? 0);
    $previousWorkers = (int)($workersData['previous_workers'] ?? 0);
    $workersGrowth = $previousWorkers > 0 ? (($currentWorkers - $previousWorkers) / $previousWorkers) * 100 : 0;
    
    // Monthly Revenue Trend (last 6 months)
    $trendQuery = "
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(final_price) as revenue
        FROM service_requests 
        WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ";
    
    $stmt = $pdo->prepare($trendQuery);
    $stmt->execute();
    $trendData = $stmt->fetchAll();
    
    // Top Services
    $topServicesQuery = "
        SELECT 
            s.name,
            COUNT(sr.id) as requests,
            SUM(sr.final_price) as revenue
        FROM services s
        JOIN service_requests sr ON s.id = sr.service_id
        WHERE sr.status = 'completed'
        AND sr.created_at >= ?
        GROUP BY s.id, s.name
        ORDER BY revenue DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->prepare($topServicesQuery);
    $stmt->execute([$currentStart->format('Y-m-d H:i:s')]);
    $topServices = $stmt->fetchAll();
    
    // Top Workers
    $topWorkersQuery = "
        SELECT 
            u.username as name,
            COUNT(sr.id) as jobs,
            AVG(sr.final_price) as avg_price,
            w.rating
        FROM workers w
        JOIN users u ON w.user_id = u.id
        JOIN service_requests sr ON w.id = sr.worker_id
        WHERE sr.status = 'completed'
        AND sr.created_at >= ?
        GROUP BY w.id, u.username, w.rating
        ORDER BY jobs DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->prepare($topWorkersQuery);
    $stmt->execute([$currentStart->format('Y-m-d H:i:s')]);
    $topWorkers = $stmt->fetchAll();
    
    // Format response
    $response = [
        'success' => true,
        'data' => [
            'revenue' => [
                'current' => $currentRevenue,
                'previous' => $previousRevenue,
                'growth' => round($revenueGrowth, 1)
            ],
            'users' => [
                'current' => $currentUsers,
                'previous' => $previousUsers,
                'growth' => round($usersGrowth, 1)
            ],
            'requests' => [
                'current' => $currentRequests,
                'previous' => $previousRequests,
                'growth' => round($requestsGrowth, 1)
            ],
            'workers' => [
                'current' => $currentWorkers,
                'previous' => $previousWorkers,
                'growth' => round($workersGrowth, 1)
            ],
            'revenue_trend' => $trendData,
            'top_services' => $topServices,
            'top_workers' => $topWorkers
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log('Analytics API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load analytics data',
        'error' => $e->getMessage()
    ]);
}
?>
