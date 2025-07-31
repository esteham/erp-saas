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
$id = $data['id'] ?? 0;
$name = trim($data['name'] ?? '');

if (empty($id) || $name === '') {
    echo json_encode([
        'success' => false,
        'message' => 'ID and name are required'
    ]);
    exit;
}

try {
    $success = $admin->updateCategory($id, $name);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Category updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update category'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error occurred',
        'error' => $e->getMessage()
    ]);
}
