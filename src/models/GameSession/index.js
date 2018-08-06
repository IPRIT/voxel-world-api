import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const GameSession = sequelize.define('GameSession', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userType: {
    type: Sequelize.ENUM('anonymous', 'user'),
    defaultValue: 'anonymous'
  },
  userNickname: {
    type: Sequelize.STRING,
    defaultValue: 'Unnamed player'
  },
  gameType: {
    type: Sequelize.STRING,
    defaultValue: 'quick'
  },
  gameToken: {
    type: Sequelize.CHAR( 96 )
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'token_index',
    method: 'BTREE',
    fields: [ 'gameToken' ]
  }]
});