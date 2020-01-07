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
    "database": process.env.DATABASE,
    "username": process.env.PG_USER,
    "password": process.env.PG_PASSWORD,
    "host": process.env.PG_HOST,
    "port": process.env.PG_PORT,
    "dialect": 'postgres'
  },
  "production": {
    "database": process.env.DATABASE,
    "username": process.env.PG_USER,
    "password": process.env.PG_PASSWORD,
    "host": process.env.PG_HOST,
    "port": process.env.PG_PORT,
    "dialect": 'postgres'
  }
}
