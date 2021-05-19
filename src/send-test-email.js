const initEmailer = require('./emailer')

// quickly verifying that SendGrid is sending the email
initEmailer()
  .then((emailer) => {
    return emailer.sendTemplateEmail({
      to: 'gleb.bahmutov@gmail.com',
      // confirmation code template
      template_id: 'd-9b1e07a7d2994b14ae394026a6ccc997',
      dynamic_template_data: {
        code: '1234567',
        username: 'Joe Bravo',
      },
    })
  })
  .catch((e) => {
    console.error(e)
  })
