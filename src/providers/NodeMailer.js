import { env } from '~/config/environment'
const nodemailer = require('nodemailer')

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  // secure: true, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD
  }
})

export const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  const info = await transporter.sendMail({
    from: `"${env.ADMIN_EMAIL_NAME}"<${env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: customSubject,
    html: htmlContent
  })

  console.log('Message sent:', info)
  return info
}

export const NodemailerProvider = {
  sendEmail
}