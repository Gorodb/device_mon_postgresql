'use strict';
module.exports = (sequelize, DataTypes) => {
  const Departments = sequelize.define('Departments', {
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    underscored: true
  })
  Departments.associate = function(models) {
    Departments.hasMany(models.Devices, {foreignKey: 'department_id'})
    Departments.hasMany(models.Users, {foreignKey: 'department_id'})
  }

  Departments.addHook('beforeFind', (options) => {
    if (!options.attributes) {
      options.attributes = {}
      options.attributes.exclude = ['createdAt', 'updatedAt']
    }
  })

  return Departments
};