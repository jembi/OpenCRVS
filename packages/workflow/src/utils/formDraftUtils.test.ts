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
import * as fhirModifier from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { mockFormDraft, testFhirTaskBundle } from '@workflow/test/utils'
import {
  checkFormDraftStatusToAddTestExtension,
  getFormDraft
} from '@workflow/utils/formDraftUtils'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'

const fetch = fetchAny as any
let token: string

describe('Verify handler', () => {
  beforeEach(() => {
    token = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:config-user'
      }
    )
  })

  it('getFormDraft returns form draft response', async () => {
    fetch.resetMocks()
    fetch.mockResponse(JSON.stringify(mockFormDraft))

    const response = await getFormDraft(token)
    expect(response[0].status).toEqual('PUBLISHED')
  })

  it('getFormDraft returns form draft response', async () => {
    fetch.mockReject(new Error('error'))
    await expect(getFormDraft(token)).rejects.toThrowError('error')
  })
})

describe('checkFormDraftStatusToAddTestExtension handler', () => {
  beforeEach(() => {
    token = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:config-user'
      }
    )
  })

  it('checkFormDraftStatusToAddTestExtension returns form draft response', async () => {
    fetch.mockResponse(JSON.stringify(mockFormDraft))
    const spy = jest.spyOn(fhirModifier, 'setupTestExtension')
    await checkFormDraftStatusToAddTestExtension(
      testFhirTaskBundle.entry[0].resource,
      token
    )
    expect(spy).toBeCalledTimes(1)
  })
})
