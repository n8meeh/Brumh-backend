-- ============================================
-- MIGRACIÓN: Tablas de productos para proveedores
-- Fecha: 2026-03-17
-- ============================================

-- 1. Categorías de productos
CREATE TABLE IF NOT EXISTS `product_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `icon` VARCHAR(255) NULL,
    `parent_id` INT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_product_categories_slug` (`slug`),
    INDEX `idx_product_categories_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Productos de proveedores
CREATE TABLE IF NOT EXISTS `provider_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `provider_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category_id` INT NULL,
    `vehicle_type_id` INT NULL,
    `brand` VARCHAR(100) NULL,
    `part_number` VARCHAR(100) NULL,
    `condition` ENUM('new', 'used', 'refurbished') NOT NULL DEFAULT 'new',
    `price` DECIMAL(10, 2) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `image_url` VARCHAR(500) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Foreign keys
    CONSTRAINT `fk_products_provider` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_products_vehicle_type` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types`(`id`) ON DELETE SET NULL,
    -- Índices
    INDEX `idx_products_provider` (`provider_id`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_vehicle_type` (`vehicle_type_id`),
    INDEX `idx_products_condition` (`condition`),
    INDEX `idx_products_active` (`is_active`),
    INDEX `idx_products_brand` (`brand`),
    INDEX `idx_products_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insertar categorías iniciales
INSERT INTO `product_categories` (`name`, `slug`, `icon`, `display_order`) VALUES
('Frenos', 'frenos', 'disc', 1),
('Filtros', 'filtros', 'filter', 2),
('Aceites y Lubricantes', 'aceites-lubricantes', 'water', 3),
('Neumáticos', 'neumaticos', 'circle', 4),
('Baterías', 'baterias', 'battery-charging', 5),
('Iluminación', 'iluminacion', 'bulb', 6),
('Suspensión', 'suspension', 'car', 7),
('Motor', 'motor', 'settings', 8),
('Eléctrico', 'electrico', 'flash', 9),
('Carrocería', 'carroceria', 'car-sport', 10),
('Escape', 'escape', 'speedometer', 11),
('Accesorios', 'accesorios', 'bag', 12),
('Herramientas', 'herramientas', 'construct', 13),
('Otros', 'otros', 'ellipsis-horizontal', 14);
