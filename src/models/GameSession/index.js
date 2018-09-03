import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const GameSession = sequelize.define('GameSession', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  nickname: {
    type: Sequelize.STRING,
    defaultValue: 'Unnamed player'
  },
  sessionToken: {
    type: Sequelize.CHAR( 96 )
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'token_index',
    method: 'BTREE',
    fields: [ 'sessionToken' ]
  }]
});