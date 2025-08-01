<?php
require_once '../config/init.php';
require_once '../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'agent'])) {
    echo json_encode([
        'success' => false, 
        'message' => 'Unauthorized Access'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['name'])) {
    $success = $admin->createDivision($data['name']);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Division added successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Division already exists or insertion failed'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
}
