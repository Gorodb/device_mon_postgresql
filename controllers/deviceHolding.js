const database = require('../models')
const DevicesHolders = database.DevicesHolders
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc    Taking device by user
// @rout    PUT /api/v1/auth/devices/:id/take_device
// access   public
exports.takeDevice = asyncHandler(async(req, res, next) => {
    let userId = req.user ? req.user.id : req.body.userId

    let heldDevice = await DevicesHolders.findOne({ where: { device_id: req.params.id }})

    if (!heldDevice) {
        await DevicesHolders.create({
            device_id: req.params.id,
            current_user_id: userId
        })
    } else {
        if (heldDevice.current_user_id === userId) {
            return next(new ErrorResponse(`Вы уже используете это устройство`, 208))
        }

        await DevicesHolders.update({
            device_id: req.params.id,
            current_user_id: userId,
            previous_user_id: heldDevice.current_user_id
        }, { where: { device_id: req.params.id }})
    }
    heldDevice = await DevicesHolders.findOne({ where: { device_id: req.params.id }})

    res.status(200).json(heldDevice)
})

// @desc    Return device to prev user
// @rout    PUT /api/v1/auth/devices/:id/return_to_prev
// access   public
exports.returnToPrevUser = asyncHandler(async(req, res, next) => {
    let userId = req.user ? req.user.id : req.body.userId
    let heldDevice = await DevicesHolders.findOne({ where: { device_id: req.params.id }})

    if (!heldDevice) {
        return next(new ErrorResponse(`Данное устройство еще никто не брал`, 400))
    } else if (userId !== heldDevice.current_user_id) {
        return next(new ErrorResponse(`Вы не брали это устройство либо не отметили, что используете его`, 400))
    } else if (!heldDevice.previous_user_id) {
        return next(new ErrorResponse(`Вы взяли устройство с места хранения или предыдущий пользователь не отметил, что брал его`, 400))
    }

    await DevicesHolders.update({
        device_id: req.params.id,
        current_user_id: heldDevice.previous_user_id,
        previous_user_id: userId
    }, { where: { device_id: req.params.id }})

    heldDevice = await DevicesHolders.findOne({ where: { device_id: req.params.id }})

    res.status(200).json(heldDevice)
})

// @desc    Return device to default location or return and set new default location
// @rout    PUT /api/v1/auth/devices/:id/return_to_default_Location
// access   public
exports.returnToDefaultLocation = asyncHandler(async(req, res, next) => {
    let heldDevice = await DevicesHolders.findOne({ where: { device_id: req.params.id }})

    if (!heldDevice) {
        return next(new ErrorResponse(`Данное устройство еще никто не брал`, 400))
    }

    await DevicesHolders.destroy({ where: { device_id: req.params.id }})

    res.status(200).json({ success: true })
})
