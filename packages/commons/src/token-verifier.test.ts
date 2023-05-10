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
import * as fetchMock from 'jest-fetch-mock'
import { validateFunc, verifyToken } from './token-verifier'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

describe('Token verifier module', () => {
  describe('.verifyToken()', () => {
    it('Calls the auth service and return true if valid', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: true
        })
      )

      const valid = await verifyToken('111', 'http://auth.opencrvs.org')
      expect(valid).toBe(true)
    })

    it('Calls the auth service and return false if valid', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const valid = await verifyToken('222', 'http://auth.opencrvs.org')
      expect(valid).toBe(false)
    })
  })

  describe('.validateFunc()', () => {
    it('Verifies the token and returns true when valid if check token is enabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: true
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'true',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(true)
      expect(result.credentials).toBe('111')
    })

    it('Verifies the token and returns false when valid if check token is enabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'true',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(false)
      expect(result.credentials).not.toBeDefined()
    })

    it('Returns true when check token is disabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'false',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(true)
      expect(result.credentials).toBe('111')
    })
  })
})
