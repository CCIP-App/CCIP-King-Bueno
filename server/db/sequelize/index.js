const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../../config/index.js')
const client = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, {
  host: config.sequelize.host,
  port: config.sequelize.port,
  dialect: config.sequelize.dialect,
  logging: (config.sequelize.logging) ? console.log : false,
  pool: {
    max: 3,
    min: 1,
    acquire: 10000,
    idle: 10000
  }
})

client
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

var models = {}
// read all models and import them into the "db" object
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function (file) {
    var model = client.import(path.join(__dirname, '/models', file))
    models[model.name] = model
  })

Object.keys(models).forEach(function (modelName) {
  if (models[modelName].options.hasOwnProperty('associate')) {
    models[modelName].options.associate(models)
  }
})

client.sync()

module.exports = models
module.exports.client = client
