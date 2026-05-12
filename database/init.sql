-- ─────────────────────────────────────────────────────────────────────────────
-- database/init.sql - Inicialización de CampusConnect DB
-- Se ejecuta automáticamente al crear el contenedor PostgreSQL
-- ─────────────────────────────────────────────────────────────────────────────

-- Habilitar extensión para UUIDs (opcional, para futura migración)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar pg_trgm para búsquedas de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Configurar timezone para Perú
SET timezone = 'America/Lima';

-- ─── Comentario del esquema ───────────────────────────────────────────────────
COMMENT ON DATABASE campusconnect_db IS 'Base de datos principal de CampusConnect - Universidad Innovatec';
