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
import { getAuthorizationHeaderFromToken } from '@opencrvs/commons'
import {
  registerExternalValidationsWorker,
  registerRecordWorker
} from '@opencrvs/commons/message-queue'
import { invokeRegistrationValidation } from './features/registration/fhir/fhir-bundle-modifier'
import { markEventAsRegistered } from './features/registration/handler'
import {
  declareRecordHandler,
  registerRecordHandler,
  validateRecordHandler
} from './records/handler/create'

export async function register(connection: { host: string; port: number }) {
  await registerExternalValidationsWorker(connection, async (job) => {
    if (job.name === 'send-to-external-validation') {
      const { token, record } = job.data
      return invokeRegistrationValidation(
        record,
        getAuthorizationHeaderFromToken(token)
      )
    }

    if (job.name === 'record-validated-externally') {
      return markEventAsRegistered(job.data)
    }
  })
  await registerRecordWorker(connection, async (job) => {
    if (job.name === 'create-registration') {
      return registerRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
    if (job.name === 'create-declaration') {
      return declareRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
    if (job.name === 'create-validated-declaration') {
      return validateRecordHandler(
        job.data.payload,
        job.data.event,
        job.data.token
      )
    }
  })
}
