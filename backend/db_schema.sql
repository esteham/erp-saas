-- Create database schema for Local Service Provider Network

-- Location hierarchy tables
CREATE TABLE IF NOT EXISTS divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    division_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_district_division (name, division_id)
);

CREATE TABLE IF NOT EXISTS upazilas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_upazila_district (name, district_id)
);

CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upazila_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upazila_id) REFERENCES upazilas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_zone_upazila (name, upazila_id)
);

CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    UNIQUE KEY unique_area_zone (name, zone_id)
);

-- Service categories and services
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'hour',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- User management
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent', 'worker', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    reset_token VARCHAR(255) NULL,
    reset_token_expiry TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Worker/Provider profiles
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    skills TEXT NOT NULL,
    experience INT DEFAULT 0,
    hourly_rate DECIMAL(8,2) DEFAULT 0.00,
    availability ENUM('available', 'busy', 'offline') DEFAULT 'available',
    status ENUM('pending', 'active', 'inactive', 'rejected') DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_user (user_id)
);

-- Worker service assignments
CREATE TABLE IF NOT EXISTS worker_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_service (worker_id, service_id)
);

-- Worker zone assignments
CREATE TABLE IF NOT EXISTS worker_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    zone_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_zone (worker_id, zone_id)
);

-- Service requests
CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    worker_id INT NULL,
    zone_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    urgency ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    price_breakdown JSON NULL,
    scheduled_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- Service reviews and ratings
CREATE TABLE IF NOT EXISTS service_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_request (service_request_id)
);

-- Dynamic pricing rules
CREATE TABLE IF NOT EXISTS zone_pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role, status) VALUES 
('admin', 'admin@localservice.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

-- Insert default categories
INSERT IGNORE INTO categories (name, description, icon) VALUES 
('Electrical', 'Electrical repair and installation services', 'fas fa-bolt'),
('Plumbing', 'Plumbing repair and installation services', 'fas fa-wrench'),
('Cleaning', 'Home and office cleaning services', 'fas fa-broom'),
('Carpentry', 'Wood work and furniture repair services', 'fas fa-hammer'),
('Painting', 'Interior and exterior painting services', 'fas fa-paint-roller'),
('Appliance Repair', 'Home appliance repair services', 'fas fa-tools');

-- Insert default services
INSERT IGNORE INTO services (category_id, name, description, base_price, unit) VALUES 
(1, 'Electrical Wiring', 'Complete electrical wiring for homes and offices', 50.00, 'hour'),
(1, 'Light Installation', 'Installation of lights and fixtures', 25.00, 'piece'),
(2, 'Pipe Repair', 'Repair of leaking or broken pipes', 40.00, 'hour'),
(2, 'Toilet Installation', 'Installation of new toilets', 80.00, 'piece'),
(3, 'House Cleaning', 'Complete house cleaning service', 30.00, 'hour'),
(3, 'Office Cleaning', 'Professional office cleaning', 35.00, 'hour'),
(4, 'Furniture Repair', 'Repair of wooden furniture', 45.00, 'hour'),
(4, 'Cabinet Installation', 'Installation of kitchen cabinets', 60.00, 'hour'),
(5, 'Interior Painting', 'Interior wall painting', 25.00, 'sqft'),
(5, 'Exterior Painting', 'Exterior wall painting', 30.00, 'sqft'),
(6, 'AC Repair', 'Air conditioner repair and maintenance', 55.00, 'hour'),
(6, 'Refrigerator Repair', 'Refrigerator repair service', 50.00, 'hour');

-- Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
('site_name', 'Local Service Provider Network', 'Name of the application'),
('site_email', 'info@localservice.com', 'Contact email for the site'),
('default_currency', 'BDT', 'Default currency for pricing'),
('max_service_radius', '50', 'Maximum service radius in kilometers'),
('commission_rate', '10', 'Commission rate percentage for completed services');
