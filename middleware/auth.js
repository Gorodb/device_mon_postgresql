const Sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const errorResponse = require('../utils/errorResponse')
const database = require('../models')
const Op = Sequelize.Op

const SessionsBlackList = database.SessionsBlackList
const Users = database.Users
const PinCodes = database.Pincodes

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    // Make sure token exists
    if (!token) {
        return next(new errorResponse('Нет доступа к ресурсу, необходима авторизация', 401))
    }

    // Check for token not in black list
    const isInBlackList = await SessionsBlackList.findOne({ where: {token}})
    if (isInBlackList) {
        return next(new errorResponse('Нет доступа к ресурсу, необходима авторизация', 401))
    }

    // Verify token and email confirmation
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await Users.findOne({ where: { id: decoded.id }})

        if (req.user === null) {
            return next(new errorResponse('Нет доступа к ресурсу, необходима авторизация', 401))
        }

        const pinCodesCount = await PinCodes.count({
            where: {
                user_id: req.user.id,
                expiration_date: { [Op.lte]: Date.now() }
            }
        })

        if (!req.user.is_email_confirmed && pinCodesCount > 0) {
            return next(new errorResponse('Email не подтвержден, для продолжения работы вам нужно подтвердить свой email', 403))
        }

        next()
    } catch (err) {
        return next(new errorResponse('Нет доступа к ресурсу, необходима авторизация', 401))
    }
})

// Check for auth and return user info to response
exports.isUser = asyncHandler(async (req, res, next) => {
    let dt = decodedToken(req)
    if (dt) {
        req.user = await Users.findOne({ where: { id: dt.id }})
    }
    next()
})

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new errorResponse(`Пользователи с ролью '${req.user.role}' не имеют доступа к ресурсу`, 403))
        }
        next()
    }
}

// Add modified user's id into the body
exports.modifiedUser = asyncHandler(async (req, res, next) => {
    req.device = {}
    let dt = decodedToken(req)
    if (!dt) {
        return next(new errorResponse(`Необходима авторизация`, 401))
    }
    const user = await Users.findOne({ where: { id: dt.id }})
    if (user) {
        req.device.updated_by_user = user.id
    }
    next()
})

// Filter devices by user location
exports.filterByDepartment = asyncHandler(async (req, res, next) => {
    let department = req.cookies.department_id ? req.cookies.department_id : req.headers.department_id
    if (!department && req.user) {
        department = req.user.department_id
    }

    if (!department) {
        return next(new errorResponse('Не выбрано подразделение', 400))
    }

    req.department = department

    next()
})

const decodedToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        let token = req.headers.authorization.split(' ')[1]
        return jwt.verify(token, process.env.JWT_SECRET)
    }
    return null
}
