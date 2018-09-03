import { sequelize } from "./instance";
import { User } from "./User";
import { AuthToken } from "./AuthToken";
import { GameSession } from "./GameSession";
import { GameServer } from "./GameServer";
import { GameInstance } from "./GameInstance";

export function makeRelations () {
  /**
   * Define relatives between models
   */
  User.hasMany( AuthToken, { foreignKey: 'userId', targetKey: 'id' } );
  AuthToken.belongsTo( User, { foreignKey: 'userId', targetKey: 'id' } );

  User.hasMany( GameSession, { foreignKey: 'userId', targetKey: 'id' } );
  GameSession.belongsTo( User, { foreignKey: 'userId', targetKey: 'id' } );

  GameServer.hasMany( GameInstance, { foreignKey: 'serverId', targetKey: 'id' } );
  GameInstance.belongsTo( GameServer, { foreignKey: 'serverId', targetKey: 'id' } );

  GameInstance.hasMany( GameSession, { foreignKey: 'instanceId', targetKey: 'id' } );
  GameSession.belongsTo( GameInstance, { foreignKey: 'instanceId', targetKey: 'id' } );

  console.log( 'Models are syncing...' );
  return sequelize.sync(/**{ force: true }/**/).then(() => {
    console.log( 'Models synced!' );
  }).catch( console.error.bind( console, 'Fatal error:' ) );
}