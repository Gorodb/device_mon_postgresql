'use strict';
module.exports = (sequelize, DataTypes) => {
  const ResetTokens = sequelize.define('ResetTokens', {
    user_id: DataTypes.INTEGER,
    action: {
      type: DataTypes.ENUM('register', 'forgot_password'),
      allowNull: false
    },
    reset_password_token: DataTypes.STRING,
    reset_password_expire: DataTypes.DATE
  }, {
    underscored: true
  });
  ResetTokens.associate = function(models) {
    ResetTokens.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
      foreignKeyConstraint: true,
      onDelete: 'cascade'
    })
  };
  return ResetTokens;
};