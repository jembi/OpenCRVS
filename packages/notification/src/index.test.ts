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
import { createServer } from '@notification/server'
import { translationsMock } from '@notification/tests/util'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

describe('Route authorization', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  it('health check', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping'
    })
    expect(res.statusCode).toBe(200)
    expect(res.payload).toBe(JSON.stringify({ success: true }))
  })

  it('accepts requests with a valid token and valid user scope', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )
    fetch.mockResponse(JSON.stringify(translationsMock))
    const res = await server.server.inject({
      method: 'POST',
      url: '/birthDeclarationSMS',
      payload: {
        msisdn: '+447789778865',
        name: 'test',
        trackingId: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('blocks requests with a invalid user scope', async () => {
    const token = jwt.sign(
      { scope: ['demo'] }, // required declare | register | certify
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )
    fetch.mockResponse(JSON.stringify(translationsMock))
    const res = await server.server.inject({
      method: 'POST',
      url: '/birthDeclarationSMS',
      payload: {
        msisdn: '+447789778865',
        name: 'test',
        trackingId: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(403)
  })
})
