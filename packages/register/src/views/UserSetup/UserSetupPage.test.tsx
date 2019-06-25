import * as React from 'react'
import {
  createTestComponent,
  flushPromises,
  validToken,
  mockUserResponse
} from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'

import { storage } from '@register/storage'
import { createStore } from '@register/store'
import { checkAuth } from '@register/profile/profileActions'
import { UserSetupPage } from '@register/views/UserSetup/UserSetupPage'
import { ProtectedAccount } from '@register/components/ProtectedAccount'

const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Sahriar',
          familyName: 'Nafis'
        }
      ],
      role: 'FIELD_AGENT',
      status: 'pending',
      type: 'CHA',
      practitionerId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('UserSetupPage tests', () => {
  const { store } = createStore()
  beforeAll(() => {
    getItem.mockReturnValue(validToken)
    store.dispatch(checkAuth({ '?token': validToken }))
  })
  it('renders page successfully', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupPage />,
      store
    )
    const app = testComponent.component
    expect(app.find('#user-setup-landing-page').hostNodes()).toHaveLength(1)
    expect(
      app
        .find('#user-setup-name-holder')
        .hostNodes()
        .text()
    ).toEqual('Sahriar Nafis')
  })
  it('go to password page', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <ProtectedAccount />,
      store
    )
    const app = testComponent.component

    app
      .find('#user-setup-start-button')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(app.find('#NewPassword')).toBeDefined()
  })
})
