<?php
require_once '../config/init.php';
require_once '../../classes/class_admin.php';

// Ensure user is authenticated (optional, but recommended)
if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
        ]);
    exit;
}

// Initialize DB connection
$admin = new Admin();
$data = $admin->getAllEmployees();

if (!empty($data)) {
    echo json_encode([
        'success'   => true,
        'employees' => $data
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No employees found.'
    ]);
}
?>
