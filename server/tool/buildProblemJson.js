var request = require('request')
const csv = require('csvtojson')
const config = require('../config/index.js')
const Model = require('../db/sequelize/index.js')

var rows = 0
var levels = []
var problems = [[], [], []]

var autoConvert = function (value) {
  if (value === 'true' || value === 'false') {
    return (value === 'true')
  } else if (!isNaN(parseFloat(value)) && parseFloat(value).toString() === value) {
    return parseFloat(value)
  } else {
    return value
  }
}

let addDatabase = async function () {
  let databaseLevel = []
  for (let i = 0; i < 3; i++) {
    let save = await Model.Level.create(levels[i])
    databaseLevel.push(save)
  }
  for (let i = 0; i < 3; i++) {
    for (let problem of problems[i]) {
      let dataProblem = await Model.Problem.create({
        question: problem.question,
        sponsor: problem.sponsor
      })
      for (let option of problem.options) {
        await dataProblem.addOption(await Model.Option.create(option))
      }
      await databaseLevel[i].addProblem(dataProblem)
    }
  }
}

console.log('開始匯入')
console.time('start')

csv(
  {
    noheader: true,
    trim: true
  })
  .fromStream(request.get(config.problem))
  .on('csv', (csvRow) => {
    // csvRow is an array
    if (rows === 0) {
      for (let i = 0; i < 3; i++) {
        let level = { name: csvRow[i * 8 + 3], times: autoConvert(csvRow[i * 8 + 5]), roundProblems: 5, maxScore: 0 }
        levels.push(level)
      }
    } else if (rows === 1) {
      for (let i = 0; i < 3; i++) {
        levels[i].roundProblems = autoConvert(csvRow[i * 8 + 1])
        levels[i].maxScore = autoConvert(csvRow[i * 8 + 3])
        // let save = await Model.Level.create(levels[i])
        // databaseLevel.push(save)
      }
    } else if (rows >= 4) {
      for (let i = 0; i < 3; i++) {
        if (csvRow[i * 8 + 2] === '') continue
        let problem = { question: csvRow[i * 8 + 2],
          sponsor: csvRow[i * 8 + 1],
          options: [
            { content: csvRow[i * 8 + 3], currect: (csvRow[i * 8 + 7] === 'A') },
            { content: csvRow[i * 8 + 4], currect: (csvRow[i * 8 + 7] === 'B') },
            { content: csvRow[i * 8 + 5], currect: (csvRow[i * 8 + 7] === 'C') },
            { content: csvRow[i * 8 + 6], currect: (csvRow[i * 8 + 7] === 'D') }
          ]}
        problems[i].push(problem)
        // let problem = await Model.Problem.create({ question: csvRow[i * 8 + 2], sponsor: csvRow[i * 8 + 1] })
        // await problem.addOption(await Model.Option.create({ content: csvRow[i * 8 + 3], currect: (csvRow[i * 8 + 7] === 'A') }))
        // await problem.addOption(await Model.Option.create({ content: csvRow[i * 8 + 4], currect: (csvRow[i * 8 + 7] === 'B') }))
        // await problem.addOption(await Model.Option.create({ content: csvRow[i * 8 + 5], currect: (csvRow[i * 8 + 7] === 'C') }))
        // await problem.addOption(await Model.Option.create({ content: csvRow[i * 8 + 6], currect: (csvRow[i * 8 + 7] === 'D') }))
        // await databaseLevel[i].addProblem(problem)
      }
    }
    rows++
  })
  .on('done', (error) => {
    if (error) throw error
    addDatabase().then(() => {
      console.log('匯入成功')
      console.timeEnd('start')
      process.exit(1)
    })
  })
