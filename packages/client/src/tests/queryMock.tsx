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

/*
 * This mock is added because at the time of writing, we are running a very old version
 * of apollo client & react apollo and fetchPolicy isn't working with MockedProvider
 *
 * Remove when these dependencies are upgraded
 */

import {
  // eslint-disable-next-line no-restricted-imports
  Query as ApolloQuery,
  QueryComponentOptions
} from '@apollo/client/react/components'
import * as React from 'react'
import { vi } from 'vitest'

const mockQuery = function Query(props: QueryComponentOptions) {
  const { fetchPolicy, ...propsWithoutFetchPolicy } = props

  return <ApolloQuery {...propsWithoutFetchPolicy} />
}

vi.mock('@client/components/Query', () => ({
  Query: mockQuery
}))
