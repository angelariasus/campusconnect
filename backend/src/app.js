// src/app.js - Punto de entrada principal de CampusConnect API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./config/logger');
const { connectDB } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// ─── SEGURIDAD ────────────────────────────────────────────────────────────────
// Helmet: cabeceras HTTP de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors());

// Rate limiting global: 100 req / 15 min por IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente nuevamente en unos minutos.',
  },
});
app.use('/api/', limiter);

// Rate limiting más estricto para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intente en 15 minutos.',
  },
});
app.use('/api/auth/login', loginLimiter);

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(compression()); // Compresión gzip
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger de peticiones HTTP
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.path === '/api/health',
}));

// Servir archivos estáticos (uploads) - Nginx debería manejar esto en producción
app.use('/uploads', express.static(path.join(process.env.STORAGE_PATH || './uploads')));

// ─── RUTAS ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: 'CampusConnect API',
    version: '1.0.0',
    universidad: 'Innovatec',
    docs: '/api/health',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Error global
app.use((err, req, res, next) => {
  logger.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message,
  });
});

// ─── INICIO ───────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`CampusConnect API corriendo en puerto ${PORT}`);
    logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();

module.exports = app; // Para tests
