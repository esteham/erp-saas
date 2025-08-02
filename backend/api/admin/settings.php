<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

try {
    $pdo = DatabaseConfig::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetRequest($pdo);
            break;
        case 'POST':
            handlePostRequest($pdo);
            break;
        case 'PUT':
            handlePutRequest($pdo);
            break;
        case 'DELETE':
            handleDeleteRequest($pdo);
            break;
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    error_log('Settings API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Settings API error',
        'error' => $e->getMessage()
    ]);
}

function handleGetRequest($pdo) {
    $action = $_GET['action'] ?? 'list';
    
    switch ($action) {
        case 'list':
            getSettings($pdo);
            break;
        case 'single':
            getSingleSetting($pdo);
            break;
        case 'categories':
            getSettingCategories($pdo);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getSettings($pdo) {
    $category = $_GET['category'] ?? '';
    
    $whereClause = "";
    $params = [];
    
    if (!empty($category)) {
        $whereClause = "WHERE setting_key LIKE ?";
        $params[] = "$category%";
    }
    
    $query = "
        SELECT 
            id,
            setting_key,
            setting_value,
            description,
            updated_at
        FROM system_settings
        $whereClause
        ORDER BY setting_key ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $settings = $stmt->fetchAll();
    
    // Group settings by category (prefix before first underscore)
    $groupedSettings = [];
    foreach ($settings as $setting) {
        $parts = explode('_', $setting['setting_key']);
        $category = $parts[0];
        
        if (!isset($groupedSettings[$category])) {
            $groupedSettings[$category] = [];
        }
        
        $groupedSettings[$category][] = $setting;
    }
    
    $response = [
        'success' => true,
        'data' => [
            'settings' => $settings,
            'grouped_settings' => $groupedSettings
        ]
    ];
    
    echo json_encode($response);
}

function getSingleSetting($pdo) {
    $key = $_GET['key'] ?? '';
    $id = $_GET['id'] ?? '';
    
    if (empty($key) && empty($id)) {
        throw new Exception('Setting key or ID is required');
    }
    
    if (!empty($key)) {
        $query = "SELECT * FROM system_settings WHERE setting_key = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$key]);
    } else {
        $query = "SELECT * FROM system_settings WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$id]);
    }
    
    $setting = $stmt->fetch();
    
    if (!$setting) {
        throw new Exception('Setting not found');
    }
    
    $response = [
        'success' => true,
        'data' => [
            'setting' => $setting
        ]
    ];
    
    echo json_encode($response);
}

function getSettingCategories($pdo) {
    $query = "
        SELECT 
            SUBSTRING_INDEX(setting_key, '_', 1) as category,
            COUNT(*) as setting_count
        FROM system_settings
        GROUP BY SUBSTRING_INDEX(setting_key, '_', 1)
        ORDER BY category ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    // Add category descriptions
    $categoryDescriptions = [
        'site' => 'General site configuration settings',
        'email' => 'Email and notification settings',
        'payment' => 'Payment gateway and pricing settings',
        'security' => 'Security and authentication settings',
        'api' => 'API configuration settings',
        'maintenance' => 'System maintenance settings',
        'default' => 'Default system values'
    ];
    
    foreach ($categories as &$category) {
        $category['description'] = $categoryDescriptions[$category['category']] ?? 'System settings';
    }
    
    $response = [
        'success' => true,
        'data' => [
            'categories' => $categories
        ]
    ];
    
    echo json_encode($response);
}

function handlePostRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'create':
            createSetting($pdo, $input);
            break;
        case 'bulk_update':
            bulkUpdateSettings($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function createSetting($pdo, $data) {
    $settingKey = $data['setting_key'] ?? '';
    $settingValue = $data['setting_value'] ?? '';
    $description = $data['description'] ?? '';
    
    if (empty($settingKey) || empty($settingValue)) {
        throw new Exception('Setting key and value are required');
    }
    
    // Check if setting already exists
    $checkQuery = "SELECT id FROM system_settings WHERE setting_key = ?";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([$settingKey]);
    
    if ($stmt->fetch()) {
        throw new Exception('Setting with this key already exists');
    }
    
    $query = "
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$settingKey, $settingValue, $description]);
    
    $settingId = $pdo->lastInsertId();
    
    $response = [
        'success' => true,
        'message' => 'Setting created successfully',
        'data' => [
            'setting_id' => $settingId
        ]
    ];
    
    echo json_encode($response);
}

function bulkUpdateSettings($pdo, $data) {
    $settings = $data['settings'] ?? [];
    
    if (empty($settings)) {
        throw new Exception('Settings array is required');
    }
    
    $pdo->beginTransaction();
    
    try {
        $updateQuery = "
            INSERT INTO system_settings (setting_key, setting_value, description) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            description = VALUES(description),
            updated_at = NOW()
        ";
        
        $stmt = $pdo->prepare($updateQuery);
        $updatedCount = 0;
        
        foreach ($settings as $setting) {
            if (empty($setting['setting_key']) || !isset($setting['setting_value'])) {
                continue;
            }
            
            $stmt->execute([
                $setting['setting_key'],
                $setting['setting_value'],
                $setting['description'] ?? ''
            ]);
            $updatedCount++;
        }
        
        $pdo->commit();
        
        $response = [
            'success' => true,
            'message' => "$updatedCount settings updated successfully"
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handlePutRequest($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'update';
    
    switch ($action) {
        case 'update':
            updateSetting($pdo, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function updateSetting($pdo, $data) {
    $settingId = $data['setting_id'] ?? '';
    $settingKey = $data['setting_key'] ?? '';
    $settingValue = $data['setting_value'] ?? '';
    $description = $data['description'] ?? '';
    
    if (empty($settingId) && empty($settingKey)) {
        throw new Exception('Setting ID or key is required');
    }
    
    if (!isset($settingValue)) {
        throw new Exception('Setting value is required');
    }
    
    if (!empty($settingId)) {
        $query = "
            UPDATE system_settings 
            SET setting_value = ?, description = ?, updated_at = NOW() 
            WHERE id = ?
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$settingValue, $description, $settingId]);
    } else {
        $query = "
            UPDATE system_settings 
            SET setting_value = ?, description = ?, updated_at = NOW() 
            WHERE setting_key = ?
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$settingValue, $description, $settingKey]);
    }
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Setting not found or no changes made');
    }
    
    $response = [
        'success' => true,
        'message' => 'Setting updated successfully'
    ];
    
    echo json_encode($response);
}

function handleDeleteRequest($pdo) {
    $id = $_GET['id'] ?? '';
    $key = $_GET['key'] ?? '';
    
    if (empty($id) && empty($key)) {
        throw new Exception('Setting ID or key is required');
    }
    
    if (!empty($id)) {
        $query = "DELETE FROM system_settings WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$id]);
    } else {
        $query = "DELETE FROM system_settings WHERE setting_key = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$key]);
    }
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Setting not found');
    }
    
    $response = [
        'success' => true,
        'message' => 'Setting deleted successfully'
    ];
    
    echo json_encode($response);
}

// Helper function to get default settings if none exist
function initializeDefaultSettings($pdo) {
    $defaultSettings = [
        // Site settings
        ['site_name', 'Local Service Provider Network', 'Name of the application'],
        ['site_email', 'info@localservice.com', 'Contact email for the site'],
        ['site_phone', '+1-234-567-8900', 'Contact phone number'],
        ['site_address', '123 Main St, City, State 12345', 'Business address'],
        ['site_logo', '/assets/logo.png', 'Site logo path'],
        ['site_favicon', '/assets/favicon.ico', 'Site favicon path'],
        
        // Email settings
        ['email_smtp_host', 'smtp.gmail.com', 'SMTP server host'],
        ['email_smtp_port', '587', 'SMTP server port'],
        ['email_smtp_username', '', 'SMTP username'],
        ['email_smtp_password', '', 'SMTP password'],
        ['email_from_address', 'noreply@localservice.com', 'Default from email address'],
        ['email_from_name', 'Local Service Provider', 'Default from name'],
        
        // Payment settings
        ['payment_currency', 'USD', 'Default currency'],
        ['payment_commission_rate', '10', 'Commission rate percentage'],
        ['payment_tax_rate', '8.5', 'Tax rate percentage'],
        ['payment_stripe_public_key', '', 'Stripe public key'],
        ['payment_stripe_secret_key', '', 'Stripe secret key'],
        
        // Security settings
        ['security_session_timeout', '3600', 'Session timeout in seconds'],
        ['security_max_login_attempts', '5', 'Maximum login attempts'],
        ['security_password_min_length', '8', 'Minimum password length'],
        ['security_require_email_verification', '1', 'Require email verification'],
        
        // API settings
        ['api_rate_limit', '100', 'API rate limit per hour'],
        ['api_key_expiry_days', '365', 'API key expiry in days'],
        
        // Maintenance settings
        ['maintenance_mode', '0', 'Enable maintenance mode'],
        ['maintenance_message', 'Site is under maintenance. Please check back later.', 'Maintenance mode message'],
        
        // Default values
        ['default_currency', 'USD', 'Default currency for pricing'],
        ['default_timezone', 'America/New_York', 'Default timezone'],
        ['default_language', 'en', 'Default language'],
        ['max_service_radius', '50', 'Maximum service radius in kilometers']
    ];
    
    $insertQuery = "
        INSERT IGNORE INTO system_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?)
    ";
    
    $stmt = $pdo->prepare($insertQuery);
    
    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
    }
}

// Initialize default settings if this is the first request
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? 'list') === 'list') {
    initializeDefaultSettings($pdo);
}
?>
