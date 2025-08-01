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

$location = new LocationManager();

$data = $location->getDivisions();

if ($data === false || $data === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch divisions'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $data
]);
