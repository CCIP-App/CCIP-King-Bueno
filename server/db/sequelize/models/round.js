module.exports = function (sequelize, DataTypes) {
  var Round = sequelize.define('Round', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sponsor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    summary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    anwearSecond: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    associate: function (models) {
      Round.belongsTo(models.User)
      Round.belongsTo(models.Problem)
      Round.belongsTo(models.Option)
    }
  })

  return Round
}
