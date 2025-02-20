/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  selectOption,
  getFileFromBase64String,
  validImageB64String,
  inValidImageB64String,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  TestComponentWithRouteMock,
  flushPromises
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CollectorForm } from './CollectorForm'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { merge } from 'lodash'
import { EventType } from '@client/utils/gateway'
import { storeDeclaration } from '@client/declarations'
import {
  CERTIFICATE_COLLECTOR,
  VERIFY_COLLECTOR
} from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { vi } from 'vitest'

let store: AppStore

const declarationsHistory = [
  {
    date: '2022-04-14T12:52:34.112+00:00',
    action: 'DOWNLOADED',
    regStatus: 'DECLARED',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    signature: null,
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  },
  {
    date: '2022-04-14T12:52:25.951+00:00',
    regStatus: 'REGISTERED',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  },
  {
    date: '2022-04-14T12:52:25.798+00:00',
    regStatus: 'WAITING_VALIDATION',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  }
]

//@ts-ignore
mockDeclarationData['history'] = declarationsHistory

const birthDeclaration = {
  id: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
  data: mockDeclarationData,
  event: EventType.Birth
}

const deathDeclaration = {
  id: '16ff35e1-3f92-4db3-b812-c402e609fb00',
  data: mockDeathDeclarationData,
  event: EventType.Death
}

const marriageDeclaration = {
  id: '18ff35e1-3d92-4db3-b815-c4d2e609fb23',
  data: mockMarriageDeclarationData,
  event: EventType.Marriage
}

beforeEach(() => {
  const s = createStore()
  store = s.store
})

describe('Certificate collector test for a birth registration without father details', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>
    let router: TestComponentWithRouteMock['router']

    beforeEach(async () => {
      await flushPromises()
      store.dispatch(storeDeclaration(birthDeclaration))

      const { component: testComponent, router: testRouter } =
        await createTestComponent(<CollectorForm />, {
          store,
          path: VERIFY_COLLECTOR,
          initialEntries: [
            '/',
            formatUrl(VERIFY_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: birthDeclaration.id,
              eventType: birthDeclaration.event
            })
          ]
        })

      component = testComponent
      router = testRouter

      await waitForElement(component, '#collector_form')
    })

    it('father option will be available', async () => {
      await waitForElement(component, '#type_FATHER')
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(1)
    })

    it('prompt error when no option is selected', async () => {
      component.find('#confirm_form').hostNodes().simulate('click')
      await waitForElement(component, '#certificateTemplateId_error')
      expect(
        component.find('#certificateTemplateId_error').hostNodes().text()
      ).toBe('Please select certificate type')
      expect(component.find('#type_error').hostNodes().text()).toBe(
        'Please select who is collecting the certificate'
      )
    })

    it('redirects to id check component upon FATHER option selection', async () => {
      component
        .find('#type_FATHER')
        .hostNodes()
        .simulate('change', { target: { value: 'FATHER' } })
      await selectOption(
        component,
        '#certificateTemplateId',
        'Birth Certificate'
      )

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })

      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      expect(router.state.location.pathname).toBe(
        '/print/check/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/father'
      )
    })

    it('should redirect back to certificate collector option selection with father already selected', async () => {
      await flushPromises()
      component
        .find('#type_FATHER')
        .hostNodes()
        .simulate('change', { target: { value: 'FATHER' } })
      await selectOption(
        component,
        '#certificateTemplateId',
        'Birth Certificate'
      )

      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')

      component.update()

      component.find('#action_page_back_button').hostNodes().simulate('click')

      expect(component.find('#type_FATHER').hostNodes().props().checked).toBe(
        true
      )
    })

    it('redirects to user form for other collector upon Someone else option selection', async () => {
      component
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'OTHER' } })
      await selectOption(
        component,
        '#certificateTemplateId',
        'Birth Certificate'
      )

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      expect(router.state.location.pathname).toBe(
        '/cert/collector/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/otherCertCollector'
      )
    })
  })

  describe('Test other collector group', () => {
    let component: ReactWrapper<{}, {}>
    let router: TestComponentWithRouteMock['router']

    beforeEach(async () => {
      /*
       * Who is collecting the certificate?
       */
      await flushPromises()
      store.dispatch(storeDeclaration(birthDeclaration))

      const { component: testComponent, router: testRouter } =
        await createTestComponent(<CollectorForm />, {
          store,
          path: CERTIFICATE_COLLECTOR,
          initialEntries: [
            formatUrl(CERTIFICATE_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: birthDeclaration.id,
              eventType: birthDeclaration.event
            })
          ]
        })

      component = testComponent
      router = testRouter

      const form = await waitForElement(component, '#collector_form')

      // Set collector to someone else
      // done manually so the store is correctly updated
      form
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'OTHER' } })
      await selectOption(
        component,
        '#certificateTemplateId',
        'Birth Certificate'
      )

      // Continue
      form.find('#confirm_form').hostNodes().simulate('click')

      /*
       * Change view manually
       */
      component.setProps(
        merge({}, component.props(), {
          match: {
            params: {
              groupId: 'otherCertCollector'
            }
          }
        })
      )

      // Wait until next view is loaded
      await waitForElement(component, '#iDType')
    })

    it('show field level error when the mandatory fields are not filled', async () => {
      component.find('#confirm_form').hostNodes().simulate('click')
      await waitForElement(component, '#relationship_error')
      expect(component.find('#relationship_error').hostNodes().text()).toBe(
        'Required'
      )
    })

    describe('After user submits all other collector details', () => {
      beforeEach(async () => {
        await selectOption(
          component,
          '#iDType',
          'National ID number (in English)'
        )

        component
          .find('#iD')
          .hostNodes()
          .simulate('change', { target: { value: '123456789', id: 'iD' } })

        component
          .find('#firstName')
          .hostNodes()
          .simulate('change', { target: { value: 'Jon', id: 'firstName' } })

        component
          .find('#lastName')
          .hostNodes()
          .simulate('change', { target: { value: 'Doe', id: 'lastName' } })

        component
          .find('#relationship')
          .hostNodes()
          .simulate('change', {
            target: { value: 'Uncle', id: 'relationship' }
          })

        const $confirm = await waitForElement(component, '#confirm_form')
        $confirm.hostNodes().simulate('click')

        component.setProps(
          merge({}, component.props(), {
            match: {
              params: {
                groupId: 'affidavit'
              }
            }
          })
        )
        await waitForElement(
          component,
          'input[name="affidavitFile"][type="file"]'
        )
      })

      it('takes the user to affedavit view', async () => {
        expect(router.state.location.pathname).toBe(
          '/cert/collector/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/affidavit'
        )
      })

      it('show field level error when the mandatory fields are not filled', async () => {
        component.find('#confirm_form').hostNodes().simulate('click')
        await waitForElement(component, '#noAffidavitAgreement_error')
        expect(
          component.find('#noAffidavitAgreement_error').hostNodes().text()
        ).toBe(
          'Upload signed affidavit or click the checkbox if they do not have one.'
        )
      })

      it('shows form level error when invalid type of file is uploaded as affidavit file', async () => {
        component
          .find('input[name="affidavitFile"][type="file"]')
          .simulate('change', {
            target: {
              files: [
                getFileFromBase64String(
                  inValidImageB64String,
                  'index.svg',
                  'image/svg'
                )
              ]
            }
          })
        await waitForElement(component, '#field-error')
        expect(component.find('#field-error').hostNodes().text()).toBe(
          'png, jpeg supported only'
        )
      })

      it('continue to payment section when the mandatory fields are filled and birth event is between 45 days and 5 years', async () => {
        Date.now = vi.fn(() => 1538352000000) // 2018-10-01
        await waitForElement(component, '#noAffidavitAgreementAFFIDAVIT')
        component
          .find('#noAffidavitAgreementAFFIDAVIT')
          .hostNodes()
          .simulate('change', {
            checked: true
          })

        await waitForElement(component, '#confirm_form')
        component.find('#confirm_form').hostNodes().simulate('click')
        await waitForElement(
          component,
          '#noAffidavitAgreementConfirmationModal'
        )
        expect(
          component.find('#noAffidavitAgreementConfirmationModal').hostNodes()
        ).toHaveLength(1)

        component.find('#submit_confirm').hostNodes().simulate('click')

        expect(router.state.location.pathname).toBe(
          '/print/payment/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
        )
      })

      it('continue to review section when the mandatory fields are filled and birth event is before target days', async () => {
        birthDeclaration.data.child.childBirthDate = '2022-09-20'
        store.dispatch(storeDeclaration(birthDeclaration))
        const comp = await waitForElement(
          component,
          '#noAffidavitAgreementAFFIDAVIT'
        )
        comp.hostNodes().simulate('change', {
          checked: true
        })

        await new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        component.update()
        component.find('#confirm_form').hostNodes().simulate('click')
        expect(
          component.find('#noAffidavitAgreementConfirmationModal').hostNodes()
        ).toHaveLength(1)
        component.find('#submit_confirm').hostNodes().simulate('click')
        expect(router.state.location.pathname).toBe(
          '/review/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
        )
      })

      it('should hide field level error while uploading valid file', async () => {
        const $confirm = await waitForElement(component, '#confirm_form')
        $confirm.hostNodes().simulate('click')
        await waitForElement(component, '#noAffidavitAgreement_error')
        component
          .find('input[name="affidavitFile"][type="file"]')
          .simulate('change', {
            target: {
              files: [
                getFileFromBase64String(
                  validImageB64String,
                  'index.png',
                  'image/png'
                )
              ]
            }
          })
        await waitFor(() => {
          component.update()
          return (
            component.find('#noAffidavitAgreement_error').hostNodes().length ===
            0
          )
        })
      })
    })
  })
})

describe('Certificate collector test for a birth registration with father details', () => {
  const { store } = createStore()

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      await flushPromises()
      store.dispatch(storeDeclaration(birthDeclaration))

      const { component: testComponent } = await createTestComponent(
        <CollectorForm />,
        {
          store,
          path: CERTIFICATE_COLLECTOR,
          initialEntries: [
            formatUrl(CERTIFICATE_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: birthDeclaration.id,
              eventType: birthDeclaration.event
            })
          ]
        }
      )

      component = testComponent
    })

    it('father option will be available', async () => {
      const element = await waitForElement(component, '#type_FATHER')
      expect(element.hostNodes()).toHaveLength(1)
    })
  })
})

describe('Certificate collector test for a death registration', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>
    let router: TestComponentWithRouteMock['router']

    beforeEach(async () => {
      await flushPromises()
      store.dispatch(storeDeclaration(deathDeclaration))

      const { component: testComponent, router: testRouter } =
        await createTestComponent(<CollectorForm />, {
          store,
          path: CERTIFICATE_COLLECTOR,
          initialEntries: [
            formatUrl(CERTIFICATE_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: deathDeclaration.id,
              eventType: deathDeclaration.event
            })
          ]
        })

      component = testComponent
      router = testRouter
    })

    it('informant will be spouse', async () => {
      const element = await waitForElement(component, '#type_INFORMANT_SPOUSE')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('redirects to review certificate for print in advance option', async () => {
      const $printInAdvance = await waitForElement(
        component,
        '#type_PRINT_IN_ADVANCE'
      )
      $printInAdvance
        .hostNodes()
        .simulate('change', { target: { value: 'PRINT_IN_ADVANCE' } })

      await selectOption(
        component,
        '#certificateTemplateId',
        'Death Certificate Certified Copy'
      )

      const $confirm = await waitForElement(component, '#confirm_form')
      $confirm.hostNodes().simulate('click')

      expect(router.state.location.pathname).toBe(
        '/review/16ff35e1-3f92-4db3-b812-c402e609fb00/death'
      )
    })
  })
})

describe('Certificate collector test for a marriage registration', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>
    let router: TestComponentWithRouteMock['router']

    beforeEach(async () => {
      await flushPromises()
      store.dispatch(storeDeclaration(marriageDeclaration))

      const { component: testComponent, router: testRouter } =
        await createTestComponent(<CollectorForm />, {
          store,
          path: CERTIFICATE_COLLECTOR,
          initialEntries: [
            formatUrl(CERTIFICATE_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: marriageDeclaration.id,
              eventType: marriageDeclaration.event
            })
          ]
        })

      component = testComponent
      router = testRouter
    })

    it('informant will be groom', async () => {
      const element = await waitForElement(component, '#type_INFORMANT_GROOM')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('bride will be available', async () => {
      const element = await waitForElement(component, '#type_BRIDE')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('redirects to review certificate for print in advance option', async () => {
      const $printInAdvance = await waitForElement(
        component,
        '#type_PRINT_IN_ADVANCE'
      )
      $printInAdvance
        .hostNodes()
        .simulate('change', { target: { value: 'PRINT_IN_ADVANCE' } })

      await selectOption(
        component,
        '#certificateTemplateId',
        'Marriage Certificate'
      )
      const $confirm = await waitForElement(component, '#confirm_form')
      $confirm.hostNodes().simulate('click')

      expect(router.state.location.pathname).toBe(
        '/review/18ff35e1-3d92-4db3-b815-c4d2e609fb23/marriage'
      )
    })
  })
})

describe('Certificate collector test for a birth registration without father and mother details', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      await flushPromises()
      //@ts-ignore
      delete birthDeclaration['data']['father']
      store.dispatch(storeDeclaration(birthDeclaration))
      await flushPromises()
      store.dispatch(storeDeclaration(marriageDeclaration))

      const { component: testComponent } = await createTestComponent(
        <CollectorForm />,
        {
          store,
          path: CERTIFICATE_COLLECTOR,
          initialEntries: [
            formatUrl(CERTIFICATE_COLLECTOR, {
              groupId: 'certCollector',
              registrationId: birthDeclaration.id,
              eventType: birthDeclaration.event
            })
          ]
        }
      )

      component = testComponent

      await waitForElement(component, '#collector_form')
    })

    it('informant will be mother', () => {
      expect(component.find('#type_INFORMANT_MOTHER').hostNodes()).toHaveLength(
        1
      )
    })

    it('father option will not be available', () => {
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(0)
    })
  })
})
