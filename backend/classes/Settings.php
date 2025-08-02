<?php

require_once 'DB.php';

class Settings {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    /* ==============
    Settings Management
    ================*/
    public function getAllSettings() {
        try {
            $settings = $this->db->fetchAll("SELECT * FROM system_settings ORDER BY setting_key ASC");
            
            // Convert to key-value pairs for easier access
            $settingsArray = [];
            foreach ($settings as $setting) {
                $settingsArray[$setting['setting_key']] = [
                    'id' => $setting['id'],
                    'value' => $setting['setting_value'],
                    'description' => $setting['description'],
                    'updated_at' => $setting['updated_at']
                ];
            }
            
            return [
                'success' => true,
                'data' => $settingsArray
            ];
        } catch (Exception $e) {
            error_log('Get all settings failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve settings'];
        }
    }
    
    public function getSettingByKey($key) {
        try {
            $setting = $this->db->fetch(
                "SELECT * FROM system_settings WHERE setting_key = ?",
                [$key]
            );
            
            if (!$setting) {
                return ['success' => false, 'message' => 'Setting not found'];
            }
            
            return [
                'success' => true,
                'data' => $setting
            ];
        } catch (Exception $e) {
            error_log('Get setting failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve setting'];
        }
    }
    
    public function getSettingValue($key, $defaultValue = null) {
        try {
            $setting = $this->db->fetch(
                "SELECT setting_value FROM system_settings WHERE setting_key = ?",
                [$key]
            );
            
            return $setting ? $setting['setting_value'] : $defaultValue;
        } catch (Exception $e) {
            error_log('Get setting value failed: ' . $e->getMessage());
            return $defaultValue;
        }
    }
    
    public function setSetting($key, $value, $description = '') {
        if (empty($key)) {
            return ['success' => false, 'message' => 'Setting key is required'];
        }
        
        try {
            // Check if setting exists
            $existing = $this->db->fetch(
                "SELECT id FROM system_settings WHERE setting_key = ?",
                [$key]
            );
            
            if ($existing) {
                // Update existing setting
                $updateData = ['setting_value' => $value];
                if (!empty($description)) {
                    $updateData['description'] = $description;
                }
                
                $result = $this->db->update('system_settings', $updateData, ['setting_key' => $key]);
                
                if ($result) {
                    return ['success' => true, 'message' => 'Setting updated successfully'];
                } else {
                    return ['success' => false, 'message' => 'No changes made'];
                }
            } else {
                // Create new setting
                $insertData = [
                    'setting_key' => $key,
                    'setting_value' => $value,
                    'description' => $description
                ];
                
                $settingId = $this->db->insert('system_settings', $insertData);
                
                return [
                    'success' => true,
                    'message' => 'Setting created successfully',
                    'data' => ['id' => $settingId]
                ];
            }
        } catch (Exception $e) {
            error_log('Set setting failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to set setting'];
        }
    }
    
    public function updateMultipleSettings($settings) {
        if (empty($settings) || !is_array($settings)) {
            return ['success' => false, 'message' => 'Settings array is required'];
        }
        
        try {
            $this->db->beginTransaction();
            
            $updatedCount = 0;
            foreach ($settings as $key => $data) {
                $value = is_array($data) ? $data['value'] : $data;
                $description = is_array($data) ? ($data['description'] ?? '') : '';
                
                $result = $this->setSetting($key, $value, $description);
                if ($result['success']) {
                    $updatedCount++;
                }
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "Successfully updated $updatedCount settings",
                'data' => ['updated_count' => $updatedCount]
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Update multiple settings failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update settings'];
        }
    }
    
    public function deleteSetting($key) {
        try {
            $result = $this->db->delete('system_settings', ['setting_key' => $key]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Setting deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Setting not found'];
            }
        } catch (Exception $e) {
            error_log('Delete setting failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete setting'];
        }
    }
    
    /* ==============
    Predefined Settings Management
    ================*/
    public function getGeneralSettings() {
        $keys = [
            'site_name',
            'site_email',
            'site_phone',
            'site_address',
            'site_description',
            'site_logo',
            'site_favicon',
            'timezone',
            'date_format',
            'time_format'
        ];
        
        return $this->getSettingsByKeys($keys);
    }
    
    public function getBusinessSettings() {
        $keys = [
            'default_currency',
            'currency_symbol',
            'tax_rate',
            'commission_rate',
            'service_fee',
            'max_service_radius',
            'min_order_amount',
            'business_hours_start',
            'business_hours_end',
            'working_days'
        ];
        
        return $this->getSettingsByKeys($keys);
    }
    
    public function getNotificationSettings() {
        $keys = [
            'email_notifications',
            'sms_notifications',
            'push_notifications',
            'notification_email',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'smtp_encryption',
            'sms_provider',
            'sms_api_key'
        ];
        
        return $this->getSettingsByKeys($keys);
    }
    
    public function getPaymentSettings() {
        $keys = [
            'payment_methods',
            'stripe_public_key',
            'stripe_secret_key',
            'paypal_client_id',
            'paypal_client_secret',
            'payment_gateway',
            'auto_payout',
            'payout_threshold',
            'payout_schedule'
        ];
        
        return $this->getSettingsByKeys($keys);
    }
    
    public function getSecuritySettings() {
        $keys = [
            'password_min_length',
            'password_require_uppercase',
            'password_require_lowercase',
            'password_require_numbers',
            'password_require_symbols',
            'login_attempts_limit',
            'login_lockout_duration',
            'session_timeout',
            'two_factor_auth',
            'captcha_enabled'
        ];
        
        return $this->getSettingsByKeys($keys);
    }
    
    private function getSettingsByKeys($keys) {
        try {
            $placeholders = str_repeat('?,', count($keys) - 1) . '?';
            $sql = "SELECT * FROM system_settings WHERE setting_key IN ($placeholders)";
            $settings = $this->db->fetchAll($sql, $keys);
            
            // Convert to key-value pairs
            $settingsArray = [];
            foreach ($settings as $setting) {
                $settingsArray[$setting['setting_key']] = [
                    'id' => $setting['id'],
                    'value' => $setting['setting_value'],
                    'description' => $setting['description'],
                    'updated_at' => $setting['updated_at']
                ];
            }
            
            // Add missing keys with null values
            foreach ($keys as $key) {
                if (!isset($settingsArray[$key])) {
                    $settingsArray[$key] = [
                        'id' => null,
                        'value' => null,
                        'description' => null,
                        'updated_at' => null
                    ];
                }
            }
            
            return [
                'success' => true,
                'data' => $settingsArray
            ];
        } catch (Exception $e) {
            error_log('Get settings by keys failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve settings'];
        }
    }
    
    /* ==============
    Settings Validation
    ================*/
    public function validateSetting($key, $value) {
        switch ($key) {
            case 'site_email':
            case 'notification_email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return ['valid' => false, 'message' => 'Invalid email format'];
                }
                break;
                
            case 'tax_rate':
            case 'commission_rate':
            case 'service_fee':
                if (!is_numeric($value) || $value < 0 || $value > 100) {
                    return ['valid' => false, 'message' => 'Value must be a number between 0 and 100'];
                }
                break;
                
            case 'max_service_radius':
            case 'min_order_amount':
            case 'payout_threshold':
                if (!is_numeric($value) || $value < 0) {
                    return ['valid' => false, 'message' => 'Value must be a positive number'];
                }
                break;
                
            case 'password_min_length':
            case 'login_attempts_limit':
            case 'login_lockout_duration':
            case 'session_timeout':
                if (!is_numeric($value) || $value < 1) {
                    return ['valid' => false, 'message' => 'Value must be a positive integer'];
                }
                break;
                
            case 'smtp_port':
                if (!is_numeric($value) || $value < 1 || $value > 65535) {
                    return ['valid' => false, 'message' => 'Port must be between 1 and 65535'];
                }
                break;
                
            case 'business_hours_start':
            case 'business_hours_end':
                if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $value)) {
                    return ['valid' => false, 'message' => 'Time must be in HH:MM format'];
                }
                break;
                
            case 'working_days':
                $validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                $days = is_array($value) ? $value : explode(',', $value);
                foreach ($days as $day) {
                    if (!in_array(strtolower(trim($day)), $validDays)) {
                        return ['valid' => false, 'message' => 'Invalid day specified'];
                    }
                }
                break;
        }
        
        return ['valid' => true];
    }
    
    /* ==============
    Settings Backup and Restore
    ================*/
    public function backupSettings() {
        try {
            $settings = $this->db->fetchAll("SELECT * FROM system_settings");
            
            $backup = [
                'timestamp' => date('Y-m-d H:i:s'),
                'settings' => $settings
            ];
            
            return [
                'success' => true,
                'data' => $backup
            ];
        } catch (Exception $e) {
            error_log('Backup settings failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to backup settings'];
        }
    }
    
    public function restoreSettings($backup) {
        if (empty($backup['settings']) || !is_array($backup['settings'])) {
            return ['success' => false, 'message' => 'Invalid backup data'];
        }
        
        try {
            $this->db->beginTransaction();
            
            // Clear existing settings
            $this->db->query("DELETE FROM system_settings");
            
            // Restore settings
            $restoredCount = 0;
            foreach ($backup['settings'] as $setting) {
                $insertData = [
                    'setting_key' => $setting['setting_key'],
                    'setting_value' => $setting['setting_value'],
                    'description' => $setting['description']
                ];
                
                $this->db->insert('system_settings', $insertData);
                $restoredCount++;
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "Successfully restored $restoredCount settings",
                'data' => ['restored_count' => $restoredCount]
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Restore settings failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to restore settings'];
        }
    }
    
    /* ==============
    Settings Cache Management
    ================*/
    public function clearSettingsCache() {
        // If you implement caching in the future, clear it here
        return ['success' => true, 'message' => 'Settings cache cleared'];
    }
    
    public function getSettingsLastModified() {
        try {
            $result = $this->db->fetch(
                "SELECT MAX(updated_at) as last_modified FROM system_settings"
            );
            
            return [
                'success' => true,
                'data' => ['last_modified' => $result['last_modified']]
            ];
        } catch (Exception $e) {
            error_log('Get settings last modified failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get last modified time'];
        }
    }
}

?>
