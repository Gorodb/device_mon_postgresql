const express = require('express')
const { protect, isUser } = require('../middleware/auth')
const {
    register,
    auth,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    uploadImage,
    validatePinCode,
    resendPinCode
} = require('../controllers/auth')

const router = express.Router()

router.post('/registration', register)
router.post('/auth', auth)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)
router.post('/validate_pin', isUser, validatePinCode)
router.post('/resend_pin', isUser, resendPinCode)
router.put('/updateDetails', protect, updateDetails)
router.put('/updatePassword', protect, updatePassword)
router.post('/forgotPassword', forgotPassword)
router.put('/resetPassword/:resetToken', resetPassword)
router.put('/:id/upload', uploadImage)

module.exports = router
