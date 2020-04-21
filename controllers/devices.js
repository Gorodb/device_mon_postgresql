const database = require('../models')
const Devices = database.Devices
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc    Get all devices
// @rout    GET /api/v1/devices
// access   public
exports.getDevices = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc    Get single device
// @rout    GET /api/v1/devices/:id
// access   public
exports.getDevice = asyncHandler(async(req, res, next) => {
    const device = await findById(req.params.id)

    if (!device) {
        return next(new ErrorResponse(`Устройства с id ${req.params.id} не найдено`, 404))
    }

    res.status(200).json(device)
})

// @desc    Create device
// @rout    GET /api/v1/devices
// access   private / admin
exports.createDevice = asyncHandler(async(req, res, next) => {
    const body = req.body

    let device = await Devices.create(body)
    device = await Devices.findOne({ where: { id: device.id }})

    res.status(201).json(device)
})

// @desc    Update device
// @rout    PUT /api/v1/devices/:id
// access   public
exports.updateDevice = asyncHandler(async(req, res, next) => {
    let body = req.body
    body.updated_by_user = req.user.id

    let device = await Devices.update(body, { where: { id: req.params.id }})

    if (!device) {
        return next(new ErrorResponse(`Устройство с id ${req.params.id} не найдено`, 404))
    }

    device = await Devices.findOne({ where: { id: req.params.id }})

    res.status(200).json(device)
})

// @desc    Delete device
// @rout    GET /api/v1/devices/:id
// access   private / admin
exports.deleteDevice = asyncHandler(async(req, res, next) => {
    const device = await Devices.destroy({ where: { id: req.params.id }})

    if (!device) {
        return next(new ErrorResponse(`Устройства с id ${req.params.id} не найдено`, 404))
    }

    res.status(200).json({ success: true })
})

// @desc    Update device's department id
// @rout    PUT /api/v1/devices/:id/department
// access   private / admin
exports.updateDepartment = asyncHandler(async(req, res, next) => {
    let device = await updateDeviceById({
        department_id: req.body.departmentId,
        updated_by_user: req.user.id
    }, req.params.id)

    if (!device) {
        return next(new ErrorResponse(`Устройство с id ${req.params.id} не найдено`, 404))
    }
    device = await Devices.findOne({ where: { id: req.params.id }})

    res.status(200).json(device)
})

// @desc    Change device owner
// @rout    PUT /api/v1/devices/:id/set_owner
// access   public
exports.changeDeviceOwner = asyncHandler(async(req, res, next) => {
    if (!req.body.userId) return next(new ErrorResponse(`Не указан новый владелец устройства`, 400))

    let device = await updateDeviceById({
        owner_id: req.body.userId,
        updated_by_user: req.user.id
    }, req.params.id)

    if (!device) return next(new ErrorResponse(`Устройство с id ${req.params.id} не найдено`, 404))

    device = await findById(req.params.id)

    res.status(200).json(device)
})

const findById = async (id) => Devices.findOne({ where: { id: id }})

const updateDeviceById = async (body, id) => Devices.update({body}, { where: { id: id }})
