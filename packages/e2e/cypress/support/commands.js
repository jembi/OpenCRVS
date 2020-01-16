/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (userType, options = {}) => {
  const users = {
    fieldWorker: {
      username: 'sakibal.hasan',
      password: 'test'
    },
    registrar: {
      username: 'mohammad.ashraful',
      password: 'test'
    },
    sysAdmin: {
      username: 'shahriar.nafis',
      password: 'test'
    }
  }

  const user = users[userType]
  cy.request({
    url: `${Cypress.env('AUTH_URL')}authenticate`,
    method: 'POST',
    body: {
      username: user.username,
      password: user.password
    }
  })
    .its('body')
    .then(body => {
      cy.request({
        url: `${Cypress.env('AUTH_URL')}verifyCode`,
        method: 'POST',
        body: {
          nonce: body.nonce,
          code: '000000'
        }
      })
        .its('body')
        .then(body => {
          cy.visit(`${Cypress.env('CLIENT_URL')}?token=${body.token}`)
        })
    })

  // Wait for app to load so token can be stored
  cy.get('#createPinBtn')
})

Cypress.Commands.add('selectOption', (selector, text, option) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .get(`${selector} .react-select__menu`)
    .contains(option)
    .click()
})

Cypress.Commands.add('logout', () => {
  cy.get('#sub-menu').click()
  cy.get('#Logout-menu-item').click()
})

Cypress.Commands.add('goToNextFormSection', () => {
  cy.tick(1000) // Clear debounce wait from form
  cy.get('#next_section').click()
})

Cypress.Commands.add('createPin', () => {
  // CREATE PIN
  cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
  cy.get('#createPinBtn', { timeout: 30000 }).click()
  for (let i = 1; i <= 8; i++) {
    cy.get('#pin-keypad-container')
      .click()
      .type(`${i % 2}`)
  }
})
Cypress.Commands.add('submitApplication', () => {
  // PREVIEW
  cy.get('#submit_form').click()
  // MODAL
  cy.get('#submit_confirm').click()
  cy.log('Waiting for application to sync...')
  cy.tick(40000)
  cy.get('#row_0 #submitted0').should('exist')
})
Cypress.Commands.add('rejectApplication', () => {
  cy.get('#rejectApplicationBtn').click()
  // REJECT MODAL
  cy.get('#rejectionReasonother').click()
  cy.get('#rejectionCommentForHealthWorker').type(
    'Lack of information, please notify informant about it.'
  )
  // PREVIEW
  cy.get('#submit_reject_form').click()
  cy.log('Waiting for application to sync...')
  cy.tick(20000)
  cy.get('#Spinner').should('not.exist')
})

Cypress.Commands.add('registerApplication', () => {
  cy.get('#registerApplicationBtn').click()
  // MODAL
  cy.get('#submit_confirm').click()
  cy.log('Waiting for application to sync...')
  cy.tick(20000)
  cy.get('#Spinner').should('not.exist')
  cy.get('#tab_review').contains('Ready for review (0)')
})

Cypress.Commands.add('verifyLandingPageVisible', () => {
  cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
  cy.get('#header_new_event').click()
})
Cypress.Commands.add('initializeFakeTimers', () => {
  cy.clock(new Date().getTime())
})
Cypress.Commands.add('downloadFirstApplication', () => {
  cy.get('#ListItemAction-0-icon').should('exist')
  cy.get('#ListItemAction-0-icon')
    .first()
    .click()
  cy.log('Waiting for application to sync...')
  cy.tick(20000)
  cy.get('#action-loading-ListItemAction-0').should('not.exist')
})

function getRandomNumbers(n) {
  let result = ''
  for (let i = 0; i < n; i++) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

Cypress.Commands.add('declareApplicationWithMinimumInput', () => {
  // LOGIN
  cy.login('fieldWorker')
  cy.createPin()
  cy.verifyLandingPageVisible()

  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()

  // SELECT INFORMANT
  cy.get('#select_informant_BOTH_PARENTS').click()
  cy.get('#continue').click()

  // SELECT APPLICANT
  cy.get('#applicant_MOTHER').click()
  cy.goToNextFormSection()

  // SELECT MAIN CONTACT POINT
  cy.get('#contactPoint_MOTHER').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '015' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()

  // APPLICATION FORM
  // CHILD DETAILS
  cy.get('#familyName').type('স্পিভক')
  cy.get('#familyNameEng').type('Spivak')
  cy.selectOption('#gender', 'Female', 'Female')
  cy.get('#childBirthDate-dd').type(
    Math.floor(1 + Math.random() * 27).toString()
  )
  cy.get('#childBirthDate-mm').type(
    Math.floor(1 + Math.random() * 12).toString()
  )
  cy.get('#childBirthDate-yyyy').type('2018')
  cy.get('#multipleBirth').type('1')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
  cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
  cy.selectOption('#state', 'Dhaka', 'Dhaka')
  cy.selectOption('#district', 'Gazipur', 'Gazipur')
  cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
  cy.goToNextFormSection()

  // MOTHER DETAILS
  cy.selectOption('#iDType', 'National_ID', 'National ID')
  const id = getRandomNumbers(17)
  console.log('TÄSSÄ', id)
  cy.get('#iD').type(id)
  cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
  cy.get('#familyName').type('বেগম')
  cy.get('#familyNameEng').type('Begum')
  cy.get('#motherBirthDate-dd').type(
    Math.floor(1 + Math.random() * 29).toString()
  )
  cy.get('#motherBirthDate-mm').type(
    Math.floor(1 + Math.random() * 12).toString()
  )
  cy.get('#motherBirthDate-yyyy').type(
    1900 + Math.floor(Math.random() * 100).toString()
  )
  cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
  cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
  cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
  cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
  cy.goToNextFormSection()

  // FATHER DETAILS
  cy.get('#fathersDetailsExist_false').click()
  cy.goToNextFormSection()

  // DOCUMENTS
  cy.goToNextFormSection()

  cy.submitApplication()

  // LOG OUT
  cy.get('#ProfileMenuToggleButton').click()
  cy.get('#ProfileMenuItem1').click()
})

Cypress.Commands.add('registerApplicationWithMinimumInput', () => {
  // DECLARE APPLICATION AS FIELD AGENT
  cy.declareApplicationWithMinimumInput()

  // LOGIN AS LOCAL REGISTRAR
  cy.login('registrar')
  cy.createPin()

  // LANDING PAGE
  cy.downloadFirstApplication()
  cy.get('#ListItemAction-0-Review').should('exist')
  cy.get('#ListItemAction-0-Review')
    .first()
    .click()

  cy.registerApplication()
})
