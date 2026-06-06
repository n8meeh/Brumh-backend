-- Migración: Agregar preferencias de notificaciones a los usuarios
ALTER TABLE users ADD COLUMN notification_settings JSON NULL;
