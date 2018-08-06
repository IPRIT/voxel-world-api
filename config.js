export const config = {
  "secureProtocol": false,
  "ip": "",
  "port": "9000",
  "db": {
    "host": "localhost",
    "database": "voxel-world",
    "username": "root",
    "password": "115563",
    "maxPoolAmount": 100,
    "minPoolAmount": 1,
    "idleTimeoutMs": 10000
  },
  "cors": {
    "origins": [ "*" ],
    "methods": [ "POST", "GET", "OPTIONS" ],
    "headers": [ "Content-Type", "X-Token", "X-Requested-With" ]
  }
};