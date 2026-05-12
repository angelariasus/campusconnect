// src/models/index.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ─── MODELO: Usuario ──────────────────────────────────────────────────────────
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombres:      { type: DataTypes.STRING(100), allowNull: false },
  apellidos:    { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash:{ type: DataTypes.STRING(255), allowNull: false },
  codigo:       { type: DataTypes.STRING(20),  allowNull: false, unique: true },
  activo:       { type: DataTypes.BOOLEAN, defaultValue: true },
  ultimo_login: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'usuarios', underscored: true });

// ─── MODELO: Curso ────────────────────────────────────────────────────────────
const Curso = sequelize.define('Curso', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo:      { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre:      { type: DataTypes.STRING(200), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  creditos:    { type: DataTypes.INTEGER, defaultValue: 3 },
  semestre:    { type: DataTypes.STRING(10), allowNull: false },
  docente:     { type: DataTypes.STRING(150), allowNull: false },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'cursos', underscored: true });

// ─── MODELO: Matrícula (relación Usuario-Curso) ───────────────────────────────
const Matricula = sequelize.define('Matricula', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id:     { type: DataTypes.INTEGER, allowNull: false },
  curso_id:       { type: DataTypes.INTEGER, allowNull: false },
  fecha_matricula:{ type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  estado:         { type: DataTypes.ENUM('activo', 'retirado', 'aprobado', 'reprobado'), defaultValue: 'activo' },
}, { tableName: 'matriculas', underscored: true });

// ─── MODELO: Tarea ────────────────────────────────────────────────────────────
const Tarea = sequelize.define('Tarea', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  curso_id:    { type: DataTypes.INTEGER, allowNull: false },
  titulo:      { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  fecha_entrega:{ type: DataTypes.DATE, allowNull: false },
  puntaje_max: { type: DataTypes.DECIMAL(5,2), defaultValue: 20.00 },
  tipo:        { type: DataTypes.ENUM('tarea', 'examen', 'proyecto', 'laboratorio'), defaultValue: 'tarea' },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'tareas', underscored: true });

// ─── MODELO: Entrega ─────────────────────────────────────────────────────────
const Entrega = sequelize.define('Entrega', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tarea_id:    { type: DataTypes.INTEGER, allowNull: false },
  usuario_id:  { type: DataTypes.INTEGER, allowNull: false },
  estado:      { type: DataTypes.ENUM('pendiente', 'entregado', 'calificado'), defaultValue: 'pendiente' },
  fecha_entrega:{ type: DataTypes.DATE, allowNull: true },
  archivo_url: { type: DataTypes.STRING(500), allowNull: true },
  comentario:  { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'entregas', underscored: true });

// ─── MODELO: Nota ────────────────────────────────────────────────────────────
const Nota = sequelize.define('Nota', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entrega_id:  { type: DataTypes.INTEGER, allowNull: false },
  usuario_id:  { type: DataTypes.INTEGER, allowNull: false },
  curso_id:    { type: DataTypes.INTEGER, allowNull: false },
  tarea_id:    { type: DataTypes.INTEGER, allowNull: false },
  puntaje:     { type: DataTypes.DECIMAL(5,2), allowNull: false },
  comentario:  { type: DataTypes.TEXT, allowNull: true },
  fecha_nota:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'notas', underscored: true });

// ─── MODELO: Material ────────────────────────────────────────────────────────
const Material = sequelize.define('Material', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  curso_id:    { type: DataTypes.INTEGER, allowNull: false },
  titulo:      { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  tipo:        { type: DataTypes.ENUM('pdf', 'video', 'enlace', 'otro'), defaultValue: 'pdf' },
  archivo_url: { type: DataTypes.STRING(500), allowNull: false },
  nombre_archivo:{ type: DataTypes.STRING(255), allowNull: true },
  tamano_bytes:{ type: DataTypes.BIGINT, allowNull: true },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'materiales', underscored: true });

// ─── MODELO: Notificación ────────────────────────────────────────────────────
const Notificacion = sequelize.define('Notificacion', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id:  { type: DataTypes.INTEGER, allowNull: false },
  titulo:      { type: DataTypes.STRING(255), allowNull: false },
  mensaje:     { type: DataTypes.TEXT, allowNull: false },
  tipo:        { type: DataTypes.ENUM('info', 'alerta', 'tarea', 'nota', 'sistema'), defaultValue: 'info' },
  leida:       { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_leida: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'notificaciones', underscored: true });

// ─── ASOCIACIONES ─────────────────────────────────────────────────────────────
Usuario.belongsToMany(Curso, { through: Matricula, foreignKey: 'usuario_id' });
Curso.belongsToMany(Usuario, { through: Matricula, foreignKey: 'curso_id' });

Curso.hasMany(Tarea, { foreignKey: 'curso_id', as: 'tareas' });
Tarea.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Tarea.hasMany(Entrega, { foreignKey: 'tarea_id', as: 'entregas' });
Entrega.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea' });
Entrega.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'estudiante' });

Entrega.hasOne(Nota, { foreignKey: 'entrega_id', as: 'nota' });
Nota.belongsTo(Entrega, { foreignKey: 'entrega_id', as: 'entrega' });
Nota.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'estudiante' });
Nota.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Curso.hasMany(Material, { foreignKey: 'curso_id', as: 'materiales' });
Material.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = { Usuario, Curso, Matricula, Tarea, Entrega, Nota, Material, Notificacion };
