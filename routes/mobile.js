const express = require('express')
const { filterByDepartment } = require('../middleware/auth')
const {
    updateDevice,
} = require('../controllers/mobile')

const router = express.Router()
router.use(filterByDepartment)

router.route('/devices/:id')
    .put(updateDevice)

module.exports = router