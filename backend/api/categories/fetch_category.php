<?php
require_once '../config/init.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access']);
    exit;
}

require_once '../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

try {
    $categories = $admin->getAllCategories();
    echo json_encode([
            'success' => true, 
            'categories' => $categories
        ]);
} catch (Exception $e) {
    echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
}
