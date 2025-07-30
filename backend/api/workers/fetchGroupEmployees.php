<?php
//fetchGroupEmployees
require_once '../config/init.php';
require_once '../../classes/class_admin.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized Access'
    ]);
    exit;
}

// Read raw JSON input
$input = json_decode(file_get_contents("php://input"), true);
$group_id = $input['group_id'] ?? null;

if (!$group_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Group ID is required.'
    ]);
    exit;
}

$admin = new Admin();
$data = $admin->getEmployeesByGroupId($group_id);

if (!empty($data)) {
    echo json_encode([
        'success' => true,
        'employees' => $data
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No employees found.'
    ]);
}
