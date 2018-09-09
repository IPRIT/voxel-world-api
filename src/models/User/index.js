import Sequelize from 'sequelize';
import { groups, groupUtils } from "./groups";
import { sequelize } from "../instance";

export const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    },
    allowNull: true,
    unique: true
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      // https://regex101.com/r/K8kvOX/3/
      is: /^(?![-_ \\\/!@#$%^&*()=+.,`'~><])[^\\\/!@#$%^&*()=+.,`'~><\n\r]{2,18}$/i
    }
  },
  googleId: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  facebookId: {
    type: Sequelize.BIGINT,
    allowNull: true,
    unique: true
  },
  isSuspended: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  balance: {
    type: Sequelize.DECIMAL( 10, 2 ),
    defaultValue: 0,
    get () {
      return Number( this.getDataValue( 'balance' ) ) || 0;
    },
    set (value) {
      this.setDataValue( 'balance', value );
    }
  },
  experience: {
    type: Sequelize.BIGINT( 15 ).UNSIGNED,
    defaultValue: 0
  },
  competitiveRating: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  accessGroup: {
    type: Sequelize.INTEGER,
    defaultValue: groups.user.mask,
    get: function () {
      let mask = this.getDataValue( 'accessGroup' );
      if (this.getDataValue( 'isSuspended' )) {
        mask = groups.locked.mask;
      }
      return groupUtils.groupByMask( mask );
    }
  },
  recentActivityTimeMs: {
    type: Sequelize.BIGINT( 15 ).UNSIGNED,
    defaultValue: () => Date.now()
  },
  lastLoggedTimeMs: {
    type: Sequelize.BIGINT( 15 ).UNSIGNED,
    defaultValue: () => Date.now()
  },
  registerTimeMs: {
    type: Sequelize.BIGINT( 15 ).UNSIGNED,
    defaultValue: () => Date.now()
  },
  isGuest: {
    type: new Sequelize.VIRTUAL(Sequelize.BOOLEAN, [ 'googleId', 'facebookId' ]),
    get () {
      return !this.get('googleId') && !this.get('facebookId');
    }
  }
}, {
  getterMethods: {
    displayName: function () {
      let placeholder = '{firstName} {lastName}';
      return ['firstName', 'lastName'].reduce((placeholder, key) => {
        let regexp = new RegExp(`\{${key}\}`, 'gi');
        return placeholder.replace(regexp, this[ key ]);
      }, placeholder).trim();
    },

    isAdmin() {
      if (!this.accessGroup) {
        return false;
      }
      return groupUtils.hasRight(
        this.accessGroup,
        groups.admin.mask
      );
    }
  },
  setterMethods: {
    displayName: function (value) {
      let names = (value || "").trim().split(/\s+/);
      while (names.length < 2) {
        names.push(' ');
      }
      this.setDataValue('firstName', names.slice(0, -1).join(' ').trim());
      this.setDataValue('lastName', names.slice(-1).join(' ').trim());
    }
  },
  paranoid: true,
  engine: 'MYISAM',
  indexes: [{
    name: 'social_profiles_index',
    method: 'BTREE',
    fields: [ 'googleId', 'facebookId' ]
  }, {
    name: 'email_index',
    method: 'BTREE',
    fields: [ 'email' ]
  }, {
    name: 'nickname_index',
    type: 'FULLTEXT',
    fields: [ 'nickname' ]
  }],
  defaultScope: function () {
    let lockedGroup = groups.groups.locked;
    return {
      where: {
        [Sequelize.Op.and]: {
          isSuspended: false,
          accessGroup: {
            [Sequelize.Op.ne]: lockedGroup.mask
          }
        }
      }
    };
  },
  scopes: {
    deleted: {
      where: {
        deletedAt: {
          [Sequelize.Op.ne]: null
        }
      }
    },
    suspended: {
      where: {
        isSuspended: true
      }
    },
    accessGroup: function (...args) {
      let groups = groupUtils.resolveAllGroups( args );
      return {
        where: {
          accessGroup: {
            [Sequelize.Op.in]: groups.map(group => group.mask)
          }
        }
      }
    }
  }
});

User.prototype.hasRight = function (mask) {
  return groupUtils.hasRight(
    this.accessGroup,
    mask
  );
};

User.prototype.updateLastLoggedTime = function () {
  this.lastLoggedTimeMs = Date.now();
};

User.prototype.updateRecentActivityTime = function () {
  this.recentActivityTimeMs = Date.now();
};