// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario } = require('../models');
const logger = require('../config/logger');

// Validaciones del login
const loginValidations = [
  body('email')
    .isEmail().withMessage('Correo electrónico inválido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];

const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase(), activo: true },
    });

    if (!usuario) {
      logger.warn(`Intento de login fallido para: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      logger.warn(`Contraseña incorrecta para usuario: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Actualizar último login
    await usuario.update({ ultimo_login: new Date() });

    // Generar JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      codigo: usuario.codigo,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: 'campusconnect-api',
    });

    logger.info(`Login exitoso: ${usuario.email} (ID: ${usuario.id})`);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          codigo: usuario.codigo,
        },
        expires_in: process.env.JWT_EXPIRES_IN || '8h',
      },
    });
  } catch (error) {
    logger.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

const logout = async (req, res) => {
  // En JWT stateless, el logout lo maneja el cliente eliminando el token.
  // Aquí se puede implementar una blacklist si se requiere.
  logger.info(`Logout: usuario ID ${req.usuario?.id}`);
  return res.status(200).json({ success: true, message: 'Sesión cerrada correctamente.' });
};

const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.usuario.id,
      nombres: req.usuario.nombres,
      apellidos: req.usuario.apellidos,
      email: req.usuario.email,
      codigo: req.usuario.codigo,
    },
  });
};

module.exports = { login, logout, me, loginValidations };
