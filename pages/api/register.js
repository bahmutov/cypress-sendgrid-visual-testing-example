// @ts-check
const initEmailer = require('../../src/emailer')
const codes = require('../../src/confirmation-codes')

export default async (req, res) => {
  if (req.method === 'POST') {
    const { name, email } = req.body

    const confirmationCode = codes.createCode(email, name)
    console.log(
      'for "%s" at %s the confirmation code is %s',
      name,
      email,
      confirmationCode,
    )

    // return to the HTTP caller right away
    res.status(200).json({ name, email })

    try {
      const emailer = await initEmailer()
      await emailer.sendTemplateEmail({
        to: email,
        // the ID of the dynamic template we have designed
        template_id: 'd-9b1e07a7d2994b14ae394026a6ccc997',
        dynamic_template_data: {
          code: confirmationCode,
          username: name,
          confirm_url: 'http://localhost:3000/confirm',
        },
      })
      console.log('sent a confirmation email to %s', email)
      return
    } catch (e) {
      console.error(e)
    }
  }

  return res.status(404)
}
