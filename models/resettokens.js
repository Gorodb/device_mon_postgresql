'use strict';
module.exports = (sequelize, DataTypes) => {
  const ResetTokens = sequelize.define('ResetTokens', {
    user_id: DataTypes.INTEGER,
    reset_password_token: DataTypes.STRING,
    reset_password_expire: DataTypes.DATE
  }, {
    underscored: true
  });
  ResetTokens.associate = function(models) {
    ResetTokens.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    })
  };
  return ResetTokens;
};