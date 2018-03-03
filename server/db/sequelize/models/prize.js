module.exports = function (sequelize, DataTypes) {
  var Prize = sequelize.define('Prize', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    needScore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    convertTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    associate: function (models) {
    }
  })

  return Prize
}
