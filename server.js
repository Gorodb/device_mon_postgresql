const path = require('path')
const express = require('express')
const cron = require('node-cron')
const sanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xssClean = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')
const fileUpload = require('express-fileupload')
const colors = require('colors')

const errorHandler = require('./middleware/error')
const { clearOldSessionsFromBlackList } = require('./controllers/users')

// load env files
dotenv.config({ path: './config/config.env' })

// Rout files
const auth = require('./routes/auth')
const users = require('./routes/users')
const deviceTypes = require('./routes/deviceTypes')
const devices = require('./routes/devices')
const adminDevices = require('./routes/adminDevices')
const mobile = require('./routes/mobile')
const departments = require('./routes/departments')

const app = express()

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// dev logging middleware
// create a write stream (in append mode)
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs')
})
app.use(morgan('combined', { stream: accessLogStream }))

// File uploading
app.use(fileUpload())

// Sanitize data
app.use(sanitize())

// Set security headers
app.use(helmet())

// Prevent xss attacks
app.use(xssClean())

// Rate limiting (100 requests per 10 minutes)
app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
}))

// Prevent http param pollution
app.use(hpp())

// Enable Cors
app.use(cors())

// Set public folder as static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v1', auth)
app.use('/api/v1/admin/users', users)
app.use('/api/v1/devices', devices)
app.use('/api/v1/admin/devices', adminDevices)
app.use('/api/v1/admin/device_types', deviceTypes)
app.use('/api/v1/mobile', mobile)
app.use('/api/v1/admin/departments', departments)

app.use(errorHandler)

// очистка таблиц каждые 12 часов
cron.schedule('0 */12 * * *', async () => {
    console.log('Запускается джоба по удалению сессий с истекшей датой из черного списка')
    await clearOldSessionsFromBlackList()
})

const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow)
)

// Handel unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // Close server and exit process
    server.close(() => process.exit(1))
})
