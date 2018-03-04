const Model = require('../db/sequelize/index.js')

const start = async function () {
  await Model.Prize.create({ name: 'SITCON 前三名禮包 閉幕時發放', needScore: 0, image: '' })

  await Model.Prize.create({ name: 'SITCON 2019 門票抽獎資格', needScore: 5000, image: '', playerOnly: true })

  await Model.Prize.create({ name: 'SITCON 徽章', needScore: 1000, image: '' })

  process.exit(1)
}

start()
