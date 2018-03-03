const Model = require('../db/sequelize/index.js')

const start = async function () {
  await Model.Prize.create({ name: 'SITCON 2019 門票抽獎資格', needScore: 5000, image: '' })

  await Model.Prize.create({ name: 'SITCON 鑰使圈', needScore: 1000, image: '' })

  await Model.Prize.create({ name: 'SITCON 測試', needScore: 10, image: '' })

  process.exit(1)
}

start()
