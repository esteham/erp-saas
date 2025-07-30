<?php
$host   ='localhost';
$db     ='service_provider';
$user   ='root';
$pass   ='';
$charset='utf8mb4';

$dsn    = "mysql:host=$host; dbname=$db; charset=$charset";
$options= [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        
    try {
        $pdo =new PDO($dsn, $user, $pass, $options);
    } 
    catch (PDOException $e) {
        die('DB Connection Failed :' .$e->getMessage());
    }


    //Admin Credentials
    $username       = 'admin';
    $raw_password   = '09876543';
    $hashed_password= password_hash($raw_password, PASSWORD_DEFAULT);
    $role           = 'admin';
    $status         = 'active';

    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);

    if($stmt->rowCount() > 0)
    {
        echo 'user already exists';
        exit;
    }

    $insert = $pdo->prepare('INSERT INTO users(username, password, role, status) VALUES(?, ?, ?, ?)');


    $insert->execute([$username, $hashed_password, $role, $status]);

    echo 'Admin created successfully';
    
?>