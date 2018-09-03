import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const GameInstance = sequelize.define('GameInstance', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  gameType: {
    type: Sequelize.ENUM( 'quick', 'competitive' )
  },
  isFinished: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  paranoid: true,
  engine: 'MYISAM'
});