// src/controllers/tareasController.js
const { Op } = require('sequelize');
const { Tarea, Entrega, Curso, Matricula } = require('../models');
const logger = require('../config/logger');

// GET /api/tareas - Lista de tareas pendientes del alumno
const getTareas = async (req, res) => {
  try {
    const { estado, curso_id } = req.query;

    // Obtener IDs de cursos matriculados
    const matriculas = await Matricula.findAll({
      where: { usuario_id: req.usuario.id, estado: 'activo' },
      attributes: ['curso_id'],
    });
    const cursosIds = matriculas.map(m => m.curso_id);

    if (cursosIds.length === 0) {
      return res.status(200).json({ success: true, total: 0, data: [] });
    }

    // Filtro de cursos
    const whereCurso = { activo: true };
    if (curso_id) whereCurso.id = curso_id;

    const whereTarea = {
      curso_id: { [Op.in]: cursosIds },
      activo: true,
    };

    // Buscar tareas con sus entregas del alumno
    const tareas = await Tarea.findAll({
      where: whereTarea,
      include: [
        {
          model: Curso,
          as: 'curso',
          where: whereCurso,
          attributes: ['id', 'codigo', 'nombre'],
        },
        {
          model: Entrega,
          as: 'entregas',
          where: { usuario_id: req.usuario.id },
          required: false,
          attributes: ['id', 'estado', 'fecha_entrega'],
        },
      ],
      order: [['fecha_entrega', 'ASC']],
    });

    // Enriquecer con estado de entrega
    const tareasConEstado = tareas.map(t => {
      const tarea = t.toJSON();
      const entrega = tarea.entregas?.[0] || null;
      const ahora = new Date();
      const vencida = new Date(tarea.fecha_entrega) < ahora && !entrega;

      return {
        ...tarea,
        entrega_estado: entrega?.estado || 'pendiente',
        vencida,
        entregas: undefined,
      };
    });

    // Filtrar por estado si se especifica
    const resultado = estado
      ? tareasConEstado.filter(t => t.entrega_estado === estado)
      : tareasConEstado;

    return res.status(200).json({
      success: true,
      total: resultado.length,
      data: resultado,
    });
  } catch (error) {
    logger.error('Error en getTareas:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener tareas.' });
  }
};

// GET /api/tareas/:id - Detalle de una tarea
const getTareaById = async (req, res) => {
  try {
    const { id } = req.params;

    const tarea = await Tarea.findOne({
      where: { id, activo: true },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'codigo', 'nombre', 'docente'] },
        {
          model: Entrega,
          as: 'entregas',
          where: { usuario_id: req.usuario.id },
          required: false,
        },
      ],
    });

    if (!tarea) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    return res.status(200).json({ success: true, data: tarea });
  } catch (error) {
    logger.error('Error en getTareaById:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener la tarea.' });
  }
};

module.exports = { getTareas, getTareaById };
