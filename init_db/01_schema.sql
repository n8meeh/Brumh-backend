-- ==========================================================
-- ESTRUCTURA DE BASE DE DATOS MAESTRA - APP VRUM
-- Versión: 13.2 (FINAL FIX - Columna Faltante Agregada)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS vrum_db;
USE vrum_db;

-- 1. USUARIOS (Corregido: Agregado is_visible)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio VARCHAR(255), 
    role ENUM('user', 'provider', 'admin') DEFAULT 'user',
    avatar_url VARCHAR(255),
    current_session_token VARCHAR(255) NULL,
    fcm_token VARCHAR(255),
    
    last_login_at DATETIME DEFAULT NOW(),
    is_visible BOOLEAN DEFAULT TRUE, -- <--- ESTA ERA LA QUE FALTABA
    deleted_at DATETIME NULL DEFAULT NULL,
    
    solutions_count INT DEFAULT 0,
    strikes_count INT DEFAULT 0,
    banned_until DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_follows (
    follower_id INT NOT NULL, 
    followed_id INT NOT NULL, 
    PRIMARY KEY (follower_id, followed_id), 
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('social_like', 'social_comment', 'order_update', 'chat_message', 'post_solved', 'system') NOT NULL,
    title VARCHAR(100),
    body VARCHAR(255),
    related_id INT, 
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. VEHÍCULOS
CREATE TABLE vehicle_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, 
    icon_url VARCHAR(255) 
);

CREATE TABLE vehicle_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    logo_url VARCHAR(255)
);

CREATE TABLE vehicle_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    type_id INT NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id),
    FOREIGN KEY (type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    model_id INT NOT NULL,
    year INT,
    plate VARCHAR(20),
    vin VARCHAR(100), 
    alias VARCHAR(50), 
    last_mileage INT DEFAULT 0,
    photo_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES vehicle_models(id)
);

-- 3. PROVEEDORES
CREATE TABLE providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL, 
    business_name VARCHAR(150) NOT NULL,
    description TEXT,
    category ENUM('mechanic', 'electrician', 'body_shop', 'tires', 'audio_security', 'tow', 'wash', 'store', 'driving_school', 'other') NOT NULL,
    secondary_categories JSON NULL,
    contacts JSON,
    opening_hours VARCHAR(100) NULL,
    is_multibrand BOOLEAN DEFAULT FALSE,
    is_home_service BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    address VARCHAR(255),
    logo_url VARCHAR(500) NULL,
    cover_url VARCHAR(500) NULL,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    identity_docs_url JSON NULL,
    verification_status ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'unverified',
    device_fingerprint VARCHAR(255), 
    trial_abuse_score INT DEFAULT 0, 
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE provider_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, 
    vehicle_type_id INT NOT NULL, 
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE provider_team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'staff', 'viewer') DEFAULT 'staff',
    status ENUM('active', 'inactive') DEFAULT 'active',
    UNIQUE(provider_id, user_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE provider_brands (
    provider_id INT NOT NULL,
    brand_id INT NOT NULL,
    PRIMARY KEY (provider_id, brand_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE CASCADE
);

-- 4. SOCIAL
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, 
    usage_count INT DEFAULT 0
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL, 
    vehicle_id INT NULL, 
    content TEXT, 
    media_url VARCHAR(255),
    is_poll BOOLEAN DEFAULT FALSE,
    poll_options JSON NULL, 
    is_solved BOOLEAN DEFAULT FALSE,
    visibility ENUM('public', 'users_only', 'mechanics_only', 'tow_only') DEFAULT 'public',
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    comments_count INT DEFAULT 0,
    likes_count INT DEFAULT 0, 
    status ENUM('active', 'hidden', 'flagged') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    option_index INT NOT NULL,
    UNIQUE(user_id, post_id), 
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE post_likes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id), 
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- 5. MARKETPLACE
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    provider_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
    title VARCHAR(100),
    description TEXT,
    is_home_service BOOLEAN DEFAULT FALSE, 
    scheduled_date DATETIME NULL,
    final_price DECIMAL(10, 2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE order_negotiations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    proposed_by INT NOT NULL, 
    message TEXT,
    attachment_url VARCHAR(255) NULL,
    proposed_price DECIMAL(10, 2) NULL, 
    proposed_date DATETIME NULL,       
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (proposed_by) REFERENCES users(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    provider_id INT NOT NULL,
    author_id INT NOT NULL, 
    rating_overall INT NOT NULL, 
    comment TEXT,
    provider_reply TEXT NULL,
    rating_comm INT,   
    rating_speed INT,  
    rating_price INT,  
    rating_quality INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 6. NEGOCIO
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    plan ENUM('trial', 'premium') NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    start_date DATETIME,
    end_date DATETIME,
    payment_platform VARCHAR(50), 
    external_reference VARCHAR(255), 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE TABLE native_ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100), 
    image_url VARCHAR(255) NOT NULL, 
    target_url VARCHAR(255) NOT NULL, 
    location ENUM('home_feed', 'map_pin', 'provider_list') DEFAULT 'home_feed',
    is_active BOOLEAN DEFAULT TRUE,
    views_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    date DATE NOT NULL,
    appearances INT DEFAULT 0,
    profile_views INT DEFAULT 0,
    clicks_whatsapp INT DEFAULT 0,
    clicks_call INT DEFAULT 0,
    clicks_route INT DEFAULT 0,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE TABLE content_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_user_id INT NOT NULL,
    content_type ENUM('post', 'comment', 'review', 'user'),
    content_id INT NOT NULL, 
    reason ENUM('spam', 'hate_speech', 'scam', 'other'),
    description TEXT,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);

-- 7. SEGURIDAD
CREATE TABLE user_blocks (
    blocker_id INT NOT NULL, 
    blocked_id INT NOT NULL, 
    reason VARCHAR(50), 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id), 
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. SISTEMA DE ESPECIALIDADES JERÁRQUICO
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255) NULL,
    description TEXT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT NULL,
    icon VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_specialty (category_id, slug)
);

CREATE TABLE provider_specialties (
    provider_id INT NOT NULL,
    specialty_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id, specialty_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
);

CREATE TABLE provider_vehicle_types (
    provider_id INT NOT NULL,
    vehicle_type_id INT NOT NULL,
    PRIMARY KEY (provider_id, vehicle_type_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE CASCADE
);

-- ÍNDICES (Ahora sí funcionará porque el campo is_visible ya existe en users)
CREATE INDEX idx_geo ON providers(lat, lng);
CREATE INDEX idx_provider_status ON providers(is_premium, rating_avg);
CREATE INDEX idx_user_activity ON users(last_login_at, is_visible, deleted_at);
CREATE INDEX idx_specialties_category ON specialties(category_id);
CREATE INDEX idx_provider_specialties_provider ON provider_specialties(provider_id);
CREATE INDEX idx_provider_specialties_specialty ON provider_specialties(specialty_id);