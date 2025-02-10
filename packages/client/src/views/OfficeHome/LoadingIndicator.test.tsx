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
import { LoadingIndicator } from './LoadingIndicator'
import { createTestComponent } from '@client/tests/util'
import { createStore } from '@client/store'

describe('LoadingIndicator test cases', () => {
  const { store } = createStore()

  it('Should display the Error', async () => {
    // @ts-ignore
    const { component: testComponent } = await createTestComponent(
      <LoadingIndicator
        loading={false}
        hasError={true}
        noDeclaration={false}
      />,
      { store }
    )
    const isShowingLoadingText = testComponent.find(
      'div#search-result-error-text-count'
    ).length
    expect(isShowingLoadingText).toBe(0)
  })
})
