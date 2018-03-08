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
        let level = { name: csvRow[i * 8 + 3].trim(), times: autoConvert(csvRow[i * 8 + 5].trim()), roundProblems: 5, maxScore: 0 }
        levels.push(level)
      }
    } else if (rows === 1) {
      for (let i = 0; i < 3; i++) {
        levels[i].roundProblems = autoConvert(csvRow[i * 8 + 1].trim())
        levels[i].maxScore = autoConvert(csvRow[i * 8 + 3].trim())
      }
    } else if (rows >= 4) {
      for (let i = 0; i < 3; i++) {
        if (csvRow[i * 8 + 2].trim() === '') continue
        let problem = { question: csvRow[i * 8 + 2].trim(),
          sponsor: csvRow[i * 8 + 1].trim(),
          options: [
            { content: csvRow[i * 8 + 3].trim(), currect: (csvRow[i * 8 + 7].trim() === 'A') },
            { content: csvRow[i * 8 + 4].trim(), currect: (csvRow[i * 8 + 7].trim() === 'B') },
            { content: csvRow[i * 8 + 5].trim(), currect: (csvRow[i * 8 + 7].trim() === 'C') },
            { content: csvRow[i * 8 + 6].trim(), currect: (csvRow[i * 8 + 7].trim() === 'D') }
          ]}
        problems[i].push(problem)
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
