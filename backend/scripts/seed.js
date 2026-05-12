// scripts/seed.js - Datos de prueba para CampusConnect
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { Usuario, Curso, Matricula, Tarea, Material, Notificacion } = require('../src/models');

const seed = async () => {
  try {
    console.log('Iniciando seed de datos de prueba...');

    await sequelize.sync({ force: true });

    // Crear usuarios de prueba
    const hash = await bcrypt.hash('password123', 12);
    const [alumno1, alumno2] = await Usuario.bulkCreate([
      { nombres: 'Juan Carlos', apellidos: 'García López', email: 'jgarcia@innovatec.edu.pe', password_hash: hash, codigo: '2021001' },
      { nombres: 'María Elena', apellidos: 'Torres Silva', email: 'mtorres@innovatec.edu.pe', password_hash: hash, codigo: '2021002' },
    ]);

    // Crear cursos
    const [dsweb, bd, redes] = await Curso.bulkCreate([
      { codigo: 'DSW301', nombre: 'Desarrollo de Sistemas Web', creditos: 4, semestre: '2024-II', docente: 'Dr. Carlos Mendoza' },
      { codigo: 'BDA201', nombre: 'Base de Datos Avanzada', creditos: 3, semestre: '2024-II', docente: 'Mg. Ana Flores' },
      { codigo: 'RDS101', nombre: 'Redes y Sistemas Distribuidos', creditos: 3, semestre: '2024-II', docente: 'Ing. Luis Vargas' },
    ]);

    // Matricular alumnos
    await Matricula.bulkCreate([
      { usuario_id: alumno1.id, curso_id: dsweb.id },
      { usuario_id: alumno1.id, curso_id: bd.id },
      { usuario_id: alumno2.id, curso_id: dsweb.id },
      { usuario_id: alumno2.id, curso_id: redes.id },
    ]);

    // Crear tareas
    const manana = new Date(); manana.setDate(manana.getDate() + 3);
    const proxSemana = new Date(); proxSemana.setDate(proxSemana.getDate() + 7);

    await Tarea.bulkCreate([
      { curso_id: dsweb.id, titulo: 'Caso Práctico 3 - Arquitectura Cloud', tipo: 'proyecto', fecha_entrega: manana, puntaje_max: 20 },
      { curso_id: dsweb.id, titulo: 'Examen Parcial Unidad 2', tipo: 'examen', fecha_entrega: proxSemana, puntaje_max: 20 },
      { curso_id: bd.id, titulo: 'Laboratorio PostgreSQL - Consultas Avanzadas', tipo: 'laboratorio', fecha_entrega: manana, puntaje_max: 20 },
    ]);

    // Crear materiales
    await Material.bulkCreate([
      { curso_id: dsweb.id, titulo: 'Diapositivas Semana 8 - Docker', tipo: 'pdf', archivo_url: 'dsw/semana8-docker.pdf', nombre_archivo: 'semana8-docker.pdf', tamano_bytes: 2048000 },
      { curso_id: dsweb.id, titulo: 'Guía de instalación Node.js', tipo: 'pdf', archivo_url: 'dsw/guia-nodejs.pdf', nombre_archivo: 'guia-nodejs.pdf', tamano_bytes: 512000 },
      { curso_id: bd.id, titulo: 'Script de ejercicios SQL', tipo: 'otro', archivo_url: 'bd/ejercicios.sql', nombre_archivo: 'ejercicios.sql', tamano_bytes: 15000 },
    ]);

    // Crear notificaciones
    await Notificacion.bulkCreate([
      { usuario_id: alumno1.id, titulo: 'Tarea próxima a vencer', mensaje: 'El Caso Práctico 3 vence en 3 días. No olvides subir tu entrega.', tipo: 'tarea' },
      { usuario_id: alumno1.id, titulo: 'Nueva calificación disponible', mensaje: 'Tu nota del Lab 1 de Base de Datos ya está disponible.', tipo: 'nota' },
      { usuario_id: alumno1.id, titulo: 'Bienvenido a CampusConnect', mensaje: 'Has iniciado sesión correctamente en la plataforma académica.', tipo: 'info' },
    ]);

    console.log('Seed completado. Usuarios de prueba:');
    console.log('   jgarcia@innovatec.edu.pe | password123');
    console.log('   mtorres@innovatec.edu.pe | password123');
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seed();
