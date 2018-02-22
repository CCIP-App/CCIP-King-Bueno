const Redis = require('ioredis')
const config = require('../config/index.js')
const redis = new Redis(config.redis.port, config.redis.host, { keyPrefix: config.redis.prefix })

module.exports = redis
