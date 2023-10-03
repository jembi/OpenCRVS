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
import * as React from 'react'
import { createTestComponent, validToken } from '@client/tests/util'
import { createStore } from '@client/store'
import { checkAuth } from '@client/profile/profileActions'
import { SetupConfirmationPage } from '@client/views/UserSetup/SetupConfirmationPage'
import { Mock } from 'vitest'

const getItem = window.localStorage.getItem as Mock

describe('Setup confirmation page tests', () => {
  const { store, history } = createStore()
  beforeAll(async () => {
    getItem.mockReturnValue(validToken)
    await store.dispatch(checkAuth())
  })
  it('renders page successfully', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SetupConfirmationPage />,
      { store, history }
    )
    const app = testComponent
    expect(app.find('#user-setup-complete-page').hostNodes()).toHaveLength(1)
  })
})
