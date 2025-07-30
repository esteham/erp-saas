<?php
require_once '../config/init.php';
require_once '../../classes/class_admin.php';

$db = new Admin();
$conn = $db->getPDO();

$admin = new Admin($conn);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->department_id)) {
    $employees = $admin->getEmployeesByDepartment($data->department_id);

    if ($employees) {
        echo json_encode([
            'success' => true,
            'employees' => $employees
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No employees found in this department.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Department ID is required.'
    ]);
}
