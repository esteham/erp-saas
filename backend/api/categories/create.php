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
            'message' => 'Department name required'
        ]);
	exit;
}

require_once '../../classes/class_admin.php';

$admin = new Admin();
$pdo = $admin->getPDO();

try 
{
	$stmt = $pdo->prepare("INSERT INTO departments (name) VALUES (?)");
	$stmt->execute([$name]);

	echo json_encode([
            'success' => true, 
            'message' => 'New Department Created'
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
