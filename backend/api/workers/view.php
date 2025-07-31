<?php
require_once '../config/init.php';
require_once '../../classes/class_functions.php';

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
$data = $admin->getAllWorkers();

if (!empty($data)) {
    echo json_encode([
        'success'   => true,
        'woker' => $data
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No workers found.'
    ]);
}
?>
