// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario aún existe y está activo
    const usuario = await Usuario.findOne({
      where: { id: decoded.id, activo: true },
      attributes: ['id', 'nombres', 'apellidos', 'email', 'codigo'],
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido: usuario no encontrado o inactivo.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    logger.warn(`Intento de acceso con token inválido: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado. Inicie sesión nuevamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token malformado.' });
    }

    return res.status(500).json({ success: false, message: 'Error interno de autenticación.' });
  }
};

module.exports = authMiddleware;
