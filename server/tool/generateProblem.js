const Model = require('../db/sequelize/index.js')

const start = async function () {
  let level = await Model.Level.create({ name: '青銅級', times: 5, roundProblems: 5, maxScore: 100 })
  let problem = await Model.Problem.create({ question: '下列哪一種語言是硬體描述語言？', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: 'Verilog', currect: true }))
  await problem.addOption(await Model.Option.create({ content: 'C++', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'Python', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'JavaScript', currect: false }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: '在 C++ 中，下列哪一個字詞不是保留字？', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: 'counter', currect: true }))
  await problem.addOption(await Model.Option.create({ content: 'case', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'break', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'if', currect: false }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: '下列何者非 Linux 的優點 ?', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: '良好的多人多工環境，資源分配平均', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '除了免費之外，線上更新速度快，除錯與安全性均較佳', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '為 Open source 的授權，故而具有 open source 的所有優缺點', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '以上皆是', currect: true }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: 'IDE 為用來傳輸硬碟資料的一個彙流界面，一般而言，普通 PC 允許幾個 IDE 界面與裝置？', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: '3個', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '4個', currect: true }))
  await problem.addOption(await Model.Option.create({ content: '5個', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '6個', currect: false }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: '一般而言安裝 Linux 至少要有哪兩個 partition ?', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: 'root / swap', currect: true }))
  await problem.addOption(await Model.Option.create({ content: 'root / cache', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'root / home', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'root  / media', currect: false }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: '下列哪一種語言是所謂的低階語言？', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: 'Assembly', currect: true }))
  await problem.addOption(await Model.Option.create({ content: 'C++', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'Python', currect: false }))
  await problem.addOption(await Model.Option.create({ content: 'Java', currect: false }))
  await level.addProblem(problem)
  problem = await Model.Problem.create({ question: '現行的 HTTPS 通訊協定使用何種方式對網頁資料進行加密傳輸？', sponsor: 'SITCON' })
  await problem.addOption(await Model.Option.create({ content: '對稱式金鑰密碼法', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '非對稱式金鑰密碼法', currect: false }))
  await problem.addOption(await Model.Option.create({ content: '兩者並用', currect: true }))
  await problem.addOption(await Model.Option.create({ content: '可能是對稱式金鑰密碼法，也可能是非對稱式金鑰密碼法 ', currect: false }))
  await level.addProblem(problem)

  process.exit(1)
}

start()
