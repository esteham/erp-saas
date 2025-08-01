<?php
require_once '../config/init.php';
require_once '../../classes/location_manager.php';
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
echo json_encode($data);
