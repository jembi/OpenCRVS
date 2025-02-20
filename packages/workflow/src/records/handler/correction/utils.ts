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
import {
  Bundle,
  BundleEntry,
  isCorrectionRequestedTask,
  isTask,
  OpenCRVSPractitionerName,
  TransactionResponse,
  URLReference,
  urlReferenceToResourceIdentifier,
  urlReferenceToUUID
} from '@opencrvs/commons/types'
import { NOTIFICATION_SERVICE_URL } from '@workflow/constants'
import { partition } from 'lodash'

type Contacts =
  | { email: string }
  | { msisdn: string }
  | { email: string; msisdn: string }

type PayloadMap = {
  approveCorrectionRequest: ApprovePayload
  rejectCorrectionRequest: RejectPayload
}

type ApprovePayload = {
  event: string
  trackingId: string
  userFullName: OpenCRVSPractitionerName[]
}

type RejectPayload = ApprovePayload & { reason: string }

export function findActiveCorrectionRequest(bundle: Bundle) {
  return bundle.entry
    .map(({ resource }) => resource)
    .filter(isTask)
    .filter(isCorrectionRequestedTask)
    .find((task) => {
      return task.status === 'requested'
    })
}

export async function sendNotification<T extends keyof PayloadMap>(
  smsType: T,
  recipient: Contacts,
  authHeader: { Authorization: string },
  notificationPayload: PayloadMap[T]
) {
  const res = await fetch(`${NOTIFICATION_SERVICE_URL}${smsType}`, {
    method: 'POST',
    body: JSON.stringify({
      ...recipient,
      ...notificationPayload
    }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to send notification ${res.statusText}`)
  }

  return res
}

const replaceTmpURN = (
  resource: any,
  tmpURN: string,
  fullUrl: URLReference
) => {
  if (Array.isArray(resource)) {
    resource.forEach((item, index) => {
      if (item === tmpURN) {
        resource[index] = fullUrl
      } else {
        replaceTmpURN(item, tmpURN, fullUrl)
      }
    })
  } else if (typeof resource === 'object' && resource !== null) {
    for (const key in resource) {
      if (resource[key] === tmpURN) {
        resource[key] =
          key === 'reference'
            ? urlReferenceToResourceIdentifier(fullUrl)
            : fullUrl
      } else {
        replaceTmpURN(resource[key], tmpURN, fullUrl)
      }
    }
  }
}

export const updateFullUrl = <T extends Bundle>(
  transactionResponse: TransactionResponse,
  bundle: T
): T => {
  const [history, others] = partition(bundle.entry, (entry: BundleEntry) =>
    entry.resource.resourceType.endsWith('History')
  )

  transactionResponse.entry.forEach(
    ({ response: { status, location } }, id) => {
      if (status === '201') {
        others[id].fullUrl &&
          replaceTmpURN(bundle, others[id].fullUrl, location)
        others[id].resource.id = urlReferenceToUUID(location)
      }
    }
  )

  return {
    ...bundle,
    entry: [...others, ...history]
  }
}
