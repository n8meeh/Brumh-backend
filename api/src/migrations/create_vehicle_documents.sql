-- Migración: Crear tabla de documentos de vehículos
CREATE TABLE vehicle_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    type ENUM('soap', 'revision_tecnica', 'permiso_circulacion', 'padron', 'seguro_complementario', 'otro') NOT NULL DEFAULT 'otro',
    label VARCHAR(100) NULL,
    photo_url VARCHAR(500) NOT NULL,
    expiry_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
