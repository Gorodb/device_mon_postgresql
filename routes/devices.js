const express = require('express')
const database = require('../models')
const Devices = database.Devices
const { isUser, filterByDepartment, protect } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {
    getDevice,
    getDevices,
    updateDevice
} = require('../controllers/devices')
const {
    takeDevice,
    returnToPrevUser,
    returnToDefaultLocation,
} = require('../controllers/deviceHolding')

const router = express.Router()

router.use(isUser)
router.use(filterByDepartment)

router.route('/')
    .get(advancedResults(Devices), getDevices)

router.route('/:id')
    .get(getDevice)
    .put(protect, updateDevice)

router.route('/:id/take_device').put(takeDevice)
router.route('/:id/return_to_prev').put(returnToPrevUser)
router.route('/:id/return_to_default_Location').put(returnToDefaultLocation)

module.exports = router
