const ErrorResponse = require('../utils/errorResponse')

const advancedResults = (model, join = {}, includes) => async (req, res, next) => {
    let reqQuery = { ...req.query }

    // Removing fields from req.query string
    const removeFields = ['sort', 'sort_dir', 'page', 'limit']
    removeFields.forEach(param => delete reqQuery[param])

    // Sort (sort dir = ask/desc)
    if (req.query.sort) {
        const sortBy = req.query.sort ? req.query.sort : 'createdAt'
        let sortDir = req.query.sort_dir ? req.query.sort_dir.toUpperCase() : ''
        sortDir = ['ASC', 'DESC'].indexOf(sortDir) !== -1 ? sortDir : 'ASC'
        reqQuery.order = [[sortBy, sortDir]]
    }

    // Pagination
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1
    let limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10
    limit = limit <= 100 ? limit: 100
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = req.department ? await model.count({where: { department_id: req.department }}) : await model.count()


    reqQuery.offset = (page - 1)*limit
    reqQuery.limit = limit
    reqQuery = Object.assign(reqQuery, join)

    if (req.department) {
        reqQuery = Object.assign(reqQuery, {
            where: { department_id: req.department}
        })
    }

    console.log(reqQuery)

    let results

    try {
        results = await model.findAll(reqQuery)
        if (includes) {
            for (let result of results) {
                result.dataValues.held_devices = (await includes(result.id))[0]
            }
        }
    } catch (err) {
        return next(new ErrorResponse(`${err}`, 404))
    }

    // Pagination result
    let pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    pagination.pages = Math.ceil(total / limit)

    res.advancedResults = {
        count: total,
        pagination,
        items: results
    }

    next()
}

module.exports = advancedResults