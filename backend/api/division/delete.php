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

if (isset($data['id'])) {
    $success = $admin->deleteDivision($data['id']);
    echo json_encode([
            'success' => $success,
            'message' => 'Division deleted'
        ]);
} 
else 
{
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
}
