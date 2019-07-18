/// <reference types="Cypress" />

context('Death Registration Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to registration using minimum input', () => {
    cy.login('fieldWorker')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_SON').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contact_SON').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'No ID available', 'No ID available')
    cy.get('#familyName').type('খান')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.get('#currentAddressSameAsPermanent_true').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'No ID available', 'No ID available')
    cy.get('#applicantFamilyName').type('উদ্দিন')
    cy.get('#applicantFamilyNameEng').type('Uddin')
    cy.selectOption(
      '#applicantsRelationToDeceased',
      'Extended Family',
      'Extended Family'
    )
    cy.get('#applicantPhone').type('01712345678')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.get('#applicantPermanentAddressSameAsCurrent_true').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')
    cy.get('#deathPlaceAddress_PERMANENT').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_false').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // DOCUMENT DETAILS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.wait(6000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0', { timeout: 30000 }).then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Death review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#registerApplicationBtn').click()
        // MODAL
        cy.get('#register_confirm').click()
        cy.wait(1000)
      } else {
        cy.log('Death review not found')
      }
    })
  })

  it('Tests from application to registration using maximum input', () => {
    cy.login('fieldWorker')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_SON').click()
    cy.get('#continue').click()

    // SELECT MAIN CONTACT POINT
    cy.get('#contact_SON').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    cy.get('#firstNames').type('ক ম আব্দুল্লাহ আল আমিন ')
    cy.get('#familyName').type('খান')
    cy.get('#firstNamesEng').type('K M Abdullah al amin')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
    cy.get('#postCodePermanent').type('1024')
    cy.get('#currentAddressSameAsPermanent_false').click()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'Drivers License', 'Drivers License')
    cy.get('#applicantID').type('JS0013011C00001')
    cy.get('#applicantFirstNames').type('জামাল উদ্দিন খান')
    cy.get('#applicantFamilyName').type('খান')
    cy.get('#applicantFirstNamesEng').type('Jamal Uddin Khan')
    cy.get('#applicantFamilyNameEng').type('Khan')
    cy.get('#applicantBirthDate-dd').type('17')
    cy.get('#applicantBirthDate-mm').type('10')
    cy.get('#applicantBirthDate-yyyy').type('1956')
    cy.selectOption('#applicantsRelationToDeceased', 'Father', 'Father')
    cy.get('#applicantPhone').type('01712345678')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('48')
    cy.get('#postCode').type('1024')
    cy.get('#applicantPermanentAddressSameAsCurrent_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
    cy.get('#postCodePermanent').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')
    cy.selectOption('#manner', 'Homicide', 'Homicide')
    cy.get('#deathPlaceAddress_OTHER').click()
    cy.selectOption('#placeOfDeath', 'Private Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_true').click()
    cy.selectOption(
      '#methodOfCauseOfDeath',
      'Medically Certified Cause of Death',
      'Medically Certified Cause of Death'
    )
    cy.get('#causeOfDeathCode').type('1009')
    cy.wait(1000)
    cy.get('#next_section').click()
    // DOCUMENT DETAILS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.wait(6000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0', { timeout: 30000 }).then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Death review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#registerApplicationBtn').click()
        // MODAL
        cy.get('#register_confirm').click()
        cy.wait(1000)
      } else {
        cy.log('Death review not found')
      }
    })
  })
})
