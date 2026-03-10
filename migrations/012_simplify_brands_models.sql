-- ==========================================================
-- MIGRACIÓN 012: Simplificar marcas/modelos de vehículos
-- Fecha: 2026-03-07
-- Descripción:
--   - vehicles: Reemplazar model_id (FK) con brand/model (texto) + vehicle_type_id (FK)
--   - providers: Reemplazar tabla pivot provider_brands con columna JSON specialty_brands
--   - Eliminar tablas: vehicle_brands, vehicle_models, vehicle_brand_types, provider_brands
-- ==========================================================

-- --------------------------------------------------------
-- PASO 1: Agregar nuevas columnas a vehicles
-- --------------------------------------------------------
ALTER TABLE `vehicles`
  ADD COLUMN `brand` VARCHAR(100) NOT NULL DEFAULT '' AFTER `model_id`,
  ADD COLUMN `model` VARCHAR(100) NOT NULL DEFAULT '' AFTER `brand`,
  ADD COLUMN `vehicle_type_id` INT NULL AFTER `model`;

-- --------------------------------------------------------
-- PASO 2: Migrar datos de vehicles (copiar marca/modelo desde relaciones)
-- --------------------------------------------------------
UPDATE `vehicles` v
  JOIN `vehicle_models` vm ON v.model_id = vm.id
  JOIN `vehicle_brands` vb ON vm.brand_id = vb.id
SET
  v.brand = vb.name,
  v.model = vm.name,
  v.vehicle_type_id = vm.type_id;

-- --------------------------------------------------------
-- PASO 3: Agregar columna specialty_brands (JSON) a providers
-- --------------------------------------------------------
ALTER TABLE `providers`
  ADD COLUMN `specialty_brands` JSON DEFAULT NULL AFTER `user_id`;

-- --------------------------------------------------------
-- PASO 4: Migrar datos de provider_brands a JSON
-- --------------------------------------------------------
UPDATE `providers` p
SET p.specialty_brands = (
  SELECT JSON_ARRAYAGG(vb.name)
  FROM `provider_brands` pb
  JOIN `vehicle_brands` vb ON pb.brand_id = vb.id
  WHERE pb.provider_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM `provider_brands` pb WHERE pb.provider_id = p.id
);

-- --------------------------------------------------------
-- PASO 5: Eliminar FK y columna model_id de vehicles
-- --------------------------------------------------------
ALTER TABLE `vehicles` DROP FOREIGN KEY `vehicles_ibfk_2`;
ALTER TABLE `vehicles` DROP KEY `model_id`;
ALTER TABLE `vehicles` DROP COLUMN `model_id`;

-- --------------------------------------------------------
-- PASO 6: Agregar FK vehicle_type_id en vehicles
-- --------------------------------------------------------
ALTER TABLE `vehicles`
  ADD CONSTRAINT `fk_vehicles_vehicle_type`
  FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`);

-- --------------------------------------------------------
-- PASO 7: Eliminar FK de provider_brands
-- --------------------------------------------------------
ALTER TABLE `provider_brands` DROP FOREIGN KEY `provider_brands_ibfk_1`;
ALTER TABLE `provider_brands` DROP FOREIGN KEY `provider_brands_ibfk_2`;

-- --------------------------------------------------------
-- PASO 8: Eliminar FK de vehicle_brand_types
-- --------------------------------------------------------
ALTER TABLE `vehicle_brand_types` DROP FOREIGN KEY `vehicle_brand_types_ibfk_1`;
ALTER TABLE `vehicle_brand_types` DROP FOREIGN KEY `vehicle_brand_types_ibfk_2`;

-- --------------------------------------------------------
-- PASO 9: Eliminar FK de vehicle_models
-- --------------------------------------------------------
ALTER TABLE `vehicle_models` DROP FOREIGN KEY `vehicle_models_ibfk_1`;
ALTER TABLE `vehicle_models` DROP FOREIGN KEY `vehicle_models_ibfk_2`;

-- --------------------------------------------------------
-- PASO 10: DROP tablas obsoletas
-- --------------------------------------------------------
DROP TABLE IF EXISTS `provider_brands`;
DROP TABLE IF EXISTS `vehicle_brand_types`;
DROP TABLE IF EXISTS `vehicle_models`;
DROP TABLE IF EXISTS `vehicle_brands`;

-- ==========================================================
-- ¡LISTO! Verificación post-migración:
-- SELECT id, brand, model, vehicle_type_id FROM vehicles LIMIT 10;
-- SELECT id, business_name, specialty_brands FROM providers WHERE specialty_brands IS NOT NULL;
-- ==========================================================
