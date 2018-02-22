module.exports = function (sequelize, DataTypes) {
  var Problem = sequelize.define('Problem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sponsor: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    associate: function (models) {
      Problem.hasMany(models.Option)
    }
  })

  return Problem
}
