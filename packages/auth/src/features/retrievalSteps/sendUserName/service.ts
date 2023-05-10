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
import { JWT_ISSUER, NOTIFICATION_SERVICE_URL } from '@auth/constants'
import { createToken } from '@auth/features/authenticate/service'
import fetch from 'node-fetch'
import { resolve } from 'url'

export async function sendUserName(mobile: string, username: string) {
  const url = resolve(NOTIFICATION_SERVICE_URL, '/retrieveUserNameSMS')
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ msisdn: mobile, username }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await createToken(
        'auth',
        ['service'],
        ['opencrvs:notification-user', 'opencrvs:countryconfig-user'],
        JWT_ISSUER,
        true
      )}`
    }
  })
  if (res.status !== 200) {
    throw Error(`Unable to send username`)
  }
}
