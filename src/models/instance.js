import Sequelize from 'sequelize';
import { config } from "../../config";

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password, {
    host: config.db.host,
    dialect: 'mysql',

    pool: {
      max: config.db.maxPoolAmount || 100,
      min: config.db.minPoolAmount || 0,
      idle: config.db.idleTimeoutMs || 10000
    },

    logging: false && console.log.bind( console, '[Sequelize]' )
  }
);