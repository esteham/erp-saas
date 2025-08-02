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
    error_log('Schedule API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Schedule API error',
        'error' => $e->getMessage()
    ]);
}

function handleGetRequest($pdo) {
    $action = $_GET['action'] ?? 'list';
    
    switch ($action) {
        case 'list':
            getSchedules($pdo);
            break;
        case 'calendar':
            getCalendarSchedules($pdo);
            break;
        case 'stats':
            getScheduleStats($pdo);
            break;
        case 'single':
            getSingleSchedule($pdo);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getSchedules($pdo) {
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;
    
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    $workerId = $_GET['worker_id'] ?? '';
    $dateFrom = $_GET['date_from'] ?? '';
    $dateTo = $_GET['date_to'] ?? '';
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if (!empty($search)) {
        $whereClause .= " AND (sr.title LIKE ? OR customer.username LIKE ? OR worker.username LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($status)) {
        $whereClause .= " AND sr.status = ?";
        $params[] = $status;
    }
    
    if (!empty($workerId)) {
        $whereClause .= " AND sr.worker_id = ?";
        $params[] = $workerId;
    }
    
    if (!empty($dateFrom)) {
        $whereClause .= " AND DATE(sr.scheduled_at) >= ?";
        $params[] = $dateFrom;
    }
    
    if (!empty($dateTo)) {
        $whereClause .= " AND DATE(sr.scheduled_at) <= ?";
        $params[] = $dateTo;
    }
    
    $query = "
        SELECT 
            sr.id,
            sr.title,
            sr.description,
            sr.status,
            sr.urgency,
            sr.scheduled_at,
            sr.started_at,
            sr.completed_at,
            sr.final_price,
            sr.address,
            customer.username as customer_name,
            customer.email as customer_email,
            worker.username as worker_name,
            w.phone as worker_phone,
            s.name as service_name,
            c.name as category_name
        FROM service_requests sr
        JOIN users customer ON sr.user_id = customer.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users worker ON w.user_id = worker.id
        JOIN services s ON sr.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        $whereClause
        AND sr.scheduled_at IS NOT NULL
        ORDER BY sr.scheduled_at ASC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $schedules = $stmt->fetchAll();
    
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM service_requests sr
        JOIN users customer ON sr.user_id = customer.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users worker ON w.user_id = worker.id
        JOIN services s ON sr.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        $whereClause
        AND sr.scheduled_at IS NOT NULL
    ";
    
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $totalCount = $stmt->fetch()['total'];
    
    $response = [
        'success' => true,
        'data' => [
            'schedules' => $schedules,
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

function getCalendarSchedules($pdo) {
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');
    $view = $_GET['view'] ?? 'month'; // day, week, month
    
    $startDate = '';
    $endDate = '';
    
    switch ($view) {
        case 'day':
            $date = $_GET['date'] ?? date('Y-m-d');
            $startDate = $date . ' 00:00:00';
            $endDate = $date . ' 23:59:59';
            break;
        case 'week':
            $date = $_GET['date'] ?? date('Y-m-d');
            $startDate = date('Y-m-d 00:00:00', strtotime('monday this week', strtotime($date)));
            $endDate = date('Y-m-d 23:59:59', strtotime('sunday this week', strtotime($date)));
            break;
        default: // month
            $startDate = "$year-$month-01 00:00:00";
            $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
            break;
    }
    
    $query = "
        SELECT 
            sr.id,
            sr.title,
            sr.description,
            sr.status,
            sr.urgency,
            sr.scheduled_at,
            sr.started_at,
            sr.completed_at,
            sr.final_price,
            sr.address,
            customer.username as customer_name,
            customer.email as customer_email,
            worker.username as worker_name,
            w.phone as worker_phone,
            s.name as service_name,
            c.name as category_name,
            c.icon as category_icon
        FROM service_requests sr
        JOIN users customer ON sr.user_id = customer.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users worker ON w.user_id = worker.id
        JOIN services s ON sr.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE sr.scheduled_at BETWEEN ? AND ?
        ORDER BY sr.scheduled_at ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$startDate, $endDate]);
    $schedules = $stmt->fetchAll();
    
    // Format schedules for calendar display
    $calendarEvents = [];
    foreach ($schedules as $schedule) {
        $calendarEvents[] = [
            'id' => $schedule['id'],
            'title' => $schedule['title'],
            'start' => $schedule['scheduled_at'],
            'end' => $schedule['completed_at'] ?? $schedule['scheduled_at'],
            'status' => $schedule['status'],
            'urgency' => $schedule['urgency'],
            'customer' => $schedule['customer_name'],
            'worker' => $schedule['worker_name'],
            'service' => $schedule['service_name'],
            'category' => $schedule['category_name'],
            'icon' => $schedule['category_icon'],
            'address' => $schedule['address'],
            'price' => $schedule['final_price'],
            'description' => $schedule['description']
        ];
    }
    
    $response = [
        'success' => true,
        'data' => [
            'events' => $calendarEvents,
            'view' => $view,
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ]
    ];
    
    echo json_encode($response);
}

function getScheduleStats($pdo) {
    $statsQuery = "
        SELECT 
            COUNT(*) as total_scheduled,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned_count,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
            SUM(CASE WHEN urgency = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
            SUM(CASE WHEN urgency = 'emergency' THEN 1 ELSE 0 END) as emergency_count,
            SUM(CASE WHEN DATE(scheduled_at) = CURDATE() THEN 1 ELSE 0 END) as today_count,
            SUM(CASE WHEN DATE(scheduled_at) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as tomorrow_count,
            SUM(CASE WHEN WEEK(scheduled_at) = WEEK(NOW()) AND YEAR(scheduled_at) = YEAR(NOW()) THEN 1 ELSE 0 END) as this_week_count
        FROM service_requests
        WHERE scheduled_at IS NOT NULL
    ";
    
    $stmt = $pdo->prepare($statsQuery);
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Get worker schedule stats
    $workerStatsQuery = "
        SELECT 
            worker.username as worker_name,
            COUNT(sr.id) as scheduled_jobs,
            SUM(CASE WHEN sr.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
            AVG(sr.final_price) as avg_job_price
        FROM service_requests sr
        JOIN workers w ON sr.worker_id = w.id
        JOIN users worker ON w.user_id = worker.id
        WHERE sr.scheduled_at IS NOT NULL
        AND sr.scheduled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY w.id, worker.username
        ORDER BY scheduled_jobs DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->prepare($workerStatsQuery);
    $stmt->execute();
    $workerStats = $stmt->fetchAll();
    
    $response = [
        'success' => true,
        'data' => [
            'stats' => $stats,
            'worker_stats' => $workerStats
        ]
    ];
    
    echo json_encode($response);
}

function getSingleSchedule($pdo) {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        throw new Exception('Schedule ID is required');
    }
    
    $query = "
        SELECT 
            sr.*,
            customer.username as customer_name,
            customer.email as customer_email,
            worker.username as worker_name,
            w.phone as worker_phone,
            w.rating as worker_rating,
            s.name as service_name,
            s.description as service_description,
            c.name as category_name,
            c.icon as category_icon
        FROM service_requests sr
        JOIN users customer ON sr.user_id = customer.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users worker ON w.user_id = worker.id
        JOIN services s ON sr.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE sr.id = ?
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    $schedule = $stmt->fetch();
    
    if (!$schedule) {
        throw new Exception('Schedule not found');
    }
    
    $response = [
        'success' => true,
        'data' => [
            'schedule' => $schedule
        ]
    ];
    
    echo json_encode($response);
}

function handlePostRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'create':
            createSchedule($pdo, $input);
            break;
        case 'assign_worker':
            assignWorker($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function createSchedule($pdo, $data) {
    $userId = $data['user_id'] ?? '';
    $serviceId = $data['service_id'] ?? '';
    $workerId = $data['worker_id'] ?? null;
    $zoneId = $data['zone_id'] ?? '';
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $address = $data['address'] ?? '';
    $scheduledAt = $data['scheduled_at'] ?? '';
    $urgency = $data['urgency'] ?? 'normal';
    $basePrice = $data['base_price'] ?? 0;
    $finalPrice = $data['final_price'] ?? $basePrice;
    
    if (empty($userId) || empty($serviceId) || empty($zoneId) || empty($title) || empty($scheduledAt)) {
        throw new Exception('Required fields: user_id, service_id, zone_id, title, scheduled_at');
    }
    
    $query = "
        INSERT INTO service_requests (
            user_id, service_id, worker_id, zone_id, title, description, 
            address, urgency, status, base_price, final_price, scheduled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'assigned', ?, ?, ?)
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $userId, $serviceId, $workerId, $zoneId, $title, $description,
        $address, $urgency, $basePrice, $finalPrice, $scheduledAt
    ]);
    
    $scheduleId = $pdo->lastInsertId();
    
    $response = [
        'success' => true,
        'message' => 'Schedule created successfully',
        'data' => [
            'schedule_id' => $scheduleId
        ]
    ];
    
    echo json_encode($response);
}

function assignWorker($pdo, $data) {
    $scheduleId = $data['schedule_id'] ?? '';
    $workerId = $data['worker_id'] ?? '';
    
    if (empty($scheduleId) || empty($workerId)) {
        throw new Exception('Schedule ID and Worker ID are required');
    }
    
    $query = "UPDATE service_requests SET worker_id = ?, status = 'assigned' WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$workerId, $scheduleId]);
    
    $response = [
        'success' => true,
        'message' => 'Worker assigned successfully'
    ];
    
    echo json_encode($response);
}

function handlePutRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'update_status':
            updateScheduleStatus($pdo, $input);
            break;
        case 'reschedule':
            rescheduleService($pdo, $input);
            break;
        case 'update':
            updateSchedule($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function updateScheduleStatus($pdo, $data) {
    $scheduleId = $data['schedule_id'] ?? '';
    $status = $data['status'] ?? '';
    
    if (empty($scheduleId) || empty($status)) {
        throw new Exception('Schedule ID and status are required');
    }
    
    $updateFields = ['status = ?'];
    $params = [$status];
    
    // Add timestamp based on status
    switch ($status) {
        case 'in_progress':
            $updateFields[] = 'started_at = NOW()';
            break;
        case 'completed':
            $updateFields[] = 'completed_at = NOW()';
            break;
        case 'cancelled':
            $updateFields[] = 'cancelled_at = NOW()';
            if (!empty($data['cancellation_reason'])) {
                $updateFields[] = 'cancellation_reason = ?';
                $params[] = $data['cancellation_reason'];
            }
            break;
    }
    
    $params[] = $scheduleId;
    
    $query = "UPDATE service_requests SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $response = [
        'success' => true,
        'message' => 'Schedule status updated successfully'
    ];
    
    echo json_encode($response);
}

function rescheduleService($pdo, $data) {
    $scheduleId = $data['schedule_id'] ?? '';
    $newScheduledAt = $data['new_scheduled_at'] ?? '';
    
    if (empty($scheduleId) || empty($newScheduledAt)) {
        throw new Exception('Schedule ID and new scheduled time are required');
    }
    
    $query = "UPDATE service_requests SET scheduled_at = ? WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$newScheduledAt, $scheduleId]);
    
    $response = [
        'success' => true,
        'message' => 'Service rescheduled successfully'
    ];
    
    echo json_encode($response);
}

function updateSchedule($pdo, $data) {
    $scheduleId = $data['schedule_id'] ?? '';
    
    if (empty($scheduleId)) {
        throw new Exception('Schedule ID is required');
    }
    
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['title', 'description', 'address', 'urgency', 'final_price', 'scheduled_at'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }
    
    $params[] = $scheduleId;
    
    $query = "UPDATE service_requests SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $response = [
        'success' => true,
        'message' => 'Schedule updated successfully'
    ];
    
    echo json_encode($response);
}

function handleDeleteRequest($pdo) {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        throw new Exception('Schedule ID is required');
    }
    
    // Instead of deleting, we'll cancel the schedule
    $query = "UPDATE service_requests SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = 'Cancelled by admin' WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    
    $response = [
        'success' => true,
        'message' => 'Schedule cancelled successfully'
    ];
    
    echo json_encode($response);
}
?>
