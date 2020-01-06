'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceTypes = sequelize.define('DeviceTypes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER

    },
    device_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true
  });
  DeviceTypes.associate = function(models) {
    DeviceTypes.hasMany(models.Devices, { foreignKey: 'device_type_id' })
  };
  return DeviceTypes;
};