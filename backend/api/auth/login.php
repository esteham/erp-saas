<?php
require_once '../config/init.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode(['success'=> false, 'message'=>'Invalid request method']);
	exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if(empty($username) || empty($password))
{
	echo json_encode(['success'=> false, 'message' => "Username and password required"]);
	exit;
}

require_once '../../classes/class_functions.php';

$admin = new Admin();

$result = $admin->login($username, $password);

if($result['success'])
{
	$_SESSION['user'] = [

		'id' => $result['data']['id'],
		'role' => $result['data']['role']
	];

	echo json_encode([
			'success'=> true, 
			'message'=>'Login Successfull', 
			'role' => $result['data']['role']
		]);
}

else
{
	echo json_encode(['success'=> false, 'message' => $result['message']]);
}

?>