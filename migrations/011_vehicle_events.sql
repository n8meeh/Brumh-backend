-- Migración 011: Tabla vehicle_events (Bitácora de Vida del Vehículo)
-- Registra mantenimientos, reparaciones, inspecciones, documentos y kilometraje

CREATE TABLE `vehicle_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vehicle_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `order_id` INT NULL,
  `type` ENUM('maintenance', 'repair', 'inspection', 'document', 'mileage') NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `cost` DECIMAL(10, 2) NULL,
  `mileage` INT NULL,
  `attachment_url` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_vehicle_events_vehicle` (`vehicle_id`),
  INDEX `idx_vehicle_events_user` (`user_id`),
  INDEX `idx_vehicle_events_type` (`type`),
  INDEX `idx_vehicle_events_order` (`order_id`),
  CONSTRAINT `fk_vehicle_events_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicle_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicle_events_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
