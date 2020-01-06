const database = require('../models')
const DeviceTypes = database.DeviceTypes
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc    Get all users
// @rout    GET /api/v1/admin/device_types
// access   Private / Admin
exports.getDeviceTypes = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc    Get single device_type
// @rout    GET /api/v1/admin/device_types/:id
// access   Private / Admin
exports.getDeviceType = asyncHandler(async(req, res, next) => {
    const deviceType = await DeviceTypes.findOne({ where: { id: Number(req.params.id) } })

    if (!deviceType) {
        return next(new ErrorResponse(`Тип устройств с id ${req.params.id} не найден`, 400))
    }

    res.status(200).json({ success: true, data: deviceType })
})

// @desc    Create device_type
// @rout    POST /api/v1/admin/device_types
// access   Private / Admin
exports.createDeviceType = asyncHandler(async(req, res, next) => {
    const deviceType = await DeviceTypes.create(req.body)

    res.status(201).json({ success: true, data: deviceType })
})

// @desc    Update device_type
// @rout    PUT /api/v1/admin/device_type/:id
// access   Private / Admin
exports.updateDeviceType = asyncHandler(async(req, res, next) => {
    let deviceType = await DeviceTypes.findOne({ where: { id: Number(req.params.id) } })

    if (!deviceType) {
        return next(new ErrorResponse(`Тип устройств с id ${req.params.id} не найден`, 400))
    }

    deviceType = await DeviceTypes.update(req.body, { where: { id: Number(req.params.id) } })
    deviceType = await DeviceTypes.findOne({ where: { id: Number(req.params.id) } })

    res.status(200).json({ success: true, data: deviceType })
})

// @desc    Delete device_type
// @rout    DELETE /api/v1/admin/device_types/:id
// access   Private / Admin
exports.deleteDeviceType = asyncHandler(async(req, res, next) => {
    const deviceType = await DeviceTypes.findOne({ where: { id: Number(req.params.id) } })

    if (!deviceType) {
        return next(new ErrorResponse(`Тип устройств с id ${req.params.id} не найден`, 400))
    }

    await DeviceTypes.destroy({ where: { id: Number(req.params.id) } })

    res.status(200).json({ success: true, data: {} })
})
