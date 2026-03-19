-- =====================================================
-- MIGRACIÓN: Sistema de Grupos
-- Ejecutar en MySQL antes de hacer docker-compose up --build
-- =====================================================

-- 1. Tabla de grupos
CREATE TABLE IF NOT EXISTS `groups` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(200) NULL,
    `image_url` VARCHAR(500) NULL,
    `creator_id` INT NOT NULL,
    `is_public` TINYINT(1) NOT NULL DEFAULT 1,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `members_count` INT NOT NULL DEFAULT 1,
    `posts_count` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de miembros del grupo
CREATE TABLE IF NOT EXISTS `group_members` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `group_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `role` ENUM('creator', 'admin', 'member') NOT NULL DEFAULT 'member',
    `status` ENUM('active', 'pending', 'banned') NOT NULL DEFAULT 'active',
    `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_group_user` (`group_id`, `user_id`),
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Agregar columna group_id a posts
ALTER TABLE `posts` ADD COLUMN `group_id` INT NULL AFTER `is_professional`;
ALTER TABLE `posts` ADD FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE SET NULL;

-- 4. Índices para rendimiento
CREATE INDEX `idx_groups_creator` ON `groups`(`creator_id`);
CREATE INDEX `idx_groups_active_public` ON `groups`(`is_active`, `is_public`);
CREATE INDEX `idx_group_members_user` ON `group_members`(`user_id`, `status`);
CREATE INDEX `idx_posts_group` ON `posts`(`group_id`);
