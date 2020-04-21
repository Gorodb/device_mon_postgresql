const database = require('../models')
const Department = database.Departments
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc    Get departments
// @rout    GET /api/v1/departments
// access   public
exports.getDepartments = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc    Get single Department
// @rout    GET /api/v1/admin/department/:id
// access   public
exports.getDepartment = asyncHandler(async(req, res, next) => {
    const department = await Department.findOne({ where: { id: req.params.id }})
    if (!department) {
        return next(new ErrorResponse(`Подразделение с id ${req.params.id} не найдено`, 404))
    }
    res.status(200).json(department)
})

// @desc    Create new department
// @rout    POST /api/v1/admin/department
// access   private / admin
exports.createDepartment = asyncHandler(async(req, res, next) => {
    const { name, description } = req.body
    const department = await Department.create({ name, description })
    if (!department) {
        return next(new ErrorResponse(`Не удалось создать подразделение`, 500))
    }

    res.status(201).json(department)
})

// @desc    Update department
// @rout    PUT /api/v1/admin/departments
// access   private / admin
exports.updateDepartment = asyncHandler(async(req, res, next) => {
    const { name, description } = req.body
    let department = await Department.findOne({ where: { id: req.params.id }})

    if (!department) return next(new ErrorResponse(`Подразделение с id ${req.params.id} не найдено`, 404))

    department = await Department.update({ name, description }, { where: { id: Number(req.params.id) } })
    department = await Department.findOne({ where: { id: req.params.id }})

    res.status(200).json(department)
})

// @desc    Delete department
// @rout    DELETE /api/v1/admin/departments
// access   private / admin
exports.deleteDepartment = asyncHandler(async(req, res, next) => {
    let department = await Department.findOne({ where: { id: req.params.id }})

    if (!department) return next(new ErrorResponse(`Подразделение с id ${req.params.id} не найдено`, 404))

    await Department.destroy({ where: { id: Number(req.params.id) } })

    res.status(200).json({ success: true })
})
