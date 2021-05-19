// sending ordinary emails using SendGrid API
// https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/
const sgMail = require('@sendgrid/mail')

// sending emails using the full SendGrid API
// for example if we want to use dynamic templates
// https://github.com/sendgrid/sendgrid-nodejs/tree/main/packages/client
const sgClient = require('@sendgrid/client')

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
  sgClient.setApiKey(process.env.SENDGRID_API_KEY)

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

    /**
     * Sends an email by using SendGrid dynamic design template
     * @see Docs https://sendgrid.api-docs.io/v3.0/mail-send/v3-mail-send
     */
    async sendTemplateEmail({ from, template_id, dynamic_template_data, to }) {
      const body = {
        from: {
          email: from || process.env.SENDGRID_FROM,
          name: 'Confirmation system',
        },
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data,
          },
        ],
        template_id,
      }

      const request = {
        method: 'POST',
        url: 'v3/mail/send',
        body,
      }
      const [response] = await sgClient.request(request)

      return response
    },
  }

  return emailSender
}

module.exports = initEmailer
