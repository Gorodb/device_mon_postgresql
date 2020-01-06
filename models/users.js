const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const ErrorResponse = require('../utils/errorResponse')

const env = process.env

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        checkEmail(value) {
          const re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)*(rt\.ru)$/
          if (value.match(re)[0] !== value) {
            throw new ErrorResponse(`Регистрация возможна только на внутренний email, ${value}`, 400)
          }
        },
        is: {
          args: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)*(rt\.ru)$/,
          msg: 'Регистрация возможна только на внутренний email'
        }
      }
    },
    phone: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no-image'
    },
    description: DataTypes.STRING,
    department_id: {
      allowNull: false,
      type: DataTypes.INTEGER

    }
  }, {
    underscored: true
  })
  Users.associate = function(models) {
    Users.belongsTo(models.Departments, {
      foreignKey: 'department_id',
      as: 'department'
    })
    Users.hasMany(models.Devices, {foreignKey: 'owner_id'})
    Users.hasMany(models.Devices, {foreignKey: 'updated_by_user'})
    Users.hasOne(models.DevicesHolders, {foreignKey: 'current_user_id', onDelete: 'cascade'})
    Users.hasOne(models.DevicesHolders, {foreignKey: 'previous_user_id'})
    Users.hasMany(models.SessionsBlackList, {foreignKey: 'user_id', onDelete: 'cascade'})
    Users.hasMany(models.TokensLinks, {foreignKey: 'user_id', onDelete: 'cascade'})
    Users.hasMany(models.ResetTokens, {foreignKey: 'user_id', onDelete: 'cascade'})
  }

  Users.addHook('beforeCreate', async (user, options) => {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
  })

  Users.addHook('beforeFind', (options) => {
    if (!options.attributes) {
      options.attributes = {}
      options.attributes.exclude = [ 'createdAt', 'updatedAt' ]
      options.attributes.exclude = options.withPassword ? options.attributes.exclude : [...options.attributes.exclude, 'password']
      options.attributes.exclude = options.withPassword ? options.attributes.exclude : [...options.attributes.exclude, 'password']
      options.include = [{
        model: sequelize.model('Departments'),
        as: 'department',
        required: false,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id']}
      }]
    }
  })

  Users.findById = async (userId) => {
    const user = await Users.findOne({ where: { id: userId }})
    const heldDevices = await sequelize.query(queryHeldDevices(userId))
    const ownedDevice = await sequelize.query(queryOwnedDevices(userId))
    user.dataValues.heldDevices = heldDevices[0]
    user.dataValues.ownedDevice = ownedDevice[0]
    return user
  }

  Users.findOneById = async (userId) => Users.findOne({ where: { id: userId }})

  Users.cryptPassword = async function(password) {
    return bcrypt.hash(password, await bcrypt.genSalt(10))
  }

  Users.findAllWithHeldDevices = () => async function(userId) {
    return sequelize.query(queryHeldDevices(userId))
  }

  Users.getSignedJwtToken = function (user) {
    return jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRE }
    )
  }
  Users.matchPassword = function (enteredPassword, password) {
    return bcrypt.compare(enteredPassword, password)
  }
  Users.deleteImage = function (currentPhoto, newPhoto) {
    if (currentPhoto !== 'no-image') {
      let thisPath = path.join(__dirname, '../', process.env.FILE_UPLOAD_PATH, newPhoto)
      try {
        fs.unlinkSync(thisPath)
      } catch (err) {
        console.log('Загруженное ранее изображение не найдено'.red, err)
      }
    }
  }
  Users.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field
    let resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    // Set expire
    let resetPasswordExpire = Date.now() + parseInt(env.FORGOT_TOKEN_EXPIRE, 10) * 60 * 1000

    return { resetToken, resetPasswordExpire , resetPasswordToken }
  }

  return Users
}

const queryHeldDevices = (userId) => `
        select d.id, d.name, d.os_name, d.default_location, d.location, dt.device_type, dt.title as device_type_title 
          from devices as d 
            left join devices_holders as dh on dh.device_id = d.id 
              left join device_types as dt on dt.id = d.device_type_id 
          where dh.current_user_id = ${userId} ORDER BY d.id
    `

const queryOwnedDevices = (userId) => `
        select d.id, d.name, d.os_name, d.default_location, d.location, dt.device_type, dt.title as device_type_title
          from devices as d
            left join device_types as dt on dt.id = d.device_type_id
        where d.owner_id = ${userId} ORDER BY d.id
    `
