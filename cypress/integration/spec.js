/// <reference types="cypress" />
// @ts-check
// https://github.com/bahmutov/cypress-recurse
const { recurse } = require('cypress-recurse')
// https://docs.percy.io/docs/cypress
require('@percy/cypress')

describe('Email confirmation', () => {
  let userEmail

  before(() => {
    // get and check the test email only once before the tests
    cy.task('getUserEmail').then((email) => {
      expect(email).to.be.a('string')
      userEmail = email
    })
  })

  it('sends confirmation code', () => {
    const userName = 'Joe Bravo'

    cy.visit('/')
    cy.get('#name').type(userName)
    cy.get('#company_size').select('3')
    // avoiding visual difference due to new email
    cy.get('#email').type('gleb@acme.io')
    cy.percySnapshot('1 - registration screen')
    // type the real email
    cy.get('#email').clear().type(userEmail)
    cy.get('button[type=submit]').click()

    cy.log('**shows message to check emails**')
    cy.get('[data-cy=sent-email-to]')
      .should('be.visible')
      .and('have.text', userEmail)

    // retry fetching the email
    recurse(
      () => cy.task('getLastEmail'), // Cypress commands to retry
      Cypress._.isObject, // keep retrying until the task returns an object
      {
        timeout: 60000, // retry up to 1 minute
        delay: 5000, // wait 5 seconds between attempts
      },
    )
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html)
      })
    cy.log('**email has the user name**')
    cy.contains(`Dear ${userName},`).should('be.visible')
    cy.log('**email has the confirmation code**')
    cy.contains('a', 'Enter the confirmation code')
      .should('be.visible')
      .as('codeLink')
      .invoke('text')
      .then((text) => Cypress._.last(text.split(' ')))
      .then((code) => {
        cy.log(`**confirm the code ${code} works**`)
        expect(code, 'confirmation code')
          .to.be.a('string')
          .and.have.length.gt(5)

        // add synthetic delay, otherwise the email
        // flashes very quickly
        cy.wait(2000)
        // replace the dynamic confirmation code with constant text
        // since we already validated the code
        cy.get('@codeLink').invoke(
          'text',
          'Enter the confirmation code abc1234',
        )
        cy.contains('strong', new RegExp('^' + code + '$')).invoke(
          'text',
          'abc1234',
        )
        cy.percySnapshot('2 - email')

        // unfortunately we cannot confirm the destination URL
        // via <a href="..."> attribute, because SendGrid changes
        // the href to its proxy URL

        // before we click on the link, let's make sure it
        // does not open a new browser window
        // https://glebbahmutov.com/blog/cypress-tips-and-tricks/#deal-with-target_blank
        cy.get('@codeLink')
          // by default the link wants to open a new window
          .should('have.attr', 'target', '_blank')
          // but the test can point the open back at itself
          // so the click opens it in the current browser window
          .invoke('attr', 'target', '_self')
          .click()

        // confirm the URL changed back to our web app
        cy.location('pathname', { timeout: 30000 }).should('equal', '/confirm')
        cy.get('#confirmation_code').should('be.visible').type(code)
        cy.get('button[type=submit]').click()
        // first positive assertion, then negative
        // https://glebbahmutov.com/blog/negative-assertions/
        cy.get('[data-cy=confirmed-code]').should('be.visible')
        cy.get('[data-cy=incorrect-code]').should('not.exist')

        cy.get('#confirmation_code').clear().type('correct code')
        cy.percySnapshot('3 - correct code')
      })
  })

  it('rejects wrong code', () => {
    cy.visit('/confirm')
    cy.get('#confirmation_code').type('wrong code')
    cy.get('button[type=submit]').click()
    // first positive assertion, then negative
    // https://glebbahmutov.com/blog/negative-assertions/
    cy.get('[data-cy=incorrect-code]').should('be.visible')
    cy.get('[data-cy=confirmed-code]').should('not.exist')
    cy.percySnapshot('incorrect code')
  })
})
