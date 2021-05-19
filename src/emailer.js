// @ts-check

// sending emails using SendGrid API
// by using pre-designed templates
// https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/
const sgMail = require('@sendgrid/mail')

// a little wrapper object that makes
// sending emails more convenient
let emailSender

const initEmailer = async () => {
  if (emailSender) {
    // already created
    return emailSender
  }

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error(`Missing SENDGRID_API_KEY variable`)
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  emailSender = {
    /**
     * Sends an email through SendGrid
     * @param {*} options Email options object
     * @returns info object with sent email id
     */
    async sendMail(options) {
      if (process.env.SENDGRID_FROM) {
        options = { ...options, from: process.env.SENDGRID_FROM }
      }
      const info = await sgMail.send(options)
      console.log('Message sent to %s', options.to)

      return info
    },
  }

  return emailSender
}

module.exports = initEmailer
