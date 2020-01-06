const express = require('express')
const database = require('../models')
const Devices = database.Devices
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {
    getDevice,
    getDevices,
    createDevice,
    updateDevice,
    updateDepartment,
    deleteDevice,
    changeDeviceOwner
} = require('../controllers/devices')

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.route('/')
    .get(advancedResults(Devices), getDevices)
    .post(createDevice)

router.route('/:id')
    .get(getDevice)
    .put(updateDevice)
    .delete(deleteDevice)

router.route('/:id/set_owner').put(changeDeviceOwner)
router.route('/:id/department').put(updateDepartment)

module.exports = router