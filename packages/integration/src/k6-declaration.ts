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
import { check, group } from 'k6'
import { post } from 'k6/http'
import { API_URL } from './constants.js'
import genReg from './gen-registration.js'
import { chooseElementUsingRate, fetchToken } from './utils.js'

export const options = {
  vus: 10,
  duration: '30s'
}

export function setup() {
  return {
    // users are assigned to locations so these rates affect which location is used
    tokens: [{ rate: 1, token: fetchToken('sakibal.hasan', 'test') }]
  }
}

export default (data) => {
  group('Birth Declaration', () => {
    const chosenToken = chooseElementUsingRate(data.tokens)
    const reg = genReg({ femaleRate: 0.45 })
    const res = post(API_URL, JSON.stringify(reg), {
      headers: {
        'Content-Type': 'application/fhir+json',
        Authorization: `Bearer ${chosenToken.token}`
      }
    })
    check(res, {
      'is status 200': (r) => r.status === 200
    })
  })
}
