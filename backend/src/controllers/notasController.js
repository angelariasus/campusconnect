// src/controllers/notasController.js
const { Nota, Curso, Tarea, Matricula } = require('../models');
const logger = require('../config/logger');

// GET /api/notas - Calificaciones del alumno
const getNotas = async (req, res) => {
  try {
    const { curso_id } = req.query;

    const whereNota = { usuario_id: req.usuario.id };
    if (curso_id) whereNota.curso_id = curso_id;

    const notas = await Nota.findAll({
      where: whereNota,
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'codigo', 'nombre', 'creditos'],
        },
        {
          model: Tarea,
          as: 'tarea',
          where: { activo: true },
          attributes: ['id', 'titulo', 'tipo', 'puntaje_max'],
        },
      ],
      order: [
        ['curso_id', 'ASC'],
        ['fecha_nota', 'DESC'],
      ],
    });

    // Agrupar notas por curso y calcular promedios
    const notasPorCurso = {};
    notas.forEach(n => {
      const nota = n.toJSON();
      const cursoId = nota.curso_id;
      if (!notasPorCurso[cursoId]) {
        notasPorCurso[cursoId] = {
          curso: nota.curso,
          evaluaciones: [],
          promedio: 0,
          aprobado: false,
        };
      }
      notasPorCurso[cursoId].evaluaciones.push({
        tarea: nota.tarea,
        puntaje: parseFloat(nota.puntaje),
        puntaje_max: parseFloat(nota.tarea.puntaje_max),
        comentario: nota.comentario,
        fecha: nota.fecha_nota,
      });
    });

    // Calcular promedios
    Object.values(notasPorCurso).forEach(curso => {
      if (curso.evaluaciones.length > 0) {
        const suma = curso.evaluaciones.reduce((acc, e) => acc + e.puntaje, 0);
        curso.promedio = parseFloat((suma / curso.evaluaciones.length).toFixed(2));
        curso.aprobado = curso.promedio >= 10.5; // Escala vigesimal peruana
      }
    });

    return res.status(200).json({
      success: true,
      total_evaluaciones: notas.length,
      data: Object.values(notasPorCurso),
    });
  } catch (error) {
    logger.error('Error en getNotas:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener calificaciones.' });
  }
};

module.exports = { getNotas };
