// src/routes/index.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const { login, logout, me, loginValidations } = require('../controllers/authController');
const { getCursos, getCursoById } = require('../controllers/cursosController');
const { getTareas, getTareaById } = require('../controllers/tareasController');
const { getNotas } = require('../controllers/notasController');
const { getMateriales, descargarMaterial } = require('../controllers/materialesController');
const { getNotificaciones, marcarLeida, marcarTodasLeidas } = require('../controllers/notificacionesController');

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'CampusConnect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ─── AUTH (pública) ────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/auth/login', loginValidations, login);

// ─── RUTAS PROTEGIDAS (requieren JWT) ─────────────────────────────────────────
router.use(authMiddleware);

// Auth
router.post('/auth/logout', logout);
router.get('/auth/me', me);

// Cursos
// GET /api/cursos          → lista de cursos matriculados
// GET /api/cursos/:id      → detalle de un curso
router.get('/cursos', getCursos);
router.get('/cursos/:id', getCursoById);

// Tareas
// GET /api/tareas          → tareas pendientes (query: estado, curso_id)
// GET /api/tareas/:id      → detalle de una tarea
router.get('/tareas', getTareas);
router.get('/tareas/:id', getTareaById);

// Notas
// GET /api/notas           → calificaciones (query: curso_id)
router.get('/notas', getNotas);

// Materiales
// GET /api/materiales              → lista de materiales (query: curso_id, tipo)
// GET /api/materiales/:id/descargar → descargar archivo
router.get('/materiales', getMateriales);
router.get('/materiales/:id/descargar', descargarMaterial);

// Notificaciones
// GET   /api/notificaciones             → lista (query: leida, limit, offset)
// PATCH /api/notificaciones/:id/leer   → marcar una como leída
// PATCH /api/notificaciones/leer-todas → marcar todas como leídas
router.get('/notificaciones', getNotificaciones);
router.patch('/notificaciones/leer-todas', marcarTodasLeidas);
router.patch('/notificaciones/:id/leer', marcarLeida);

module.exports = router;
