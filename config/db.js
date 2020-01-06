const { Pool } = require('pg')
const colors = require('colors')

const env = process.env

const connectDb = async () => {
    const conn = new Pool({
        host: env.PG_HOST,
        port: env.PG_PORT,
        database: env.DATABASE,
        user: env.PG_USER,
        password: env.PG_PASSWORD,
    })

    console.log(`Postgresql db connected on: ${conn.options.host}:${conn.options.port}`.cyan)
}

exports.dbUsage = () => {

}

module.exports = connectDb
