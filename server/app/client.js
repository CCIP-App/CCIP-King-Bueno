// const redis = require('../db/redis.js')
const Model = require('../db/sequelize/index.js')
const config = require('../config/index.js')
const request = require('request-promise')
const _ = require('lodash')

const authTokenAndRegist = async (token) => {
  const option = {
    uri: config.authserver.url,
    qs: {
      token: token
    },
    resolveWithFullResponse: true
  }
  try {
    const response = await request(option)
    if (response.statusCode === 400) {
      return false
    } else {
      const data = JSON.parse(response.body)
      await Model.User.create({ nick: data['user_id'], token: token, score: 0, type: data['type'] })
      // if (data['type'] !== 'staff') {
      //   return false
      // }
      return true
    }
  } catch (error) {
    console.err(error)
    return false
  }
}

const authLogin = async (token) => {
  let user = await Model.User.findOne({ where: {token: token} })
  return (user !== null)
}

const makeRoomData = async (levelName) => {
  const level = await Model.Level.findOne({ where: {name: levelName} })
  const problems = await level.getProblems({ order: Model.client.random(), limit: level.roundProblems })
  // const problem = await Model.Problem.findAll({ order: Model.client.random(), limit: 6 })
  let result = {
    last: 0,
    times: level.times,
    maxScore: level.maxScore,
    playerScores: [],
    computerScore: 0,
    problems: [],
    nowProblem: 0,
    finished: false
  }
  for (let element of problems) {
    let temp = {
      question: element.question,
      sponsor: element.sponsor,
      options: await element.getOptions()
    }
    let shuffle = true
    for (let option of temp.options) {
      if (option.content.includes('以上')) shuffle = false
    }
    if (shuffle) temp.options = _.shuffle(temp.options)
    temp.options = temp.options.map(element => {
      return element.dataValues
    })
    temp.computer = await makeComputer(temp)
    result.problems.push(temp)
  }
  return result
}

let makeComputer = async (problem) => {
  const round = await Model.Round.findAll({ where: { OptionId: { [Model.client.Op.ne]: null } }, include: [{ model: Model.Problem, where: { question: problem.question } }], order: Model.client.random(), limit: 1 })
  let result = {}
  if (round.length > 0) {
    let option = await round[0].getOption()
    if (option !== null && option !== undefined) {
      let optionNum = _.findIndex(problem.options, (value) => { return value.id === option.id })
      if (optionNum !== -1) result = { times: round[0].anwearSecond, option: optionNum, currect: option.currect, score: 0 }
      else result = { times: 3000, option: 0, currect: problem.options[0].currect, score: 0 }
    } else {
      result = { times: 3000, option: 0, currect: problem.options[0].currect, score: 0 }
    }
  } else {
    result = { times: 3000, option: 0, currect: problem.options[0].currect, score: 0 }
  }
  return result
  // let result = { times: 3000, option: 0 }
  // let currect = problem.options[result.option].currect
  // return { times: 3000, option: 0, content: problem.options[result.option].content, currect: currect, score: 0 }
}

let calcScore = (roomData, currect, times) => {
  let score = 0
  if (currect) {
    score = Math.ceil((roomData.times - (times - roomData.last) / 1000) / roomData.times * roomData.maxScore)
    if (score <= 0) score = 10
  }
  return score
}

let calcTimes = (roomData, times) => {
  let result = Math.ceil((roomData.times * 1000 - (times - roomData.last)))
  if (result <= 0) result = 500
  return result
}

const delay = (interval) => {
  return new Promise((resolve) => {
    setTimeout(resolve, interval)
  })
}

let getScore = async (socket, token) => {
  let user = await Model.User.findOne({ where: {token: token} })
  let cost = 0
  try {
    let userPrizes = await user.getUserPrizes()
    let prizes = []
    for (let prize of userPrizes) {
      let temp = await prize.getPrize()
      prizes.push(temp)
      cost += temp.needScore
    }
  } catch (error) {}
  let result = { score: user.score, cost: cost }
  socket.emit('score', result)
}

module.exports = {
  authTokenAndRegist: authTokenAndRegist,
  authLogin: authLogin,
  makeRoomData: makeRoomData,
  calcScore: calcScore,
  delay: delay,
  calcTimes: calcTimes,
  getScore: getScore
}
