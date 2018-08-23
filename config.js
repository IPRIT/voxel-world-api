export const config = {
  "env": process.env.NODE_ENV,
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
  },
  "google": {
    // ipritoflex@gmail.com
    // https://console.cloud.google.com/apis/credentials/oauthclient/459178147971-cimcqioj59eueu912ke130qsso4bb2sk.apps.googleusercontent.com?project=voxelroyal-212523&authuser=2&folder&organizationId
    "clientId": "459178147971-cimcqioj59eueu912ke130qsso4bb2sk.apps.googleusercontent.com"
  },
  "socket": {
    "options": {
      "path": "/queue",
      "serveClient": false,

      // below are engine.IO options
      "pingTimeout": 20000,
      "pingInterval": 10000,
      "cookie": false,
    }
  }
};