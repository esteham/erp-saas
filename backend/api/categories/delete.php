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
$departmentID = $data['id'] ?? 0;

if(!$departmentID)
{
	echo json_encode([
            'success' => false, 
            'message' => 'Department ID required'
        ]);
	exit;

}

try 
{
	$pdo = $admin->getPdo();
	$stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
    $stmt ->execute([$departmentID]);

	echo json_encode([
            'success' => true, 
            'message' => 'Departments deleted successfully'
        ]);

} 
catch (Exception $e) 
{
	echo json_encode([
            'success' => false, 
            'message' => 'Failed to delete group', 
            'error' => $e->getMessage()
        ]);

}