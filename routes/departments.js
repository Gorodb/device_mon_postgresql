const express = require('express')
const database = require('../models')
const Departments = database.Departments
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/department')

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.route('/')
    .get(advancedResults(Departments), getDepartments)
    .post(createDepartment)
router.route('/:id')
    .get(getDepartment)
    .put(updateDepartment)
    .delete(deleteDepartment)

module.exports = router