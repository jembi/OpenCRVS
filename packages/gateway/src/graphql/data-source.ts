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

import { AugmentedRequest, RESTDataSource } from '@apollo/datasource-rest'
import { Context } from '@gateway/graphql/context'
import { AuthenticationError } from '@gateway/utils/graphql-errors'
import { GraphQLError } from 'graphql'

export class OpenCRVSRESTDataSource extends RESTDataSource {
  public context: Context

  override willSendRequest(_path: string, request: AugmentedRequest) {
    const { authorization } = this.context.request.headers
    request.headers = { authorization }
  }

  override didEncounterError(error: Error) {
    if (
      error instanceof GraphQLError &&
      error.extensions.code === 'UNAUTHENTICATED'
    ) {
      throw new AuthenticationError()
    }
  }

  constructor(options: { contextValue: Context }) {
    super()
    this.context = options.contextValue
  }
}
