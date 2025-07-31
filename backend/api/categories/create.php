<?php
require_once '../config/init.php';

if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized'
        ]);
	exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Invalid Request'
        ]);
	exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');

if($name === '')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Category name required'
        ]);
	exit;
}

require_once '../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

try
{
    $pdo ->beginTransaction();

    $name = $admin->createCategory($name);
    $pdo ->commit();

    echo json_encode([
            'success'=> true,
            'message'=> 'Category created succesfully'
        ]);
} 
catch (Exception $e) 
{
	echo json_encode([
            'success' => false, 
            'message' => 'Error:' 
            .$e->getMessage()
        ]);
}
?>
