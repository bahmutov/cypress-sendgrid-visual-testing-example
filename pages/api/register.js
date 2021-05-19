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

    const emailer = await initEmailer()
    const info = await emailer.sendTemplateEmail({
      to: email,
      subject: 'Confirmation code 1️⃣2️⃣3️⃣',
    })
    console.log('sent a confirmation email to %s', email)
    return
  }

  return res.status(404)
}
