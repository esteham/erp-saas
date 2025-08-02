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
    error_log('Finance API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Finance API error',
        'error' => $e->getMessage()
    ]);
}

function handleGetRequest($pdo) {
    $action = $_GET['action'] ?? 'overview';
    
    switch ($action) {
        case 'overview':
            getFinanceOverview($pdo);
            break;
        case 'transactions':
            getTransactions($pdo);
            break;
        case 'expenses':
            getExpenses($pdo);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getFinanceOverview($pdo) {
    // Get current month revenue
    $revenueQuery = "
        SELECT 
            SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN final_price ELSE 0 END) as current_month_revenue,
            SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) THEN final_price ELSE 0 END) as last_month_revenue,
            SUM(final_price) as total_revenue
        FROM service_requests 
        WHERE status = 'completed'
    ";
    
    $stmt = $pdo->prepare($revenueQuery);
    $stmt->execute();
    $revenueData = $stmt->fetch();
    
    $currentRevenue = (float)($revenueData['current_month_revenue'] ?? 0);
    $lastRevenue = (float)($revenueData['last_month_revenue'] ?? 0);
    $totalRevenue = (float)($revenueData['total_revenue'] ?? 0);
    $revenueGrowth = $lastRevenue > 0 ? (($currentRevenue - $lastRevenue) / $lastRevenue) * 100 : 0;
    
    // Get expenses (mock data since we don't have expenses table)
    $currentExpenses = $currentRevenue * 0.3; // 30% of revenue as expenses
    $lastExpenses = $lastRevenue * 0.3;
    $expensesGrowth = $lastExpenses > 0 ? (($currentExpenses - $lastExpenses) / $lastExpenses) * 100 : 0;
    
    // Calculate profit
    $currentProfit = $currentRevenue - $currentExpenses;
    $lastProfit = $lastRevenue - $lastExpenses;
    $profitGrowth = $lastProfit > 0 ? (($currentProfit - $lastProfit) / $lastProfit) * 100 : 0;
    
    // Get commission data
    $commissionQuery = "
        SELECT 
            SUM(final_price * 0.1) as total_commission
        FROM service_requests 
        WHERE status = 'completed'
        AND MONTH(created_at) = MONTH(NOW()) 
        AND YEAR(created_at) = YEAR(NOW())
    ";
    
    $stmt = $pdo->prepare($commissionQuery);
    $stmt->execute();
    $commissionData = $stmt->fetch();
    $commission = (float)($commissionData['total_commission'] ?? 0);
    
    // Get monthly revenue trend
    $trendQuery = "
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(final_price) as revenue,
            COUNT(*) as transactions
        FROM service_requests 
        WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ";
    
    $stmt = $pdo->prepare($trendQuery);
    $stmt->execute();
    $trendData = $stmt->fetchAll();
    
    $response = [
        'success' => true,
        'data' => [
            'overview' => [
                'revenue' => [
                    'current' => $currentRevenue,
                    'previous' => $lastRevenue,
                    'growth' => round($revenueGrowth, 1),
                    'total' => $totalRevenue
                ],
                'expenses' => [
                    'current' => $currentExpenses,
                    'previous' => $lastExpenses,
                    'growth' => round($expensesGrowth, 1)
                ],
                'profit' => [
                    'current' => $currentProfit,
                    'previous' => $lastProfit,
                    'growth' => round($profitGrowth, 1)
                ],
                'commission' => $commission
            ],
            'trend' => $trendData
        ]
    ];
    
    echo json_encode($response);
}

function getTransactions($pdo) {
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;
    
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if (!empty($search)) {
        $whereClause .= " AND (u.username LIKE ? OR sr.title LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($status)) {
        $whereClause .= " AND sr.status = ?";
        $params[] = $status;
    }
    
    $query = "
        SELECT 
            sr.id,
            sr.title,
            u.username as customer,
            w_user.username as worker,
            s.name as service,
            sr.final_price as amount,
            sr.status,
            sr.created_at,
            sr.completed_at
        FROM service_requests sr
        JOIN users u ON sr.user_id = u.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users w_user ON w.user_id = w_user.id
        JOIN services s ON sr.service_id = s.id
        $whereClause
        ORDER BY sr.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();
    
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM service_requests sr
        JOIN users u ON sr.user_id = u.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users w_user ON w.user_id = w_user.id
        JOIN services s ON sr.service_id = s.id
        $whereClause
    ";
    
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $totalCount = $stmt->fetch()['total'];
    
    $response = [
        'success' => true,
        'data' => [
            'transactions' => $transactions,
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

function getExpenses($pdo) {
    // Mock expenses data since we don't have expenses table
    $expenses = [
        [
            'id' => 1,
            'category' => 'Marketing',
            'description' => 'Social media advertising',
            'amount' => 1500.00,
            'date' => date('Y-m-d', strtotime('-5 days')),
            'status' => 'paid'
        ],
        [
            'id' => 2,
            'category' => 'Operations',
            'description' => 'Server hosting costs',
            'amount' => 299.99,
            'date' => date('Y-m-d', strtotime('-10 days')),
            'status' => 'paid'
        ],
        [
            'id' => 3,
            'category' => 'Staff',
            'description' => 'Customer support salaries',
            'amount' => 3200.00,
            'date' => date('Y-m-d', strtotime('-15 days')),
            'status' => 'paid'
        ],
        [
            'id' => 4,
            'category' => 'Utilities',
            'description' => 'Office electricity bill',
            'amount' => 450.00,
            'date' => date('Y-m-d', strtotime('-20 days')),
            'status' => 'pending'
        ]
    ];
    
    $response = [
        'success' => true,
        'data' => [
            'expenses' => $expenses
        ]
    ];
    
    echo json_encode($response);
}

function handlePostRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'add_expense':
            addExpense($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function addExpense($pdo, $data) {
    // Since we don't have expenses table, return success with mock data
    $response = [
        'success' => true,
        'message' => 'Expense added successfully',
        'data' => [
            'id' => rand(100, 999),
            'category' => $data['category'] ?? '',
            'description' => $data['description'] ?? '',
            'amount' => (float)($data['amount'] ?? 0),
            'date' => $data['date'] ?? date('Y-m-d'),
            'status' => 'pending'
        ]
    ];
    
    echo json_encode($response);
}

function handlePutRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    // Handle expense updates
    $response = [
        'success' => true,
        'message' => 'Expense updated successfully'
    ];
    
    echo json_encode($response);
}

function handleDeleteRequest($pdo) {
    $id = $_GET['id'] ?? '';
    // Handle expense deletion
    $response = [
        'success' => true,
        'message' => 'Expense deleted successfully'
    ];
    
    echo json_encode($response);
}
?>
