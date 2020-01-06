const Sequelize = require("sequelize")
const database = require('../models')
const Users = database.Users
const SessionsBlackList = database.SessionsBlackList
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

const Op = Sequelize.Op

// @desc    Get all users
// @rout    GET /api/v1/admin/users
// access   Private / Admin
exports.getUsers = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc    Get single user
// @rout    GET /api/v1/admin/users/:id
// access   Private / Admin
exports.getUser = asyncHandler(async(req, res, next) => {
    const user = await Users.findById(req.params.id)

    if (!user) {
        return next(new ErrorResponse(`Пользователь с id ${req.params.id} не найден`, 400))
    }

    res.status(200).json({ success: true, data: user })
})

// @desc    Create user
// @rout    POST /api/v1/admin/users
// access   Private / Admin
exports.createUser = asyncHandler(async(req, res, next) => {
    const user = await Users.create(req.body)

    res.status(201).json({ success: true, data: user })
})

// @desc    Update user
// @rout    PUT /api/v1/admin/users/:id
// access   Private / Admin
exports.updateUser = asyncHandler(async(req, res, next) => {
    if (req.body.password) {
        req.body.password = await Users.cryptPassword(req.body.password)
    }

    let user = await Users.findOneById(req.params.id)
    if (!user) {
        return next(new ErrorResponse(`Пользователь с id ${req.params.id} не найден`, 404))
    }

    await Users.update(req.body, { where: { id: req.params.id }})
    user = await Users.findById(req.params.id)

    res.status(200).json({ success: true, data: user })
})

// @desc    Delete user
// @rout    DELETE /api/v1/admin/users/:id
// access   Private / Admin
exports.deleteUser = asyncHandler(async(req, res, next) => {
    const user = await Users.findOneById(req.params.id)

    if (!user) {
        return next(new ErrorResponse(`Пользователь с id ${req.params.id} не найден`, 400))
    }

    await user.destroy({ where: { id: req.params.id }})

    res.status(200).json({ success: true, data: {} })
})

// @desc    Get all forgot_token links
// @rout    GET /api/v1/admin/users/get_token_links
// access   Private / Admin
exports.getTokenLinks = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults)
})

exports.clearOldSessionsFromBlackList = asyncHandler(async (req, res, next) => {
    await SessionsBlackList.destroy({
        where: {
            expiration_date: {
                [Op.lt]: Date.now()
            }
        }
    })
})
