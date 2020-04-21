const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]
const db = {}

console.log(JSON.stringify(config))

let sequelize
if (config.environment === 'production') {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
  sequelize = new Sequelize(
      process.env.DATABASE,
      process.env.PG_USER,
      process.env.PG_PASSWORD, {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: 'postgres',
        dialectOption: {
          ssl: true,
          native: true
        },
        logging: true
      }
  );
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.addHook('beforeFind', (options) => {
    if (!options.attributes) {
        options.attributes = {};
        options.attributes.exclude = [ 'createdAt', 'updatedAt' ];
    }
})

// sequelize.sync()

module.exports = db;
