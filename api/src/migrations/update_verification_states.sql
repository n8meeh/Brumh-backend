-- Migración: Cambiar is_verified de tinyint(1)/boolean a smallint (estados 0-3)
-- TypeORM convierte tinyint(1) a boolean, por eso usamos smallint
-- 0 = Nuevo, 1 = Verificado, 2 = En Investigación, 3 = Baneado

-- Paso 1: Cambiar el tipo de columna de tinyint(1) a smallint
ALTER TABLE providers MODIFY COLUMN is_verified SMALLINT NOT NULL DEFAULT 0;

-- Paso 2: Los valores existentes se mantienen (0 y 1 siguen siendo válidos)

-- Verificar resultado
SELECT id, business_name, is_verified FROM providers;
