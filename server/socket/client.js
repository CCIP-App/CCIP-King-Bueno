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

    socket.on('nick', async (token) => {
      let user = await Model.User.findOne({ where: {token: token} })
      socket.emit('nick', user.nick)
    })

    socket.on('score', async (token) => {
      await app.getScore(socket, token)
    })

    socket.on('rank', async (token) => {
      let auth = await app.authLogin(token)
      if (auth) {
        let player = await Model.User.findOne({ where: {token: token} })
        let result = {
          user: await Model.User.count({ where: { score: { [Model.client.Op.gt]: player.score } } }) + 1,
          sum: await Model.User.count(),
          ranks: await Model.User.findAll({ where: { type: { [Model.client.Op.ne]: 'staff' } }, attributes: ['nick', 'score'], order: [['score', 'DESC'], ['updatedAt', 'ASC']], limit: 10 })
        }
        socket.emit('rank', result)
      }
    })

    socket.on('prize', async (token) => {
      let auth = await app.authLogin(token)
      if (auth) {
        let player = await Model.User.findOne({ where: {token: token} })
        let result = {
          prizes: await Model.Prize.findAll(),
          user: await player.getUserPrizes()
        }
        if (player.type === 'staff') {
          result.prizes = result.prizes.filter((value) => {
            return (value.name.includes('徽章'))
          })
        }
        socket.emit('prize', result)
      }
    })

    socket.on('chooseLevel', async () => {
      let levels = await Model.Level.findAll()
      socket.emit('chooseLevel', levels.map((value) => { return value.name }))
    })

    socket.on('start', async (input) => {
      let auth = await app.authLogin(input.token)
      if (auth) {
        await redis.incr('rooms')
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
        let getTime = Math.ceil((Date.now() - roomData.last) / 1000)
        if (roomData.last === 0 || (getTime <= (roomData.times + 2) && getTime >= (roomData.times - 1))) {
          if (roomData.last !== 0 && roomData.nowProblem === roomData.playerScores.length && getTime > roomData.times) {
            const problem = roomData.problems[roomData.playerScores.length]
            roomData.playerScores.push(0)
            roomData.computerScore += problem.computer.score
            let round = await Model.Round.create({ roomName: input.roomName, sponsor: problem.sponsor, score: 0, anwearSecond: 0 })
            await round.setProblem(await Model.Problem.findOne({ where: {question: problem.question} }))
            let user = await Model.User.findOne({ where: {token: input.token} })
            await user.addRound(round)
          }
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
            roomData.nowProblem = problemId
            await redis.set(input.roomName, JSON.stringify(roomData))
            await app.delay(roomData.times * 1000 - problem.computer.times - 200)
            roomData = await redis.get(input.roomName)
            roomData = JSON.parse(roomData)
            if (roomData.last === last) {
              let result = roomData.problems[problemId]
              let tempTime = Date.now()
              result.computer.score = app.calcScore(roomData, result.computer.currect, tempTime)
              roomData.computerScore += result.computer.score
              await redis.set(input.roomName, JSON.stringify(roomData))
              client.to(input.roomName).emit('computer', result.computer)
            }
          } else {
            let result = {
              playerScore: roomData.playerScores.reduce((prev, element) => { return prev + element }, 0),
              computerScore: roomData.computerScore
            }
            result.win = result.playerScore > result.computerScore
            if (result.win) result.playerScore += roomData.maxScore
            let user = await Model.User.findOne({ where: {token: input.token} })
            const round = await Model.Round.create({ roomName: input.roomName, sponsor: roomData.problems[0].sponsor, score: result.playerScore, summary: true, anwearSecond: 0 })
            await user.addRound(round)
            await user.increment('score', {by: result.playerScore})
            client.to(input.roomName).emit('finish', result)
            await redis.decr('rooms')
            socket.leave(input.roomName)

            await app.getScore(socket, input.token)
          }
        }
      }
    })

    socket.on('answear', async (input) => {
      if (Object.keys(socket.rooms).indexOf(input.roomName) !== -1) {
        let now = Date.now()
        let roomData = await redis.get(input.roomName)
        roomData = JSON.parse(roomData)
        if (roomData.nowProblem === roomData.playerScores.length) {
          if (roomData.playerScores.length !== roomData.problems.length) {
            const problem = roomData.problems[roomData.playerScores.length]
            const option = problem.options[input.num]
            const playerScore = app.calcScore(roomData, option.currect, now)
            let round = await Model.Round.create({ roomName: input.roomName, sponsor: problem.sponsor, score: playerScore, anwearSecond: app.calcTimes(roomData, now) })
            await round.setProblem(await Model.Problem.findOne({ where: {question: problem.question} }))
            await round.setOption(await Model.Option.findById(option.id))

            await (await round.getOption()).increment('answearTimes', {by: 1})
            let user = await Model.User.findOne({ where: {token: input.token} })
            await user.addRound(round)
            roomData.playerScores.push(playerScore)
            await redis.set(input.roomName, JSON.stringify(roomData))
            client.to(input.roomName).emit('answear', { currect: option.currect, score: playerScore })
          }
        }
      }
    })
  })
}

module.exports = start
