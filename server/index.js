const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const json = require('koa-json')
const cors = require('@koa/cors')
const logger = require('koa-logger')
const port = process.env.PORT || 8088

// init
const app = new Koa()
const server = require('http').createServer(app.callback())
const io = require('socket.io', { rememberTransport: false, transports: ['websocket'] })(server)
const client = require('./socket/client.js')
client(io)

// Router
const index = require('./router/index.js')

// koa-middleware
app.use(logger())
app.use(cors())
app.use(json())
app.use(bodyParser())
app.use(index.routes())

server.listen(port)
console.log('      Server is running on ' + port)
