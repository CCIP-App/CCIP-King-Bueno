module.exports = function (sequelize, DataTypes) {
  var Option = sequelize.define('Option', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answearTimes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    associate: function (models) {
      Option.belongsTo(models.Problem)
    }
  })

  return Option
}
