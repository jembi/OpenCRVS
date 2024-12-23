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
import { checkAuth } from '@client/profile/profileActions'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  flushPromises,
  natlSysAdminToken,
  registerScopeToken
} from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { merge } from 'lodash'
import * as React from 'react'
import { Navigation } from '@client/components/interface/Navigation'
import { ReactWrapper } from 'enzyme'
import { Mock, vi } from 'vitest'
import { createMemoryRouter } from 'react-router-dom'

const getItem = window.localStorage.getItem as Mock
const mockFetchUserDetails = vi.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      systemRole: 'REGISTRATION_AGENT'
    }
  }
}

const nameObjNatlSysAdmin = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      systemRole: 'NATIONAL_SYSTEM_ADMIN'
    }
  }
}

storage.getItem = vi.fn()
storage.setItem = vi.fn()

let { store } = createStore()
let client = createClient(store)

describe('Navigation for national system admin related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObjNatlSysAdmin)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(natlSysAdminToken)
    await store.dispatch(checkAuth())
    await flushPromises()

    const { component } = await createTestComponent(<OfficeHome />, { store })

    testComponent = component
  })

  it('Tabs loaded successfully including config tab', async () => {
    expect(testComponent.exists('#navigation_team')).toBeTruthy()
    expect(testComponent.exists('#navigation_config_main')).toBeTruthy()
    testComponent.find('#navigation_config_main').hostNodes().simulate('click')
    testComponent.update()
  })

  it('No application related tabs', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeFalsy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeFalsy()
    expect(testComponent.exists('#navigation_print')).toBeFalsy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeFalsy()
  })
})

describe('Navigation for Registration agent related tests', () => {
  let testComponent: ReactWrapper<{}, {}>
  let router: ReturnType<typeof createMemoryRouter>
  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())
    await flushPromises()

    const { component, router: testRouter } = await createTestComponent(
      <OfficeHome />,
      { store }
    )
    router = testRouter
    testComponent = component
  })
  it('renders page with team and performance tab for registration agent', async () => {
    const { component } = await createTestComponent(<OfficeHome />, {
      store,
      apolloClient: client
    })
    expect(component.exists('#navigation_team')).toBeTruthy()
    expect(component.exists('#navigation_performance')).toBeTruthy()
    expect(component.exists('#navigation_config_main')).toBeFalsy()
  })

  it('5 application tabs exists for registration agent', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeTruthy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeTruthy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeTruthy()
    expect(testComponent.exists('#navigation_print')).toBeTruthy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeTruthy()
    expect(testComponent.exists('#navigation_approvals')).toBeTruthy()
  })

  it('redirects when tabs are clicked', async () => {
    testComponent
      .find('#navigation_readyForReview')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    expect(router.state.location.pathname).toContain('readyForReview')

    testComponent
      .find('#navigation_requiresUpdate')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(router.state.location.pathname).toContain('requiresUpdate')

    testComponent.find('#navigation_approvals').hostNodes().simulate('click')
    await flushPromises()
    expect(router.state.location.pathname).toContain('approvals')
  })
})

describe('Navigation for District Registrar related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())
    await flushPromises()

    const { component } = await createTestComponent(
      <Navigation menuCollapse={() => {}} />,
      { store }
    )

    testComponent = component
  })
  it('settings and logout exists on navigation mobile view', async () => {
    expect(testComponent.exists('#navigation_settings')).toBeTruthy()
    expect(testComponent.exists('#navigation_logout')).toBeTruthy()
  })
})
