<?php

class DatabaseConfig {
    // Database configuration
    const DB_HOST = 'localhost';
    const DB_NAME = 'service_provider';
    const DB_USER = 'root';
    const DB_PASS = '';
    const DB_CHARSET = 'utf8mb4';
    
    // PDO options
    const PDO_OPTIONS = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];
    
    public static function getDSN() {
        return "mysql:host=" . self::DB_HOST . ";dbname=" . self::DB_NAME . ";charset=" . self::DB_CHARSET;
    }
    
    public static function getConnection() {
        try {
            $pdo = new PDO(self::getDSN(), self::DB_USER, self::DB_PASS, self::PDO_OPTIONS);
            return $pdo;
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    
    public static function createDatabase() {
        try {
            // Connect without database name to create it
            $dsn = "mysql:host=" . self::DB_HOST . ";charset=" . self::DB_CHARSET;
            $pdo = new PDO($dsn, self::DB_USER, self::DB_PASS, self::PDO_OPTIONS);
            
            // Create database if it doesn't exist
            $pdo->exec("CREATE DATABASE IF NOT EXISTS " . self::DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            return true;
        } catch (PDOException $e) {
            error_log('Database creation failed: ' . $e->getMessage());
            return false;
        }
    }
    
    public static function initializeTables() {
        try {
            $pdo = self::getConnection();
            
            // Read and execute SQL schema
            $schemaFile = __DIR__ . '/../db_schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
                return true;
            }
            
            return false;
        } catch (Exception $e) {
            error_log('Table initialization failed: ' . $e->getMessage());
            return false;
        }
    }
}

?>
