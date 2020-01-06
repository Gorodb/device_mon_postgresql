'use strict';
module.exports = (sequelize, DataTypes) => {
  const Devices = sequelize.define('Devices', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    os_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    default_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    device_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    charge: DataTypes.INTEGER
  }, {
    underscored: true
  });
  Devices.associate = function(models) {
    Devices.belongsTo(models.Departments, {
      foreignKey: 'department_id',
      as: 'department'
    })
    Devices.belongsTo(models.Users, {
      foreignKey: 'owner_id',
      as: 'owner'
    })
    Devices.belongsTo(models.Users, {
      foreignKey: 'updated_by_user',
      as: 'userUpdate'
    })
    Devices.belongsTo(models.DeviceTypes, {
      foreignKey: 'device_type_id',
      as: 'deviceType'
    })
    Devices.hasOne(models.DevicesHolders, {foreignKey: 'device_id', onDelete: 'cascade'})
  }

  Devices.addHook('beforeFind', (options) => {
    if (!options.attributes) {
      options.attributes = {}
      options.attributes.exclude = ['createdAt', 'updatedAt', 'owner_id', 'device_type_id', 'updated_by_user']
      options.include = [{
        model: sequelize.model('Departments'),
        as: 'department',
        required: false,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id']}
      }, {
        model: sequelize.model('Users'),
        as: 'owner',
        required: false,
        attributes: { exclude: ['createdAt', 'updatedAt', 'password'] }
      }, {
        model: sequelize.model('Users'),
        as: 'userUpdate',
        required: false,
        attributes: { exclude: ['createdAt', 'updatedAt', 'password'] }
      }, {
        model: sequelize.model('DeviceTypes'),
        as: 'deviceType',
        required: false,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id'] }
      }]
    }
  })

  return Devices
}
