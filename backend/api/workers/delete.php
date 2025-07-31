<?php
require_once '../config/init.php';
require_once '../../classes/class_functions.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access.'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Worker ID is required.'
    ]);
    exit;
}

$admin = new Admin();
$deleted = $admin->deleteWorker($data['id']);


if ($deleted) {
    echo json_encode([
        'success' => true,
        'message' => 'Worker deleted successfully.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete worker.'
    ]);
}
