module.exports = function (sequelize, DataTypes) {
  var Level = sequelize.define('Level', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    times: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    roundProblems: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    associate: function (models) {
      Level.hasMany(models.Problem)
    }
  })

  return Level
}
