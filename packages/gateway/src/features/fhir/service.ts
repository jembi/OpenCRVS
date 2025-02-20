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
import { FHIR_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { IAuthHeader } from '@opencrvs/commons'
import { Bundle, EVENT_TYPE, Task } from '@opencrvs/commons/types'

/** @deprecated */
export const fetchFHIR = <T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

/** @deprecated */
export const fetchFromHearth = <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json'
    },
    body
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`FHIR with Hearth request failed: ${error.message}`)
      )
    })
}

export async function getCompositionIdFromResponse(
  resBody: Bundle,
  eventType: EVENT_TYPE,
  authHeader: IAuthHeader
) {
  return { compositionId: getIDFromResponse(resBody) }
}

export async function getDeclarationIdsFromResponse(
  resBody: Bundle,
  authHeader: IAuthHeader,
  compId?: string
) {
  const compositionId = compId || getIDFromResponse(resBody)
  return getDeclarationIds(compositionId, authHeader)
}

export function getIDFromResponse(resBody: Bundle): string {
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR did not send a valid response`)
  }
  // return the Composition's id
  return resBody.entry[0].response.location.split('/')[3]
}

async function getDeclarationIds(
  compositionId: string,
  authHeader: IAuthHeader
) {
  const compositionBundle = await fetchFHIR(
    `/Composition/${compositionId}`,
    authHeader
  )
  if (!compositionBundle || !compositionBundle.identifier) {
    throw new Error(
      'getTrackingId: Invalid composition or composition has no identifier'
    )
  }
  return { trackingId: compositionBundle.identifier.value, compositionId }
}

export async function fetchTaskByCompositionIdFromHearth(id: string) {
  const task = await fetchFromHearth<Bundle<Task>>(
    `Task?focus=Composition/${id}`
  )
  return task
}

export const sendToFhir = async (
  body: string,
  suffix: string,
  method: string,
  token: string
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
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
