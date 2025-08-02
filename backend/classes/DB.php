<?php

class DB {
    private static $instance = null;
    private $pdo;
    private $host = 'localhost';
    private $dbname = 'service_provider';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    private $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    private function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
        
        try {
            $this->pdo = new PDO($dsn, $this->username, $this->password, $this->options);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log('Query failed: ' . $e->getMessage());
            throw new Exception('Query execution failed');
        }
    }

    public function fetch($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function insert($table, $data) {
        $columns = implode(',', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($data);
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log('Insert failed: ' . $e->getMessage());
            throw new Exception('Insert operation failed');
        }
    }

    public function update($table, $data, $conditions) {
        $setClause = [];
        foreach ($data as $key => $value) {
            $setClause[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setClause);
        
        $whereClause = [];
        foreach ($conditions as $key => $value) {
            $whereClause[] = "{$key} = :where_{$key}";
            $data["where_{$key}"] = $value;
        }
        $whereClause = implode(' AND ', $whereClause);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$whereClause}";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            error_log('Update failed: ' . $e->getMessage());
            throw new Exception('Update operation failed');
        }
    }

    public function delete($table, $conditions) {
        $whereClause = [];
        foreach ($conditions as $key => $value) {
            $whereClause[] = "{$key} = :{$key}";
        }
        $whereClause = implode(' AND ', $whereClause);
        
        $sql = "DELETE FROM {$table} WHERE {$whereClause}";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($conditions);
        } catch (PDOException $e) {
            error_log('Delete failed: ' . $e->getMessage());
            throw new Exception('Delete operation failed');
        }
    }

    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    public function commit() {
        return $this->pdo->commit();
    }

    public function rollback() {
        return $this->pdo->rollback();
    }

    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

?>