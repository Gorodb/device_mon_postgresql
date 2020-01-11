const nodemailer = require('nodemailer')

const env = process.env

const sendEmail = async (options) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        port: env.SMTP_PORT,
        host: env.SMTP_HOST,
        secure: true,
        tls:{
            rejectUnauthorized: false
        },
        auth: {
            user: env.SMTP_EMAIL,
            pass: env.SMTP_PASSWORD
        }
    })

    // send mail with defined transport object
    const message = {
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    const info = await transporter.sendMail(message)

    console.log('Message sent: %s', info.messageId)
}

module.exports = sendEmail
