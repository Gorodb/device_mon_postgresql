const dotEnv = require('dotenv')
dotEnv.config({ path: './config/config.env' })

module.exports = {
  "development": {
    "database": process.env.DATABASE,
    "username": process.env.PG_USER,
    "password": process.env.PG_PASSWORD,
    "host": process.env.PG_HOST,
    "port": process.env.PG_PORT,
    "dialect": 'postgres'
  },
  "test": {
    "database": 'qmujrkeq_device_mon_test',
    "username": 'qmujrkeq_admin',
    "password": '',
    "host": '',
    "port": 5432,
    "dialect": 'postgres'
  },
  "production": {
    "database": 'qmujrkeq_device_mon_test',
    "username": 'qmujrkeq_admin',
    "password": '',
    "host": '',
    "port": 5432,
    "dialect": 'postgres'
  }
}
