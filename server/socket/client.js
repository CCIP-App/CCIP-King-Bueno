const redis = require('../db/redis.js')
const Model = require('../db/sequelize/index.js')
const uuid = require('uuid/v4')
// const config = require('../config/index.js')
const app = require('../app/client.js')
const _ = require('lodash')

const start = function (io) {
  const client = io.of('/client')
  client.on('connection', async (socket) => {
    await redis.incr('online')

    socket.on('disconnect', async (reason) => {
      await redis.decr('online')
    })

    socket.on('login', async (token) => {
      let auth = await app.authLogin(token)
      if (auth) {
        socket.emit('login', 'success')
      } else {
        const auth = await app.authTokenAndRegist(token)
        if (auth) {
          socket.emit('login', 'success')
        } else {
          socket.emit('login', 'error')
          socket.disconnect(true)
        }
      }
    })

    socket.on('score', async (token) => {
      let user = await Model.User.findOne({ where: {token: token} })
      socket.emit('score', user.score)
    })

    socket.on('rank', async (token) => {
      let auth = await app.authLogin(token)
      if (auth) {
        const ranks = await Model.User.findAll({ attributes: ['nick', 'score'], order: [['score', 'DESC'], ['updatedAt', 'ASC']], limit: 10 })
        socket.emit('rank', ranks)
      }
    })

    socket.on('chooseLevel', async () => {
      let levels = await Model.Level.findAll()
      socket.emit('chooseLevel', levels.map((value) => { return value.name }))
    })

    socket.on('start', async (input) => {
      let auth = await app.authLogin(input.token)
      if (auth) {
        let oldRoomName = await redis.get(input.token)
        if (oldRoomName !== null) await redis.del(oldRoomName)
        const roomName = uuid()
        socket.join(roomName)
        const roomData = await app.makeRoomData(input.level)
        await redis.set(roomName, JSON.stringify(roomData))
        await redis.set(input.token, roomName)
        client.to(roomName).emit('start', roomName)
      } else {
        socket.emit('start', 'error')
        socket.disconnect(true)
      }
    })

    socket.on('getProblem', async (input) => {
      if (Object.keys(socket.rooms).indexOf(input.roomName) !== -1) {
        let roomData = await redis.get(input.roomName)
        roomData = JSON.parse(roomData)
        if (roomData.playerScores.length !== roomData.problems.length) {
          let problem = roomData.problems[roomData.playerScores.length]
          let result = {
            question: problem.question,
            sponsor: problem.sponsor,
            options: _.map(problem.options, 'content'),
            times: roomData.times
          }
          client.to(input.roomName).emit('getProblem', result)
          roomData.last = Date.now()
          let last = roomData.last
          let problemId = roomData.playerScores.length
          await redis.set(input.roomName, JSON.stringify(roomData))
          await app.delay(problem.computer.times * 1000 - 500)
          roomData = await redis.get(input.roomName)
          roomData = JSON.parse(roomData)
          if (roomData.last === last) {
            let result = roomData.problems[problemId]
            let tempTime = Date.now()
            result.computer.score = app.calcScore(roomData, result.computer.currect, tempTime)
            result.computer.millls = tempTime
            client.to(input.roomName).emit('computer', result.computer)
            await redis.set(input.roomName, JSON.stringify(roomData))
          }
        } else {
          let result = {
            playerScore: roomData.playerScores.reduce((prev, element) => { return prev + element }, 0),
            computerScore: roomData.computerScore
          }
          result.win = this.playerScore > this.computerScore
          let user = await Model.User.findOne({ where: {token: input.token} })
          const round = await Model.Round.create({ roomName: input.roomName, sponsor: roomData.problems[0].sponsor, score: result.playerScore, summary: true })
          await user.addRound(round)
          await user.increment('score', {by: result.playerScore})
          client.to(input.roomName).emit('finish', result)
          socket.leave(input.roomName)
          socket.emit('score', user.score)
        }
      }
    })

    socket.on('answear', async (input) => {
      if (Object.keys(socket.rooms).indexOf(input.roomName) !== -1) {
        let now = Date.now()
        let roomData = await redis.get(input.roomName)
        roomData = JSON.parse(roomData)
        if (roomData.playerScores.length !== roomData.problems.length) {
          const problem = roomData.problems[roomData.playerScores.length]
          const option = problem.options[input.num]
          const playerScore = app.calcScore(roomData, option.currect, now)
          let round = await Model.Round.create({ roomName: input.roomName, sponsor: problem.sponsor, score: playerScore })
          await round.setProblem(await Model.Problem.findOne({ where: {question: problem.question} }))
          await round.setOption(await Model.Option.findById(option.id))

          await (await round.getOption()).increment('answearTimes', {by: 1})
          let user = await Model.User.findOne({ where: {token: input.token} })
          await user.addRound(round)
          roomData.playerScores.push(playerScore)
          roomData.computerScore += problem.computer.score
          await redis.set(input.roomName, JSON.stringify(roomData))
          client.to(input.roomName).emit('answear', { currect: option.currect, score: playerScore, millls: now })
        }
      }
    })
  })
}

module.exports = start
