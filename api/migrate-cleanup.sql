-- ============================================================
-- MIGRACIÓN: Limpieza estructural + Historial de Kilometraje
-- Ejecutar UNA sola vez contra vrum_db
-- ============================================================

-- 1. ELIMINAR TABLAS MUERTAS
--    (messages depende de chats, se elimina primero)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS provider_team;

SET FOREIGN_KEY_CHECKS = 1;

-- 2. CREAR TABLA DE HISTORIAL DE KILOMETRAJE
CREATE TABLE IF NOT EXISTS vehicle_mileage_logs (
    id          INT           NOT NULL AUTO_INCREMENT,
    vehicle_id  INT           NOT NULL,
    mileage     INT           NOT NULL,
    source      VARCHAR(50)   NOT NULL DEFAULT 'manual',  -- 'manual' | 'order_completion'
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_mileage_log_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CREAR TABLA DE MÉTRICAS DE NEGOCIO
CREATE TABLE IF NOT EXISTS provider_metrics (
    id                  INT           NOT NULL AUTO_INCREMENT,
    provider_id         INT           NOT NULL,
    date                DATE          NOT NULL,
    profile_views       INT           NOT NULL DEFAULT 0,
    clicks_whatsapp     INT           NOT NULL DEFAULT 0,
    clicks_call         INT           NOT NULL DEFAULT 0,
    clicks_route        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_provider_date (provider_id, date),
    CONSTRAINT fk_metric_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. VERIFICAR INTEGRIDAD DE TABLAS DE VEHÍCULOS
--    (solo inspección — no se modifican)
SELECT 'vehicle_types'  AS tabla, COUNT(*) AS registros FROM vehicle_types
UNION ALL
SELECT 'vehicle_brands',  COUNT(*) FROM vehicle_brands
UNION ALL
SELECT 'vehicle_models',  COUNT(*) FROM vehicle_models
UNION ALL
SELECT 'vehicle_brand_types', COUNT(*) FROM vehicle_brand_types;
