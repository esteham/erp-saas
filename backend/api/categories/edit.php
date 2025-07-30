<?php
require_once '../config/init.php';

require_once '../../classes/class_admin.php';
$admin = new Admin();

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
$department_name = trim($data['name'] ?? '');

if(!$department_name === '')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Nmae required'
        ]);
	exit;
}

try 
{
	$pdo = $admin->getPdo();
	$pdo->beginTransaction();

	$stmt = $pdo->prepare("UPDATE departments SET name = ? WHERE id = ?");
	$stmt->execute([$department_name, $data['id']]);

	$pdo->commit();

	echo json_encode([
            'success' => true, 
            'message' => 'Department Updated Successfully']);

	} 
catch (Exception $e) 
{
	$pdo->rollBack();
	echo json_encode([
            'success' => false, 
            'message' => 'Failed to Update Group', 
            'error' => $e->getMessage()
        ]);
}
