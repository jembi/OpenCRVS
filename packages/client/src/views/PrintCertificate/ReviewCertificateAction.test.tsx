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
import { Mock } from 'vitest'
import * as React from 'react'
import { createStore } from '@client/store'
import { storeDeclaration, IDeclaration } from '@client/declarations'
import {
  createTestComponent,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  flushPromises,
  loginAsFieldAgent,
  createRouterProps
} from '@client/tests/util'
import { ReviewCertificate } from './ReviewCertificateAction'
import { ReactWrapper } from 'enzyme'
import { IFormSectionData } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { cloneDeep } from 'lodash'
import { waitForElement } from '@client/tests/wait-for-element'
import { push } from 'connected-react-router'
import { useParams } from 'react-router-dom'

const deathDeclaration = {
  id: 'mockDeath1234',
  data: {
    ...mockDeathDeclarationData,
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  },
  event: Event.Death
}

describe('when user wants to review death certificate', () => {
  it('displays the "Confirm & Print" button', async () => {
    const { history, match } = createRouterProps(
      '/',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'mockDeath1234',
          eventType: Event.Death
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)

    const { store } = createStore()

    loginAsFieldAgent(store)

    const component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })

    // @ts-ignore
    store.dispatch(storeDeclaration(deathDeclaration))
    component.update()

    const confirmBtn = component.find('#confirm-print')
    const confirmBtnExist = !!confirmBtn.hostNodes().length
    expect(confirmBtnExist).toBe(true)
  })
})

describe('back button behavior tests of review certificate action', () => {
  let component: ReactWrapper

  const mockBirthDeclarationData = {
    ...cloneDeep(mockDeclarationData),
    history: [
      {
        date: '2022-03-21T08:16:24.467+00:00',
        regStatus: 'REGISTERED',
        reinstated: false
      }
    ]
  }
  mockBirthDeclarationData.registration.certificates[0] = {
    collector: {
      type: 'PRINT_IN_ADVANCE'
    }
  }

  it('takes user history back when navigated from inside app', async () => {
    const { history, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: true },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)

    const { store } = createStore(history)

    store.dispatch(push('/new-route', { isNavigatedInsideApp: true }))

    loginAsFieldAgent(store)
    const birthDeclaration = {
      id: 'asdhdqe2472487jsdfsdf',
      data: mockBirthDeclarationData,
      event: Event.Birth
    }
    store.dispatch(
      // @ts-ignore
      storeDeclaration(birthDeclaration)
    )
    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })

    component.find('#action_page_back_button').hostNodes().simulate('click')
    expect(history.location.pathname).toBe('/previous-route')
  })

  it('takes user to registration home when navigated from external link', async () => {
    const { history, match } = createRouterProps(
      '/previous-route',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)
    const { store } = createStore(history)

    loginAsFieldAgent(store)
    store.dispatch(
      // @ts-ignore
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: mockBirthDeclarationData,
        event: Event.Birth
      } as IDeclaration)
    )
    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })

    component.find('#action_page_back_button').hostNodes().simulate('click')
    await flushPromises()
    expect(history.location.pathname).toContain('/registration-home/print/')
  })
})

describe('when user wants to review birth certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { history, match } = createRouterProps(
      '/',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: 'asdhdqe2472487jsdfsdf',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)
    const { store } = createStore(history)

    const mockBirthDeclarationData = cloneDeep(mockDeclarationData)
    mockBirthDeclarationData.registration.certificates[0] = {
      collector: {
        type: 'PRINT_IN_ADVANCE'
      }
    }
    loginAsFieldAgent(store)
    await flushPromises()
    store.dispatch(
      storeDeclaration({
        id: 'asdhdqe2472487jsdfsdf',
        data: {
          ...mockBirthDeclarationData,
          history: [
            {
              date: '2022-03-21T08:16:24.467+00:00',
              regStatus: 'REGISTERED',
              reinstated: false
            }
          ] as unknown as IFormSectionData
        },
        event: Event.Birth
      })
    )

    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })
    await flushPromises()
    component.update()
  })

  it('displays have the Continue and print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })

  it('shows the Confirm Print Modal', () => {
    const confirmBtn = component.find('#confirm-print').hostNodes()
    confirmBtn.simulate('click')
    component.update()
    const modalIsDisplayed = !!component
      .find('#confirm-print-modal')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(true)
  })

  it('closes the modal on clicking the print the button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    confirmBtn.hostNodes().simulate('click')
    component.update()
    component.find('#print-certificate').hostNodes().simulate('click')
    component.update()

    const modalIsClosed = !!component.find('#confirm-print-modal').hostNodes()
      .length

    expect(modalIsClosed).toBe(false)
  })
})

describe('when user wants to review marriage certificate', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { history, match } = createRouterProps(
      '/',
      { isNavigatedInsideApp: false },
      {
        matchParams: {
          registrationId: '1234896128934719',
          eventType: Event.Birth
        }
      }
    )
    ;(useParams as Mock).mockImplementation(() => match.params)
    const { store } = createStore(history)

    const mockMarriageData = cloneDeep(mockMarriageDeclarationData)

    loginAsFieldAgent(store)
    await flushPromises()
    store.dispatch(
      storeDeclaration({
        id: '1234896128934719',
        data: {
          ...mockMarriageData,
          history: [
            {
              date: '2022-03-21T08:16:24.467+00:00',
              regStatus: 'REGISTERED',
              reinstated: false
            }
          ] as unknown as IFormSectionData
        },
        event: Event.Marriage
      })
    )

    component = await createTestComponent(<ReviewCertificate />, {
      store,
      history
    })
    await flushPromises()
    component.update()
  })

  it('displays have the Continue and print Button', () => {
    const confirmBtnExist = !!component.find('#confirm-print').hostNodes()
      .length
    expect(confirmBtnExist).toBe(true)
  })

  it('shows the Confirm Print Modal', () => {
    const confirmBtn = component.find('#confirm-print').hostNodes()
    confirmBtn.simulate('click')
    component.update()
    const modalIsDisplayed = !!component
      .find('#confirm-print-modal')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(true)
  })

  it('closes the modal on clicking the print the button', async () => {
    const confirmBtn = await waitForElement(component, '#confirm-print')
    confirmBtn.hostNodes().simulate('click')
    component.update()
    component.find('#print-certificate').hostNodes().simulate('click')
    component.update()

    const modalIsClosed = !!component.find('#confirm-print-modal').hostNodes()
      .length

    expect(modalIsClosed).toBe(false)
  })
})
