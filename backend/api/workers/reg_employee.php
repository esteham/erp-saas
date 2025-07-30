<?php
require_once '../config/init.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr'])) {
    echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
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

require_once '../../classes/class_admin.php';
$admin = new Admin();
$pdo = $admin->getPDO();

try {
    // Required Fields
    $first_name     = $_POST['first_name'] ?? '';
    $last_name      = $_POST['last_name'] ?? '';
    $email          = $_POST['email'] ?? '';
    $phone          = $_POST['phone'] ?? '';
    $username       = $_POST['username'] ?? '';
    $department_id  = $_POST['department_id'] ?? '';

    // Optional Emergency Fields
    $address            = $_POST['address'] ?? null;
    $emergency_name     = $_POST['emergency_name'] ?? null;
    $emergency_phone    = $_POST['emergency_phone'] ?? null;
    $emergency_relation = $_POST['emergency_relation'] ?? null;

    // Basic Validation
    if (!$first_name || !$last_name || !$email || !$phone || !$username || !$department_id) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }

    // Insert into employees table
    $stmt = $pdo->prepare("INSERT INTO 
            employees (first_name, last_name, email, phone, department_id, address, emergency_name, emergency_phone, emergency_relation, join_date, status)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')
        ");
    $stmt->execute([
        $first_name,
        $last_name,
        $email,
        $phone,
        $department_id,
        $address,
        $emergency_name,
        $emergency_phone,
        $emergency_relation
    ]);

    $employeeID = $pdo->lastInsertId();

    // File Upload (certificate, experience)
    $uploadDir = '../../assets/uploads/documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $docFiles  = ['certificate', 'experience'];

    foreach ($docFiles as $docType) {
        if (isset($_FILES[$docType]) && $_FILES[$docType]['error'] === 0) {
            $filename = time() . '_' . basename($_FILES[$docType]['name']);
            $filepath = $uploadDir . $filename;

            move_uploaded_file($_FILES[$docType]['tmp_name'], $filepath);

            $docInsert = $pdo->prepare("INSERT INTO documents(employee_id, doc_type, file_path) VALUES (?, ?, ?)");
            $docInsert->execute([$employeeID, $docType, $filename]);
        }
    }

    // Generate password and hash
    $rawPassword = bin2hex(random_bytes(4)); // 8-digit random password
    $hashPassword = password_hash($rawPassword, PASSWORD_DEFAULT);

    // Insert into users table
    $userInsert = $pdo->prepare("INSERT INTO users (username, password, role, employee_id, status)
                                 VALUES (?, ?, 'employee', ?, 'active')");
    $userInsert->execute([$username, $hashPassword, $employeeID]);

    // Send email
    $subject = "Welcome to Our Team - Your Account is Ready!";
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a6fa5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 25px; background-color: #f9f9f9; border-left: 1px solid #e1e1e1; border-right: 1px solid #e1e1e1; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #777; background-color: #f0f0f0; border-radius: 0 0 8px 8px; }
            .credentials { background-color: #fff; border: 1px solid #e1e1e1; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .highlight { font-weight: bold; color: #2c5282; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Welcome to Our Team!</h2>
        </div>
        
        <div class="content">
            <p>Dear <span class="highlight">'.$first_name.' '.$last_name.'</span>,</p>
            
            <p>We\'re excited to welcome you to our team! Your employee account has been successfully created.</p>
            
            <div class="credentials">
                <p><strong>Your login credentials:</strong></p>
                <p>Username: <span class="highlight">'.$username.'</span></p>
                <p>Temporary Password: <span class="highlight">'.$rawPassword.'</span></p>
            </div>
            
            <p style="color: #d33a2c; font-weight: bold;">For security reasons, please change your password immediately after logging in.</p>
            
            <p style="text-align: center; margin: 25px 0;">
                <a href="https://xetroot.com/" class="button">Login to Your Account</a>
            </p>
            
            <p>If you have any questions or need assistance, please don\'t hesitate to contact HR.</p>
            
            <p>Best regards,<br>The HR Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© '.date('Y').' [Your Company Name]. All rights reserved.</p>
        </div>
    </body>
    </html>
    ';

    // Set content-type header for HTML email
    // $headers = "MIME-Version: 1.0" . "\r\n";
    // $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    // $headers .= "From: HR Team <hr@yourcompany.com>" . "\r\n";
    // $headers .= "Reply-To: hr-support@yourcompany.com" . "\r\n";

    $mailSend = $admin->sendMail($email, $message, $subject);

    if ($mailSend) {
        echo json_encode([
                'success' => true, 
                'message' => 'Employee registered and mail sent successfully'
            ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Employee registered but mail not sent'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
            'success' => false, 
            'message' => 'Error: ' . $e->getMessage()
        ]);
}
