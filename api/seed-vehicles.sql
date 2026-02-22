-- =============================================================
-- Seed: Vehículos más vendidos en Chile (20 marcas + modelos)
-- Compatible con MySQL 5.7+ / MariaDB
-- Uso: mysql -u root -p nombre_bd < seed-vehicles.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE vehicle_models;
TRUNCATE TABLE vehicle_brand_types;
TRUNCATE TABLE vehicle_brands;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- 1. Tipos de vehículo (INSERT IGNORE para no duplicar si ya existen)
-- =============================================================
INSERT IGNORE INTO vehicle_types (name, icon_url) VALUES
  ('Auto', NULL),
  ('SUV', NULL),
  ('Camioneta', NULL),
  ('Moto', NULL);

-- =============================================================
-- 2. Marcas
-- =============================================================
INSERT INTO vehicle_brands (name, logo_url) VALUES
  ('Toyota',      NULL),   -- 1
  ('Hyundai',     NULL),   -- 2
  ('Nissan',      NULL),   -- 3
  ('Kia',         NULL),   -- 4
  ('Chevrolet',   NULL),   -- 5
  ('Suzuki',      NULL),   -- 6
  ('Mazda',       NULL),   -- 7
  ('Honda',       NULL),   -- 8
  ('Yamaha',      NULL),   -- 9
  ('Mitsubishi',  NULL),   -- 10
  ('Volkswagen',  NULL),   -- 11
  ('Ford',        NULL),   -- 12
  ('Jeep',        NULL),   -- 13
  ('Subaru',      NULL),   -- 14
  ('Renault',     NULL),   -- 15
  ('Great Wall',  NULL),   -- 16
  ('Chery',       NULL),   -- 17
  ('BYD',         NULL),   -- 18
  ('SsangYong',   NULL),   -- 19
  ('Fiat',        NULL);   -- 20

-- =============================================================
-- 3. Relaciones marca ↔ tipo (vehicle_brand_types)
-- Usamos subqueries por nombre para no depender de IDs fijos.
-- =============================================================

-- Toyota → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Toyota' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Hyundai → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Hyundai' AND t.name IN ('Auto', 'SUV');

-- Nissan → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Nissan' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Kia → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Kia' AND t.name IN ('Auto', 'SUV');

-- Chevrolet → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Chevrolet' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Suzuki → Auto, SUV, Moto
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Suzuki' AND t.name IN ('Auto', 'SUV', 'Moto');

-- Mazda → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Mazda' AND t.name IN ('Auto', 'SUV');

-- Honda → Auto, SUV, Moto
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Honda' AND t.name IN ('Auto', 'SUV', 'Moto');

-- Yamaha → Moto
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Yamaha' AND t.name = 'Moto';

-- Mitsubishi → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Mitsubishi' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Volkswagen → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Volkswagen' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Ford → Auto, SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Ford' AND t.name IN ('Auto', 'SUV', 'Camioneta');

-- Jeep → SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Jeep' AND t.name = 'SUV';

-- Subaru → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Subaru' AND t.name IN ('Auto', 'SUV');

-- Renault → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Renault' AND t.name IN ('Auto', 'SUV');

-- Great Wall → SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Great Wall' AND t.name IN ('SUV', 'Camioneta');

-- Chery → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Chery' AND t.name IN ('Auto', 'SUV');

-- BYD → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'BYD' AND t.name IN ('Auto', 'SUV');

-- SsangYong → SUV, Camioneta
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'SsangYong' AND t.name IN ('SUV', 'Camioneta');

-- Fiat → Auto, SUV
INSERT INTO vehicle_brand_types (brand_id, type_id)
SELECT b.id, t.id FROM vehicle_brands b CROSS JOIN vehicle_types t
WHERE b.name = 'Fiat' AND t.name IN ('Auto', 'SUV');

-- =============================================================
-- 4. Modelos
-- =============================================================

-- TOYOTA
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto'      AS type_name, 'Corolla'  AS model_name UNION ALL
    SELECT 'Auto',      'Yaris'    UNION ALL
    SELECT 'SUV',       'RAV4'     UNION ALL
    SELECT 'SUV',       'C-HR'     UNION ALL
    SELECT 'Camioneta', 'Hilux'
  ) m ON t.name = m.type_name
WHERE b.name = 'Toyota';

-- HYUNDAI
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Accent'    AS model_name UNION ALL
    SELECT 'Auto',              'i10'       UNION ALL
    SELECT 'SUV',               'Tucson'    UNION ALL
    SELECT 'SUV',               'Santa Fe'  UNION ALL
    SELECT 'SUV',               'Creta'
  ) m ON t.name = m.type_name
WHERE b.name = 'Hyundai';

-- NISSAN
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto'      AS type_name, 'Sentra'   AS model_name UNION ALL
    SELECT 'SUV',                    'Kicks'    UNION ALL
    SELECT 'SUV',                    'X-Trail'  UNION ALL
    SELECT 'Camioneta',              'Frontier' UNION ALL
    SELECT 'Camioneta',              'Navara'
  ) m ON t.name = m.type_name
WHERE b.name = 'Nissan';

-- KIA
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Rio'       AS model_name UNION ALL
    SELECT 'Auto',              'Picanto'   UNION ALL
    SELECT 'SUV',               'Sportage'  UNION ALL
    SELECT 'SUV',               'Stonic'    UNION ALL
    SELECT 'SUV',               'Sorento'
  ) m ON t.name = m.type_name
WHERE b.name = 'Kia';

-- CHEVROLET
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto'      AS type_name, 'Sail'    AS model_name UNION ALL
    SELECT 'Auto',                   'Spark'   UNION ALL
    SELECT 'SUV',                    'Tracker' UNION ALL
    SELECT 'SUV',                    'Captiva' UNION ALL
    SELECT 'Camioneta',              'D-MAX'
  ) m ON t.name = m.type_name
WHERE b.name = 'Chevrolet';

-- SUZUKI
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Swift'        AS model_name UNION ALL
    SELECT 'SUV',               'Vitara'       UNION ALL
    SELECT 'SUV',               'Grand Vitara' UNION ALL
    SELECT 'Moto',              'GN 125'       UNION ALL
    SELECT 'Moto',              'GSX-S125'
  ) m ON t.name = m.type_name
WHERE b.name = 'Suzuki';

-- MAZDA
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Mazda 3'  AS model_name UNION ALL
    SELECT 'Auto',              'Mazda 6'  UNION ALL
    SELECT 'SUV',               'CX-5'     UNION ALL
    SELECT 'SUV',               'CX-30'
  ) m ON t.name = m.type_name
WHERE b.name = 'Mazda';

-- HONDA
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Civic'   AS model_name UNION ALL
    SELECT 'Auto',              'City'    UNION ALL
    SELECT 'SUV',               'CR-V'    UNION ALL
    SELECT 'Moto',              'CB500F'  UNION ALL
    SELECT 'Moto',              'CB500X'  UNION ALL
    SELECT 'Moto',              'CRF300L'
  ) m ON t.name = m.type_name
WHERE b.name = 'Honda';

-- YAMAHA
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Moto' AS type_name, 'MT-03'    AS model_name UNION ALL
    SELECT 'Moto',              'MT-07'    UNION ALL
    SELECT 'Moto',              'YZF-R3'   UNION ALL
    SELECT 'Moto',              'FZ25'     UNION ALL
    SELECT 'Moto',              'NMAX 155' UNION ALL
    SELECT 'Moto',              'Fazer 250'
  ) m ON t.name = m.type_name
WHERE b.name = 'Yamaha';

-- MITSUBISHI
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'SUV'       AS type_name, 'Eclipse Cross' AS model_name UNION ALL
    SELECT 'SUV',                    'ASX'           UNION ALL
    SELECT 'SUV',                    'Outlander'     UNION ALL
    SELECT 'Camioneta',              'L200'
  ) m ON t.name = m.type_name
WHERE b.name = 'Mitsubishi';

-- VOLKSWAGEN
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto'      AS type_name, 'Gol'     AS model_name UNION ALL
    SELECT 'Auto',                   'Polo'    UNION ALL
    SELECT 'SUV',                    'Tiguan'  UNION ALL
    SELECT 'Camioneta',              'Amarok'
  ) m ON t.name = m.type_name
WHERE b.name = 'Volkswagen';

-- FORD
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'SUV'       AS type_name, 'EcoSport' AS model_name UNION ALL
    SELECT 'SUV',                    'Escape'   UNION ALL
    SELECT 'Camioneta',              'Ranger'   UNION ALL
    SELECT 'Camioneta',              'F-150'
  ) m ON t.name = m.type_name
WHERE b.name = 'Ford';

-- JEEP
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'SUV' AS type_name, 'Compass'   AS model_name UNION ALL
    SELECT 'SUV',              'Wrangler'  UNION ALL
    SELECT 'SUV',              'Cherokee'  UNION ALL
    SELECT 'SUV',              'Renegade'
  ) m ON t.name = m.type_name
WHERE b.name = 'Jeep';

-- SUBARU
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Impreza' AS model_name UNION ALL
    SELECT 'SUV',               'Outback' UNION ALL
    SELECT 'SUV',               'Forester'
  ) m ON t.name = m.type_name
WHERE b.name = 'Subaru';

-- RENAULT
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Logan'   AS model_name UNION ALL
    SELECT 'Auto',              'Sandero' UNION ALL
    SELECT 'Auto',              'Kwid'    UNION ALL
    SELECT 'SUV',               'Duster'  UNION ALL
    SELECT 'SUV',               'Stepway'
  ) m ON t.name = m.type_name
WHERE b.name = 'Renault';

-- GREAT WALL
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'SUV'       AS type_name, 'Haval H6'  AS model_name UNION ALL
    SELECT 'SUV',                    'Haval H2'  UNION ALL
    SELECT 'SUV',                    'Haval Jolion' UNION ALL
    SELECT 'Camioneta',              'Poer'
  ) m ON t.name = m.type_name
WHERE b.name = 'Great Wall';

-- CHERY
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Arrizo 5'   AS model_name UNION ALL
    SELECT 'SUV',               'Tiggo 2'    UNION ALL
    SELECT 'SUV',               'Tiggo 4 Pro'UNION ALL
    SELECT 'SUV',               'Tiggo 8'
  ) m ON t.name = m.type_name
WHERE b.name = 'Chery';

-- BYD
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Dolphin' AS model_name UNION ALL
    SELECT 'Auto',              'Han'     UNION ALL
    SELECT 'SUV',               'Atto 3'  UNION ALL
    SELECT 'SUV',               'Tang'
  ) m ON t.name = m.type_name
WHERE b.name = 'BYD';

-- SSANGYONG
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'SUV'       AS type_name, 'Tivoli'  AS model_name UNION ALL
    SELECT 'SUV',                    'Rexton'  UNION ALL
    SELECT 'SUV',                    'Korando' UNION ALL
    SELECT 'Camioneta',              'Musso'
  ) m ON t.name = m.type_name
WHERE b.name = 'SsangYong';

-- FIAT
INSERT INTO vehicle_models (brand_id, type_id, name)
SELECT b.id, t.id, m.model_name FROM vehicle_brands b
  JOIN vehicle_types t
  JOIN (
    SELECT 'Auto' AS type_name, 'Argo'   AS model_name UNION ALL
    SELECT 'Auto',              'Cronos' UNION ALL
    SELECT 'SUV',               'Pulse'
  ) m ON t.name = m.type_name
WHERE b.name = 'Fiat';

-- =============================================================
-- Verificación rápida (opcional, descomentar para revisar)
-- =============================================================
-- SELECT COUNT(*) AS total_brands  FROM vehicle_brands;
-- SELECT COUNT(*) AS total_types   FROM vehicle_brand_types;
-- SELECT COUNT(*) AS total_models  FROM vehicle_models;
-- SELECT b.name AS marca, t.name AS tipo, m.name AS modelo
--   FROM vehicle_models m
--   JOIN vehicle_brands b ON b.id = m.brand_id
--   JOIN vehicle_types  t ON t.id = m.type_id
--   ORDER BY b.name, t.name, m.name;
