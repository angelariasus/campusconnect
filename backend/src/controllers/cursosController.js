// src/controllers/cursosController.js
const { Curso, Matricula, Material, Tarea } = require('../models');
const logger = require('../config/logger');

// GET /api/cursos - Lista de cursos del alumno autenticado
const getCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        {
          model: require('../models').Usuario,
          through: {
            model: Matricula,
            where: { usuario_id: req.usuario.id, estado: 'activo' },
            attributes: ['estado', 'fecha_matricula'],
          },
          attributes: [],
          required: true,
        },
      ],
      attributes: ['id', 'codigo', 'nombre', 'descripcion', 'creditos', 'semestre', 'docente'],
      where: { activo: true },
      order: [['nombre', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      total: cursos.length,
      data: cursos,
    });
  } catch (error) {
    logger.error('Error en getCursos:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener cursos.' });
  }
};

// GET /api/cursos/:id - Detalle de un curso específico
const getCursoById = async (req, res) => {
  try {
    const { id } = req.params;

    const matricula = await Matricula.findOne({
      where: { usuario_id: req.usuario.id, curso_id: id, estado: 'activo' },
    });

    if (!matricula) {
      return res.status(403).json({ success: false, message: 'No estás matriculado en este curso.' });
    }

    const curso = await Curso.findOne({
      where: { id, activo: true },
      include: [
        {
          model: Tarea,
          as: 'tareas',
          where: { activo: true },
          required: false,
          attributes: ['id', 'titulo', 'tipo', 'fecha_entrega', 'puntaje_max'],
        },
        {
          model: Material,
          as: 'materiales',
          where: { activo: true },
          required: false,
          attributes: ['id', 'titulo', 'tipo', 'descripcion'],
        },
      ],
    });

    if (!curso) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado.' });
    }

    return res.status(200).json({ success: true, data: curso });
  } catch (error) {
    logger.error('Error en getCursoById:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener el curso.' });
  }
};

module.exports = { getCursos, getCursoById };
