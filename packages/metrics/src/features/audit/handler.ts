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
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { USER_MANAGEMENT_URL } from '@metrics/constants'
import { PRACTITIONER_ID } from '@metrics/features/getTimeLogged/constants'
import { IUserAuditBody } from '@metrics/features/registration'
import { generateAuditPoint } from '@metrics/features/registration/pointGenerator'
import { writePoints } from '@metrics/influxdb/client'
import { getClientIdFromToken } from '@metrics/utils/authUtils'
import fetch from 'node-fetch'
import { countUserAuditEvents, getUserAuditEvents } from './service'

export async function newAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    const remoteAddress =
      request.headers['x-real-ip'] || request.info.remoteAddress
    const userAgent =
      request.headers['x-real-user-agent'] || request.headers['user-agent']
    const payload = request.payload as IUserAuditBody
    let practitionerId
    if (payload.practitionerId) {
      practitionerId = payload.practitionerId!
    } else {
      const userId = getClientIdFromToken(request.headers.authorization)
      const user = await getUser(userId, {
        Authorization: request.headers.authorization
      })
      practitionerId = user.practitionerId
    }

    points.push(
      generateAuditPoint(
        practitionerId,
        payload.action,
        remoteAddress,
        userAgent,
        payload.additionalData
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(201)
}

export async function getUser(
  userId: string,
  authHeader: { Authorization: string }
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}/getUser`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve user mobile number. Error: ${res.status} status received`
    )
  }

  return await res.json()
}

export async function getUserAuditsHandler(request: Hapi.Request) {
  const practitionerId = request.query[PRACTITIONER_ID]
  const skip = request.query['skip'] || 0
  const size = request.query['count']
  const timeStart = request.query['timeStart']
  const timeEnd = request.query['timeEnd']

  const results = await getUserAuditEvents(
    practitionerId,
    size,
    skip,
    timeStart,
    timeEnd
  )
  const total = await countUserAuditEvents(practitionerId, timeStart, timeEnd)
  return {
    results,
    total
  }
}
