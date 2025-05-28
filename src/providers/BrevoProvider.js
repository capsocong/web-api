
const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'


let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY
export const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // khoi tao mot cai sendSmtpEmail
  const sendSmtpEmail = new brevo.SendSmtpEmail()
  // tai khoan gửi email:
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  }

  // người nhận email
  sendSmtpEmail.to = [{
    email: recipientEmail
  }]
  // tiêu đề email
  sendSmtpEmail.subject = customSubject
  // nội dung email
  sendSmtpEmail.htmlContent = htmlContent
  // gửi email
  // sendTransacEmail của thư viên Brevo sẽ trả về một Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}