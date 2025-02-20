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
import { Request, ResponseToolkit } from '@hapi/hapi'
import { getTrackingId, RejectedRecord } from '@opencrvs/commons/types'
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'
import {
  getOfficeName,
  getRegistrationLocation
} from '@notification/features/utils'
import {
  getContactEmail,
  getContactPhoneNo,
  getPersonName,
  getInformantName
} from '@notification/features/utilsForPartiallyCompletedRecord'

export async function birthSentForUpdatesNotification(
  req: Request,
  h: ResponseToolkit
) {
  const rejectedRecord = req.payload as RejectedRecord
  await sendNotification(
    {
      sms: messageKeys.birthRejectionNotification,
      email: messageKeys.birthRejectionNotification
    },
    {
      sms: getContactPhoneNo(rejectedRecord),
      email: getContactEmail(rejectedRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(rejectedRecord),
      crvsOffice: getOfficeName(rejectedRecord),
      registrationLocation: getRegistrationLocation(rejectedRecord),
      informantName: getInformantName(rejectedRecord),
      name: getPersonName(rejectedRecord, 'child')
    }
  )
  return h.response().code(200)
}

export async function deathSentForUpdatesNotification(
  req: Request,
  h: ResponseToolkit
) {
  const rejectedRecord = req.payload as RejectedRecord
  await sendNotification(
    {
      sms: messageKeys.deathRejectionNotification,
      email: messageKeys.deathRejectionNotification
    },
    {
      sms: getContactPhoneNo(rejectedRecord),
      email: getContactEmail(rejectedRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(rejectedRecord),
      crvsOffice: getOfficeName(rejectedRecord),
      registrationLocation: getRegistrationLocation(rejectedRecord),
      informantName: getInformantName(rejectedRecord),
      name: getPersonName(rejectedRecord, 'deceased')
    }
  )
  return h.response().code(200)
}
