module.exports = function (sequelize, DataTypes) {
  var userPrize = sequelize.define('UserPrize', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    associate: function (models) {
      userPrize.belongsTo(models.User)
      userPrize.belongsTo(models.Prize)
    }
  })

  return userPrize
}
