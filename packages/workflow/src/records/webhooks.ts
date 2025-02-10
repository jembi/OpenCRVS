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
import fetch from 'node-fetch'
import {
  ArchivedRecord,
  CertifiedRecord,
  CorrectionRequestedRecord,
  EVENT_TYPE,
  getTrackingId,
  InProgressRecord,
  ReadyForReviewRecord,
  RegisteredRecord,
  ValidatedRecord
} from '@opencrvs/commons/types'
import { WEBHOOKS_URL } from '@workflow/constants'

const WEBHOOK_URLS = {
  [EVENT_TYPE.BIRTH]: new URL('/events/birth/mark-registered', WEBHOOKS_URL),
  [EVENT_TYPE.DEATH]: new URL('/events/death/mark-registered', WEBHOOKS_URL),
  [EVENT_TYPE.MARRIAGE]: new URL(
    '/events/marriage/mark-registered',
    WEBHOOKS_URL
  )
} satisfies Record<EVENT_TYPE, URL>

export const invokeWebhooks = async ({
  bundle,
  token,
  event,
  isNotRegistered,
  statusType
}: {
  bundle:
    | RegisteredRecord
    | CorrectionRequestedRecord
    | InProgressRecord
    | ReadyForReviewRecord
    | ValidatedRecord
    | CertifiedRecord
    | ArchivedRecord
  token: string
  event: EVENT_TYPE
  isNotRegistered?: boolean
  statusType?: 'rejected' | 'validated' | 'archived' | 'certified' | 'issued'
}) => {
  const trackingId = getTrackingId(bundle)

  const url = isNotRegistered
    ? new URL(`/events/${event}/status/${statusType}`, WEBHOOKS_URL)
    : WEBHOOK_URLS[event]
  const body = isNotRegistered
    ? `{"trackingId": "${trackingId}"}`
    : JSON.stringify(bundle)

  const request = await fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!request.ok) {
    throw new Error(
      `Dispatching webhook failed with [${
        request.status
      }] body: ${await request.text()}`
    )
  }

  return request
}
