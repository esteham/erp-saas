<?php
// Authentication middleware functions

function isAuthenticated() {
    // Check if user is logged in via session
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function getCurrentUser() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isAuthenticated()) {
        return null;
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role, status FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Get current user error: " . $e->getMessage());
        return null;
    }
}

function isAdmin() {
    $user = getCurrentUser();
    return $user && $user['role'] === 'admin';
}

function isAgent() {
    $user = getCurrentUser();
    return $user && $user['role'] === 'agent';
}

function isWorker() {
    $user = getCurrentUser();
    return $user && $user['role'] === 'worker';
}

function hasRole($role) {
    $user = getCurrentUser();
    return $user && $user['role'] === $role;
}

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
}

function requireRole($role) {
    requireAuth();
    if (!hasRole($role)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => ucfirst($role) . ' access required']);
        exit;
    }
}
?>
