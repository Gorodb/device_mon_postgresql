const ErrorResponse = require('../utils/errorResponse')
const colors = require('colors')

const errorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    // log for console for dev
    console.log(err)

    try {
        // mongoose bad ObjectId
        if (err.name === 'CastError') {
            let message
            if (typeof err.message === 'object') {
                message = `Resource with id '${err.value}' not found`
            } else {
                message = `Resource '${JSON.stringify(err.value)}' not found in path '${err.path}'`
            }
            error = new ErrorResponse(message, 404)
        }

        // mongoose duplicates key
        if (err.code === 11000) {
            const message = `Duplicate field entered`
            error = new ErrorResponse(message, 400)
        }

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            let properties = Object.values(err.errors).map(val => val.properties)[0]
            let message
            if (!properties) {
                properties = Object.values(err.errors)[0]
                if (properties.name === 'CastError')
                    message = `${properties.path} = ${properties.stringValue} should have type of ${properties.kind}`
            } else {
                message = properties.message // `${properties.path} '${properties.value}' should be one of: ${properties.enumValues}`
            }
            console.log(message.red)
            error = new ErrorResponse(message, 400)
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Internal server error'
        })
    } catch (err) {
        console.log(err.toString().red)
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Internal server error'
        })
    }
}

module.exports = errorHandler
