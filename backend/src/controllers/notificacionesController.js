// src/controllers/notificacionesController.js
const { Notificacion } = require('../models');
const logger = require('../config/logger');

// GET /api/notificaciones
const getNotificaciones = async (req, res) => {
  try {
    const { leida, limit = 20, offset = 0 } = req.query;

    const where = { usuario_id: req.usuario.id };
    if (leida !== undefined) where.leida = leida === 'true';

    const { count, rows } = await Notificacion.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      total: count,
      no_leidas: await Notificacion.count({ where: { usuario_id: req.usuario.id, leida: false } }),
      data: rows,
    });
  } catch (error) {
    logger.error('Error en getNotificaciones:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener notificaciones.' });
  }
};

// PATCH /api/notificaciones/:id/leer
const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notificacion.findOne({
      where: { id, usuario_id: req.usuario.id },
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
    }

    await notif.update({ leida: true, fecha_leida: new Date() });

    return res.status(200).json({ success: true, message: 'Notificación marcada como leída.' });
  } catch (error) {
    logger.error('Error en marcarLeida:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar notificación.' });
  }
};

// PATCH /api/notificaciones/leer-todas
const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leida: true, fecha_leida: new Date() },
      { where: { usuario_id: req.usuario.id, leida: false } }
    );
    return res.status(200).json({ success: true, message: 'Todas las notificaciones marcadas como leídas.' });
  } catch (error) {
    logger.error('Error en marcarTodasLeidas:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar notificaciones.' });
  }
};

module.exports = { getNotificaciones, marcarLeida, marcarTodasLeidas };
