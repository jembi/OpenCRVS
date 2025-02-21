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
import { env } from '@config/environment'
import { joinURL } from '@opencrvs/commons'

export const fetchFromHearth = async <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const response = await fetch(joinURL(env.FHIR_URL, suffix), {
    method,
    headers: {
      'Content-Type': 'application/fhir+json'
    },
    body
  })

  if (!response.ok) {
    throw new Error('Fetch from Hearth failed: ' + (await response.text()))
  }

  return (await response.json()) as Promise<T>
}

export const sendToFhir = async (
  body: string,
  suffix: string,
  method: string,
  token: string
) => {
  return fetch(`${env.FHIR_URL}${suffix}`, {
    method,
    body,
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `${token}`
    }
  })
    .then((response) => {
      return response
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}
