'use strict';
module.exports = (sequelize, DataTypes) => {
  const DevicesHolders = sequelize.define('DevicesHolders', {
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    current_user_id: DataTypes.INTEGER,
    previous_user_id: DataTypes.INTEGER
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['current_user_id', 'device_id']
      }]
  })
  DevicesHolders.associate = function(models) {
    DevicesHolders.belongsTo(models.Devices, {
      foreignKey: 'device_id',
      as: 'device',
      foreignKeyConstraint: true,
      onDelete: 'cascade'
    })
    DevicesHolders.belongsTo(models.Users, {
      foreignKey: 'current_user_id',
      as: 'holder',
      foreignKeyConstraint: true,
      onDelete: 'cascade'
    })
    DevicesHolders.belongsTo(models.Users, {
      foreignKey: 'previous_user_id',
      as: 'previousUser',
      foreignKeyConstraint: true,
      onDelete: 'set null'
    })
  };
  return DevicesHolders;
};