const Devices = require('../models/devices')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc    Update device from mobile
// @rout    PUT /api/v1/auth/mobile/devices/:id
// access   public
exports.updateDevice = asyncHandler(async(req, res, next) => {
    let { name, os_name, default_location } = req.body

    let device = await Devices.findOneAndUpdate({ id: req.params.id }, { name, os_name, default_location, updated_by_user: undefined })

    if (!device) {
        return next(new ErrorResponse(`Устройство с id ${req.params.id} не найдено`, 404))
    }

    device = await Devices.findOne({ id: req.params.id })

    res.status(200).json(device)
})