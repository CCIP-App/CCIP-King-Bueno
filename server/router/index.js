const Router = require('koa-router')
const Model = require('../db/sequelize/index.js')
const redis = require('../db/redis.js')

const router = new Router()

router.get('/', async ctx => {
  ctx.body = 'Hello World'
})

router.get('/getUser', async ctx => {
  const token = ctx.request.query.token
  let user = await Model.User.findOne({ where: {token: token} })
  let userPrizes = await user.getUserPrizes()
  let prizes = []
  let cost = 0
  for (let prize of userPrizes) {
    let temp = await prize.getPrize()
    prizes.push(temp)
    cost += temp.needScore
  }
  let result = { nick: user.nick, score: user.score, cost: cost, prizes: prizes }
  ctx.response.body = result
})

router.get('/getPrizes', async ctx => {
  const prizes = await Model.Prize.findAll()
  ctx.response.body = prizes
})

router.post('/convert', async ctx => {
  const prize = await Model.Prize.findById(ctx.request.body.prizeId)
  const user = await Model.User.findOne({ where: {token: ctx.request.body.token} })
  let userPrizes = await user.getUserPrizes()
  let cost = 0
  for (let prize of userPrizes) {
    let temp = await prize.getPrize()
    cost += temp.needScore
  }
  if ((user.score - cost) > prize.needScore) {
    let userPrize = await Model.UserPrize.create({})
    await userPrize.setPrize(prize)
    await user.addUserPrize(userPrize)
    await prize.increment('convertTime', { by: 1 })
    ctx.response.body = { status: 'success' }
  } else {
    ctx.response.body = { status: 'error' }
  }
})

router.get('/sponsor/:name', async ctx => {
  const problems = await Model.Problem.findAll({ where: {sponsor: ctx.params.name} })
  let result = []
  for (let problem of problems) {
    let temp = {
      question: problem.question,
      options: await problem.getOptions()
    }
    result.push(temp)
  }
  ctx.response.body = result
})

router.get('/status', async ctx => {
  const online = await redis.get('online')
  const rounds = await Model.Round.count()
  const rooms = await redis.get('rooms')

  return { online: online, rounds: rounds, rooms: rooms }
})

module.exports = router
