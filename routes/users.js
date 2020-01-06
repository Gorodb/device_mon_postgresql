const express = require('express')
const database = require('../models')
const Users = database.Users
const TokenLinks = database.TokensLinks
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getTokenLinks
} = require('../controllers/users')

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.route('/')
    .get(advancedResults(Users, {
        include: [{
            model: database.Departments,
            as: 'department',
            required: false,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }]},
        Users.findAllWithHeldDevices()), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

router.route('/token_links/get_token_links')
    .get(advancedResults(TokenLinks), getTokenLinks)

module.exports = router