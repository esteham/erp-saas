<?php
class Admin
{
    private $pdo;

    public function __construct()
    {
        $host = 'localhost';
        $db = 'service_provider';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host; dbname=$db; charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        
        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            die('DB Connection Failed: ' . $e->getMessage());
        }
    }

    public function getPDO()
    {
        return $this->pdo;
    }

    /* ================
    User Login
    =====================*/
    public function login($username, $password)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'active'");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            return [
                'success' => true,
                'data' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ],
            ];
        } else {
            return [
                'success' => false, 
                'message' => 'Invalid login credentials'
            ];
        }
    }

    /* ===============
    Send mail function
    ================*/
    public function sendMail($email, $message, $subject, $attachment = [])
    {
        require_once __DIR__ . '/../admin/PHPMailer/PHPMailer.php';
        require_once __DIR__ . '/../admin/PHPMailer/SMTP.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer();
        $mail->isSMTP();
        $mail->SMTPDebug = 0;
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'deepseekspider@gmail.com';
        $mail->Password = 'rjvaiybizhrajodd';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('deepseekspider@gmail.com', 'Xetlab');
        $mail->addAddress($email);

        foreach ($attachment as $files) {
            if (file_exists($files)) {
                $mail->addAttachment($files);
            }
        }
        
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->AltBody = strip_tags($message);
        $mail->Subject = $subject;
        $mail->Body = $message;

        if (!$mail->send()) {
            $_SESSION['mailError'] = $mail->ErrorInfo;
            return false;
        } else {
            return true;
        }
    }
    
    /* ==============
    Worker Management
    ================*/
    public function getAllWorkers()
    {
        $sql = "SELECT w.*, u.username, u.email, u.status as user_status, 
                c.name as category_name, z.name as zone_name, a.name as area_name
                FROM users u
                LEFT JOIN  workers w ON u.worker_id = w.id
                LEFT JOIN categories c ON w.category_id = c.id
                LEFT JOIN zones z ON w.zone_id = z.id
                LEFT JOIN areas a ON w.area_id = a.id
                ORDER BY w.id DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createWorker($userData, $workerData)
    {
        try {
            $this->pdo->beginTransaction();

            // Create user first
            $userSql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'worker')";
            $userStmt = $this->pdo->prepare($userSql);
            $userStmt->execute([
                $userData['username'],
                $userData['email'],
                password_hash($userData['password'], PASSWORD_DEFAULT)
            ]);
            $userId = $this->pdo->lastInsertId();

            // Then create worker
            $workerSql = "INSERT INTO workers (user_id, zone_id, area_id, category_id, phone, image, join_date, 
                          first_name, last_name, address, skills, emergency_name, emergency_phone, emergency_relation)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $workerStmt = $this->pdo->prepare($workerSql);
            $workerStmt->execute([
                $userId,
                $workerData['zone_id'],
                $workerData['area_id'],
                $workerData['category_id'],
                $workerData['phone'],
                $workerData['image'],
                $workerData['join_date'],
                $workerData['first_name'],
                $workerData['last_name'],
                $workerData['address'],
                $workerData['skills'],
                $workerData['emergency_name'],
                $workerData['emergency_phone'],
                $workerData['emergency_relation']
            ]);

            $this->pdo->commit();
            return ['success' => true, 'worker_id' => $this->pdo->lastInsertId()];
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return ['success' => false, 'message' => 'Failed to create worker: ' . $e->getMessage()];
        }
    }

    public function updateWorker($workerId, $workerData)
    {
        $sql = "UPDATE workers SET 
                zone_id = ?, area_id = ?, category_id = ?, phone = ?, image = ?,
                first_name = ?, last_name = ?, address = ?, skills = ?,
                emergency_name = ?, emergency_phone = ?, emergency_relation = ?, status = ?
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $workerData['zone_id'],
            $workerData['area_id'],
            $workerData['category_id'],
            $workerData['phone'],
            $workerData['image'],
            $workerData['first_name'],
            $workerData['last_name'],
            $workerData['address'],
            $workerData['skills'],
            $workerData['emergency_name'],
            $workerData['emergency_phone'],
            $workerData['emergency_relation'],
            $workerData['status'],
            $workerId
        ]);
    }

    public function deleteWorker($workerId)
    {
        try {
            $this->pdo->beginTransaction();

            // First get user_id to delete from users table
            $stmt = $this->pdo->prepare("SELECT user_id FROM workers WHERE id = ?");
            $stmt->execute([$workerId]);
            $worker = $stmt->fetch();
            
            if (!$worker) {
                throw new Exception("Worker not found");
            }

            // Delete worker
            $stmt = $this->pdo->prepare("DELETE FROM workers WHERE id = ?");
            $stmt->execute([$workerId]);

            // Delete user
            $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$worker['user_id']]);

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return false;
        }
    }

    /* ==============
    Agent Management
    ================*/
    public function getAllAgents()
    {
        $sql = "SELECT a.*, u.username, u.email, u.status as user_status, z.name as zone_name
                FROM agents a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN zones z ON a.assigned_zone_id = z.id
                ORDER BY a.id DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createAgent($userData, $agentData)
    {
        try {
            $this->pdo->beginTransaction();

            // Create user first
            $userSql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'agent')";
            $userStmt = $this->pdo->prepare($userSql);
            $userStmt->execute([
                $userData['username'],
                $userData['email'],
                password_hash($userData['password'], PASSWORD_DEFAULT)
            ]);
            $userId = $this->pdo->lastInsertId();

            // Then create agent
            $agentSql = "INSERT INTO agents (user_id, assigned_zone_id) VALUES (?, ?)";
            $agentStmt = $this->pdo->prepare($agentSql);
            $agentStmt->execute([$userId, $agentData['assigned_zone_id']]);

            $this->pdo->commit();
            return ['success' => true, 'agent_id' => $this->pdo->lastInsertId()];
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return ['success' => false, 'message' => 'Failed to create agent: ' . $e->getMessage()];
        }
    }

    
    // ---------- Division ----------
    public function createDivision($name) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM divisions WHERE name = ?");
        $stmt->execute([$name]);
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            return false;
        }
        $stmt = $this->pdo->prepare("INSERT INTO divisions (name) VALUES (?)");
        return $stmt->execute([$name]);
    }

    public function getDivisions() {
        $stmt = $this->pdo->query("SELECT * FROM divisions");
        return $stmt->fetchAll();
    }

    public function updateDivision($id, $name) {
        $stmt = $this->pdo->prepare("UPDATE divisions SET name = ? WHERE id = ?");
        return $stmt->execute([$name, $id]);
    }

    public function deleteDivision($id) {
        $stmt = $this->pdo->prepare("DELETE FROM divisions WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- District ----------
    public function createDistrict($division_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO districts (division_id, name) VALUES (?, ?)");
        return $stmt->execute([$division_id, $name]);
    }

    public function getDistricts($division_id = null) {
        if ($division_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM districts WHERE division_id = ?");
            $stmt->execute([$division_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM districts")->fetchAll();
        }
    }

    public function updateDistrict($id, $division_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE districts SET division_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$division_id, $name, $id]);
    }

    public function deleteDistrict($id) {
        $stmt = $this->pdo->prepare("DELETE FROM districts WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Upazila ----------
    public function createUpazila($district_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO upazilas (district_id, name) VALUES (?, ?)");
        return $stmt->execute([$district_id, $name]);
    }

    public function getUpazilas($district_id = null) {
        if ($district_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM upazilas WHERE district_id = ?");
            $stmt->execute([$district_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM upazilas")->fetchAll();
        }
    }

    public function updateUpazila($id, $district_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE upazilas SET district_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$district_id, $name, $id]);
    }

    public function deleteUpazila($id) {
        $stmt = $this->pdo->prepare("DELETE FROM upazilas WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Zone ----------
    public function createZone($upazila_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO zones (upazila_id, name) VALUES (?, ?)");
        return $stmt->execute([$upazila_id, $name]);
    }

    public function getZones($upazila_id = null) {
        if ($upazila_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM zones WHERE upazila_id = ?");
            $stmt->execute([$upazila_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM zones")->fetchAll();
        }
    }

    public function updateZone($id, $upazila_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE zones SET upazila_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$upazila_id, $name, $id]);
    }

    public function deleteZone($id) {
        $stmt = $this->pdo->prepare("DELETE FROM zones WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Area ----------
    public function createArea($zone_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO areas (zone_id, name) VALUES (?, ?)");
        return $stmt->execute([$zone_id, $name]);
    }

    public function getAreas($zone_id = null) {
        if ($zone_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM areas WHERE zone_id = ?");
            $stmt->execute([$zone_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM areas")->fetchAll();
        }
    }

    public function updateArea($id, $zone_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE areas SET zone_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$zone_id, $name, $id]);
    }

    public function deleteArea($id) {
        $stmt = $this->pdo->prepare("DELETE FROM areas WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /* ==============
    Location Management
    ================*/
    public function getAllDivisions()
    {
        $sql = "SELECT * FROM divisions ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDistrictsByDivision($divisionId)
    {
        $sql = "SELECT * FROM districts WHERE division_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$divisionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUpazilasByDistrict($districtId)
    {
        $sql = "SELECT * FROM upazilas WHERE district_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$districtId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getZonesByUpazila($upazilaId)
    {
        $sql = "SELECT * FROM zones WHERE upazila_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$upazilaId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAreasByZone($zoneId)
    {
        $sql = "SELECT * FROM areas WHERE zone_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$zoneId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /* ==============
    Service Management
    ================*/
    public function getAllServices()
    {
        $sql = "SELECT s.*, 
                u.username as customer_username,
                w.first_name as worker_name,
                a.name as area_name,
                z.name as zone_name
                FROM services s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN workers w ON s.worker_id = w.id
                LEFT JOIN areas a ON s.area_id = a.id
                LEFT JOIN zones z ON a.zone_id = z.id
                ORDER BY s.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateServiceStatus($serviceId, $status)
    {
        $sql = "UPDATE services SET status = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$status, $serviceId]);
    }

    /* ==============
    Task Management
    ================*/
    public function createTask($agentId, $workerId, $title, $description, $dueDate)
    {
        $sql = "INSERT INTO tasks (agent_id, worker_id, title, description, due_date) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$agentId, $workerId, $title, $description, $dueDate]);
        return $this->pdo->lastInsertId();
    }

    public function getTasksByWorker($workerId)
    {
        $sql = "SELECT t.*, a.first_name as agent_name 
                FROM tasks t
                LEFT JOIN agents ag ON t.agent_id = ag.id
                LEFT JOIN users u ON ag.user_id = u.id
                LEFT JOIN workers w ON t.worker_id = w.id
                WHERE t.worker_id = ?
                ORDER BY t.due_date ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$workerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateTaskStatus($taskId, $status)
    {
        $sql = "UPDATE tasks SET status = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$status, $taskId]);
    }

    /* ==============
    Category Management
    ================*/
    public function getAllCategories()
    {
        $sql = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createCategory($name)
    {
        $sql = "INSERT INTO categories (name) VALUES (?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name]);
    }

    public function updateCategory($id, $name)
    {
        $sql = "UPDATE categories SET name = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name, $id]);
    }

    public function deleteCategory($categoryID)
    {
        $sql = "DELETE FROM categories WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$categoryID]);
    }

    /* ==============
    User Management
    ================*/
    public function getAllUsers()
    {
        $sql = "SELECT * FROM users ORDER BY created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateUserStatus($userId, $status)
    {
        $sql = "UPDATE users SET status = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$status, $userId]);
    }

    /* ==============
    Review Management
    ================*/
    public function getServiceReviews()
    {
        $sql = "SELECT r.*, s.service_type, u.username as customer_name
                FROM reviews r
                LEFT JOIN services s ON r.service_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY r.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* ==============
    Pricing Management
    ================*/
    public function getPricingRulesByZone($zoneId)
    {
        $sql = "SELECT * FROM pricing_rules WHERE zone_id = ? ORDER BY time_start ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$zoneId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createPricingRule($zoneId, $timeStart, $timeEnd, $multiplier)
    {
        $sql = "INSERT INTO pricing_rules (zone_id, time_start, time_end, multiplier) 
                VALUES (?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$zoneId, $timeStart, $timeEnd, $multiplier]);
    }

    /* ==============
    Dashboard Stats
    ================*/
    public function getDashboardStats()
    {
        $stats = [];
        
        // Total Workers
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM workers");
        $stats['total_workers'] = $stmt->fetch()['count'];
        
        // Total Agents
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM agents");
        $stats['total_agents'] = $stmt->fetch()['count'];
        
        // Total Services
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM services");
        $stats['total_services'] = $stmt->fetch()['count'];
        
        // Pending Services
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM services WHERE status = 'pending'");
        $stats['pending_services'] = $stmt->fetch()['count'];
        
        return $stats;
    }
}