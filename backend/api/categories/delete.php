<?php
require_once '../config/init.php';
require_once '../../classes/class_functions.php';

$admin = new Admin();

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Request'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if ($data === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON',
        'input' => file_get_contents("php://input")
    ]);
    exit;
}

$categoryID = $data['id'] ?? 0;

if (!$categoryID) {
    echo json_encode([
        'success' => false,
        'message' => 'Category ID required'
    ]);
    exit;
}

try {
    $success = $admin->deleteCategory($categoryID);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete category (maybe ID not found)'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exception occurred',
        'error' => $e->getMessage()
    ]);
}
