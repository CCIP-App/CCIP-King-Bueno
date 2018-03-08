module.exports = {
  redis: {
    host: 'localhost',
    port: 32770,
    prefix: 'sitcon-king:'
  },
  sequelize: {
    dialect: 'mysql',
    host: 'localhost',
    port: 32771,
    database: 'king-Bueno',
    username: 'root',
    password: '123456',
    logging: false
    // logging: true
  },
  authserver: {
    url: 'https://ccip.coscup.org/status'
  },
  problem: '//',
  sponsor: {
    'token': 'SponsorName'
  }
}
