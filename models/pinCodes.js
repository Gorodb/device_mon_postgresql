module.exports = (sequelize, DataTypes) => {
  const PinCodes = sequelize.define('Pincodes', {
    user_id: DataTypes.INTEGER,
    pin_code: {
      type: DataTypes.INTEGER
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'pin_code']
      }
    ]
  })

  PinCodes.associate = function(models) {
    PinCodes.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    })
  }

  PinCodes.beforeCreate((Pincodes, options) => {
    Pincodes.pin_code = Math.floor(Math.random() * 9999) + 1
    return Pincodes
  })

  return PinCodes
}