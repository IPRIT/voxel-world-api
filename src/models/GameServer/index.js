import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const GameServer = sequelize.define('GameServer', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  region: {
    type: Sequelize.ENUM( 'eu-west', 'eu-east', 'na-west', 'na-east', 'asia' )
  },
  publicIp: {
    type: Sequelize.STRING
  },
  gameType: {
    type: Sequelize.STRING,
    defaultValue: 'quick'
  },
  isTemporarilyDown: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'ip_index',
    method: 'BTREE',
    fields: [ 'publicIp' ]
  }]
});