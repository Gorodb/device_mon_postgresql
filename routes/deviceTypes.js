const express = require('express')
const database = require('../models')
const DeviceTypes = database.DeviceTypes
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {
    getDeviceType,
    getDeviceTypes,
    createDeviceType,
    updateDeviceType,
    deleteDeviceType
} = require('../controllers/devicesTypes')

const router = express.Router()

// router.use(protect)
// router.use(authorize('admin'))

router.route('/')
    .get(advancedResults(DeviceTypes), getDeviceTypes)
    .post(createDeviceType)

router.route('/:id')
    .get(getDeviceType)
    .put(updateDeviceType)
    .delete(deleteDeviceType)

module.exports = router