// src/config/database.js
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a PostgreSQL establecida correctamente.');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Modelos sincronizados con la base de datos.');
    }
  } catch (error) {
    logger.error('Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
