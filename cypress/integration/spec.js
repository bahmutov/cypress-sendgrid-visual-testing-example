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

        // unfortunately we cannot confirm the destination URL
        // via <a href="..."> attribute, because SendGrid changes
        // the href to its proxy URL

        // before we click on the link, let's make sure it
        // does not open a new browser window
        // https://glebbahmutov.com/blog/cypress-tips-and-tricks/#deal-with-target_blank
        cy.contains('a', 'Enter the confirmation code')
          // by default the link wants to open a new window
          .should('have.attr', 'target', '_blank')
          // but the test can point the open back at itself
          // so the click opens it in the current browser window
          .invoke('attr', 'target', '_self')
          .click()

        // use the location check once resolved
        // https://github.com/cypress-io/cypress/issues/16463
        cy.get('#confirmation_code', { timeout: 10000 }).should('be.visible')
        // confirm the URL changed back to our web app
        cy.location('pathname').should('equal', '/confirm')

        cy.get('#confirmation_code').type(code)
        cy.get('button[type=submit]').click()
        // first positive assertion, then negative
        // https://glebbahmutov.com/blog/negative-assertions/
        cy.get('[data-cy=confirmed-code]').should('be.visible')
        cy.get('[data-cy=incorrect-code]').should('not.exist')
      })
  })
})
