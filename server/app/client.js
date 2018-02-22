// const redis = require('../db/redis.js')
const Model = require('../db/sequelize/index.js')
const config = require('../config/index.js')
const request = require('request-promise')
const _ = require('lodash')

const authTokenAndRegist = async (token) => {
  // const option = {
  //   uri: config.authserver.url,
  //   qs: {
  //     token: token // -> uri + '?access_token=xxxxx%20xxxxx'
  //   },
  //   resolveWithFullResponse: true
  // }
  // const response = await request(option)
  // if (response.statusCode === 400) {
  //   return false
  // } else {
  //   await Model.User.create({ nick: response.data['user_id'], token: token, score: 0 })
  //   return true
  // }

  await Model.User.create({ nick: 'yoyo', token: token, score: 0 })
  return true
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
    last: Date.now(),
    times: level.times,
    maxScore: level.maxScore,
    playerScores: [],
    computerScore: 0,
    problems: []
  }
  for (let element of problems) {
    let temp = {
      question: element.question,
      sponsor: element.sponsor,
      options: await element.getOptions()
    }
    temp.options = _.shuffle(temp.options)
    temp.options = temp.options.map(element => {
      return element.dataValues
    })
    temp.computer = makeComputer(temp)
    result.problems.push(temp)
  }
  return result
}

let makeComputer = (problem) => {
  let result = { times: 3, option: 0 }
  let currect = problem.options[result.option].currect
  return { times: 3, option: 0, content: problem.options[result.option].content, currect: currect, score: 0 }
}

let calcScore = (roomData, currect, times) => {
  let score = 0
  if (currect) {
    score = Math.ceil((roomData.times - (times - roomData.last) / 1000) / roomData.times * roomData.maxScore)
  }
  return score
}

const delay = (interval) => {
  return new Promise((resolve) => {
    setTimeout(resolve, interval)
  })
}

module.exports = {
  authTokenAndRegist: authTokenAndRegist,
  authLogin: authLogin,
  makeRoomData: makeRoomData,
  calcScore: calcScore,
  delay: delay
}
