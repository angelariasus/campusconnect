// src/controllers/materialesController.js
const path = require('path');
const fs = require('fs');
const { Material, Curso, Matricula } = require('../models');
const logger = require('../config/logger');

// GET /api/materiales - Listar materiales de los cursos matriculados
const getMateriales = async (req, res) => {
  try {
    const { curso_id, tipo } = req.query;

    // Validar que el alumno está matriculado en el curso solicitado
    if (curso_id) {
      const matricula = await Matricula.findOne({
        where: { usuario_id: req.usuario.id, curso_id, estado: 'activo' },
      });
      if (!matricula) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a este curso.' });
      }
    }

    // Obtener cursos matriculados
    const matriculas = await Matricula.findAll({
      where: { usuario_id: req.usuario.id, estado: 'activo' },
      attributes: ['curso_id'],
    });
    const cursosIds = matriculas.map(m => m.curso_id);

    const whereMaterial = { activo: true, curso_id: cursosIds };
    if (curso_id) whereMaterial.curso_id = parseInt(curso_id);
    if (tipo) whereMaterial.tipo = tipo;

    const materiales = await Material.findAll({
      where: whereMaterial,
      include: [{
        model: Curso,
        as: 'curso',
        attributes: ['id', 'codigo', 'nombre'],
      }],
      attributes: ['id', 'titulo', 'descripcion', 'tipo', 'nombre_archivo', 'tamano_bytes', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      total: materiales.length,
      data: materiales,
    });
  } catch (error) {
    logger.error('Error en getMateriales:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener materiales.' });
  }
};

// GET /api/materiales/:id/descargar - Descargar un archivo
const descargarMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findOne({
      where: { id, activo: true },
      include: [{ model: Curso, as: 'curso' }],
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material no encontrado.' });
    }

    // Verificar que el alumno está matriculado
    const matricula = await Matricula.findOne({
      where: { usuario_id: req.usuario.id, curso_id: material.curso_id, estado: 'activo' },
    });

    if (!matricula) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a este material.' });
    }

    // Para materiales de tipo 'enlace', redirigir
    if (material.tipo === 'enlace') {
      return res.redirect(material.archivo_url);
    }

    // Para archivos locales
    const storagePath = process.env.STORAGE_PATH || '/app/uploads';
    const filePath = path.join(storagePath, material.archivo_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado en el servidor.' });
    }

    logger.info(`Descarga: usuario ${req.usuario.id} descargó material ${id}`);

    return res.download(filePath, material.nombre_archivo || path.basename(filePath));
  } catch (error) {
    logger.error('Error en descargarMaterial:', error);
    return res.status(500).json({ success: false, message: 'Error al descargar el material.' });
  }
};

module.exports = { getMateriales, descargarMaterial };
