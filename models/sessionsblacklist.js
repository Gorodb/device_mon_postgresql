'use strict';
module.exports = (sequelize, DataTypes) => {
  const SessionsBlackList = sequelize.define('SessionsBlackList', {
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiration_date: DataTypes.DATE
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'token']
      }
    ]
  });
  SessionsBlackList.associate = function(models) {
    SessionsBlackList.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
      foreignKeyConstraint: true,
      onDelete: 'cascade'
    })
  };
  return SessionsBlackList;
};