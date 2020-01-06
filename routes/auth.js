const express = require('express')
const { protect } = require('../middleware/auth')
const {
    register,
    auth,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    uploadImage
} = require('../controllers/auth')

const router = express.Router()

router.post('/registration', register)
router.post('/', auth)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)
router.put('/updateDetails', protect, updateDetails)
router.put('/updatePassword', protect, updatePassword)
router.post('/forgotPassword', forgotPassword)
router.put('/resetPassword/:resetToken', resetPassword)
router.put('/:id/upload', uploadImage)

module.exports = router
