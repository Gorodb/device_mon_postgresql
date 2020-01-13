const Sequelize = require("sequelize")
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const database = require('../models')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async')
const Users = database.Users
const PinCodes = database.Pincodes
const SessionsBlackList = database.SessionsBlackList
const ResetTokens = database.ResetTokens
const TokenLinks = database.TokensLinks
const Op = Sequelize.Op

const env = process.env

// @desc    Register user
// @rout    POST /api/v1/auth/register
// access   public
exports.register = asyncHandler(async(req, res, next) => {
    let { name, email, phone, password, description, location, department_id } = req.body

    if (await Users.findOne({ where: { email: email }})) {
        return next(new ErrorResponse(`Пользователь с email ${email} уже существует`, 400))
    }

    let user = await Users.create({ name, email, phone, password, description, location, department_id })

    await createPinCode(user.dataValues)

    sendTokenResponse(user, 200, res)
})

// @desc    Validate pin_code
// @rout    POST /api/v1/auth/validate_pin
// access   public
exports.validatePinCode = asyncHandler(async(req, res, next) => {
    let pinCode = req.body.pincode

    if (!pinCode) {
        return next(new ErrorResponse(`Необходимо указать пин-код`, 400))
    }

    let pin = await PinCodes.findOne({
        where: {
            user_id: req.user.id,
            pin_code: pinCode
        }
    })

    if (!pin) {
        return next(new ErrorResponse(`Пин-код введен не верно`, 400))
    } else if (pin.expiration_date < Date.now()) {
        return next(new ErrorResponse(`Пин-код уже не действителен, запросите пин-код повторно`, 400))
    }

    await PinCodes.destroy({ where: { user_id: req.user.id }})
    await Users.update({ is_email_confirmed: true }, { where: { id: req.user.id }})

    res.status(200).json({ success: true, data: {} })
})

// @desc    Resend pin_code
// @rout    POST /api/v1/auth/resend_pin
// access   public
exports.resendPinCode = asyncHandler(async(req, res, next) => {
    if (req.user) {
        await createPinCode(req.user)
    } else if (req.body.email) {
        const user = await Users.findOne({ where: { email: req.body.email, is_email_confirmed: false }})
        if (!user) {
            return next(new ErrorResponse(`Пользователь с указанным email не найден либо email уже подтвержден`, 400))
        }
        await createPinCode(user)
    } else {
        return next(new ErrorResponse(`Для повторной отправки пин-кода необходимо указать email, заданный при регистрации`, 400))
    }

    res.status(200).json({ success: true, data: {} })
})

// @desc    Auth user
// @rout    POST /api/v1/auth
// access   public
exports.auth = asyncHandler(async(req, res, next) => {
    let { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Для автризации введите email и пароль', 400))
    }

    const user = await Users.findOne({ where: { email }, withPassword: 'true'})

    if (!user) {
        return next(new ErrorResponse('Пользователь с таким email и паролем не найден', 400))
    }

    // Check if password matches
    const isMatch = await Users.matchPassword(password, user.password)

    if (!isMatch){
        return next(new ErrorResponse('Пользователь с таким email и паролем не найден', 401))
    }

    const pinCode = await PinCodes.findOne({ where: { user_id: user.id }})

    if (pinCode && pinCode.expiration_date > Date.now() && !req.user.is_email_confirmed) {
        return next(new ErrorResponse('Email не подтвержден, для продолжения работы вам нужно подтвердить свой email', 403))
    }

    sendTokenResponse(user, 200, res)
})

// @desc    Log user out
// @rout    POST /api/v1/auth/logout
// access   private
exports.logout = asyncHandler(async(req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
        return next(new ErrorResponse('Вы не авторизованы', 401))
    }

    await SessionsBlackList.create({
        token: token,
        expiration_date: jwt.decode(token).exp * 1000,
        user_id: req.user.id
    })

    res.status(200).json({ success: true, data: {} })
})

// @desc    Get current logged in user
// @rout    GET /api/v1/auth/me
// access   Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await Users.findById(req.user.id)

    res.status(200).json({ success: true, data: user })
})

// @desc    Update user details
// @rout    PUT /api/v1/auth/updateDetails
// access   Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }

    let user = await Users.update(fieldsToUpdate, { where: { id: req.user.id }})

    if (!user) {
        return next(new ErrorResponse(`Пользователь с id ${req.user.id} не найден`, 404))
    }

    user = await Users.findOne({ where: { id: req.user.id }})

    res.status(200).json({ success: true, data: user, message: 'Информация успешно обновлена' })
})

// @desc    Update password
// @rout    PUT /api/v1/auth/updatePassword
// access   Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    let user = await Users.findOne({ where: { id: req.user.id }, withPassword: 'true'})

    // Check current password
    if (!(await Users.matchPassword(req.body.currentPassword, user.password))) {
        return next(new ErrorResponse('Старый пароль введен не верно', 401))
    }

    let password = await Users.cryptPassword(req.body.newPassword)
    await Users.update({ password }, { where: { id: req.user.id }})

    res.status(200).json({ success: true, message: 'Пароль успешно обновлен' })
})

// @desc    Forgot password
// @rout    POST /api/v1/auth/forgotPassword
// access   Private
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await Users.findOne({ where: { email: req.body.email }})

    if(!user) {
        return next(new ErrorResponse(`Пользователь с таким email не найден`, 404))
    }

    // delete old tokens for user, if they exists
    await TokenLinks.destroy({ where: { user_id: user.id }})
    await ResetTokens.destroy({ where: { user_id: user.id }})

    // Get reset token
    const { resetToken, resetPasswordExpire , resetPasswordToken } = Users.getResetPasswordToken()
    const tokenLink = await ResetTokens.create({
        user_id: user.id,
        reset_password_token: resetPasswordToken,
        reset_password_expire: resetPasswordExpire
    })

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`

    const message = `Чтобы сбросить пароль перейдите по ссылке из письма: \n\n ${resetUrl}`

    try {
        if (env.NODE_ENV === 'production') {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            })
        } else {
            await TokenLinks.create({user_id: user.id, link: resetUrl, expiration_date: resetPasswordExpire})
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            })
        }
        res.status(200).json({ success: true, data: 'Email отправлен' })
    } catch (err) {
        console.log(err)
        await ResetTokens.destroy({ where:
                {
                    user_id: tokenLink.user_id,
                    reset_password_expire: { [Op.lte]: Date.now() }
                }
        })
        await TokenLinks.destroy({ where:
                {
                    user_id: tokenLink.user_id,
                    expiration_date: {[Op.lte]: Date.now() }
                }
        })

        return next(new ErrorResponse('Не удалось отправить email', 500))
    }
})

// @desc    Reset user's password
// @rout    PUT /api/v1/auth/resetPassword/:resetToken
// access   Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex')

    const resetToken = await ResetTokens.findOne({ where: {
            reset_password_token: resetPasswordToken,
            reset_password_expire: { [Op.gt]: Date.now() }
        }
    })

    if (!resetToken) return next(new ErrorResponse('Токен не действителен', 400))

    const user = await Users.findOne({ where: { id: resetToken.user_id }})

    if (!user) return next(new ErrorResponse('Токен не действителен', 400))

    // Set new password
    const newPassword = await Users.cryptPassword(`${req.body.password}`)
    await TokenLinks.destroy({ where: { user_id: user.id }})
    await ResetTokens.destroy({ where: { user_id: user.id }})
    await Users.update({ password: newPassword }, { where: { id: user.id }})

    sendTokenResponse(user, 200, res)
})

// @desc    Upload avatar
// @rout    PUT /api/v1/auth/:id/upload
// access   private
exports.uploadImage = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({ where: {id: req.params.id }})

    if (!user) {
        return next(new ErrorResponse(`Учетная запись не найдена`, 404))
    }

    if (!req.files) {
        return next(new ErrorResponse(`Изображение отсутствует`, 400))
    }

    const file = req.files.image

    // Make sure that the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Пожалуйста, загрузите изображение`, 400))
    }

    if (!file.mimetype.match(/jpeg|pjpeg|png/g)) {
        return next(new ErrorResponse(`Пожалуйста, загрузите изображение формата jpeg или png`, 400))
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Максимальный размер файла не должен превышать ${process.env.MAX_FILE_UPLOAD/1048576}Mb`, 400))
    }

    // Create custom filename
    file.name = `image_${user.id}${path.parse(file.name).ext}`

    // Delete existing image
    await Users.deleteImage(user.image, file.name)

    if (!fs.existsSync(process.env.FILE_UPLOAD_PATH)){
        fs.mkdirSync(process.env.FILE_UPLOAD_PATH, { recursive: true })
    }

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new ErrorResponse(`При загрузке файла возникли проблемы`, 500))
        }
    })

    await Users.update({ photo: file.name }, { where: { id: req.params.id }})

    res.status(200).json({
        success: true,
        data: file.name
    })
})

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = Users.getSignedJwtToken(user)

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(statusCode).json({ success: true, token })
}

const createPinCode = async (user) => {
    let pinCode = {
        user_id: user.id,
        expiration_date: Date.now() + parseInt(env.PINCODE_EXPIRE, 10) * 60 * 1000 || Date.now() + 60 * 60 * 1000 // 60 min
    }

    pinCode = await PinCodes.create(pinCode)

    try {
        await sendEmail({
            email: user.email,
            subject: 'Пин-код для завершения регистрации',
            message: `Пин-код для завершения регистрации: ${pinCode.pin_code}`
        })
    } catch (err) {
        console.log(err)
    }
}
