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

if (isset($data['id']) && isset($data['name'])) {
    $success = $admin->updateDivision($data['id'], $data['name']);
    echo json_encode([
            'success' => $success,
            'message' => 'Division edit successfully'
        ]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
}
