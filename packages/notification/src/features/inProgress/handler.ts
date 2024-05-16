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
import {
  findCompositionSection,
  findExtension,
  findResourceFromBundleById,
  getComposition,
  getResourceFromBundleById,
  getTaskFromSavedBundle,
  getTrackingId,
  InProgressRecord,
  Patient,
  RelatedPerson,
  resourceIdentifierToUUID,
  SavedRelatedPerson
} from '@opencrvs/commons/types'
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'
import {
  getOfficeName,
  getRegistrationLocation
} from '@notification/features/utils'

function getInformantName(record: InProgressRecord) {
  const composition = getComposition(record)
  const informantSection = findCompositionSection(
    'informant-details',
    composition
  )
  if (!informantSection) {
    return null
  }
  const informantRelation: Partial<SavedRelatedPerson> =
    getResourceFromBundleById<RelatedPerson>(
      record,
      resourceIdentifierToUUID(informantSection.entry[0].reference)
    )
  if (!informantRelation.patient?.reference) {
    return null
  }
  const informant = findResourceFromBundleById<Patient>(
    record,
    resourceIdentifierToUUID(informantRelation.patient.reference)
  )
  const name = informant?.name?.find(({ use }) => use === 'en')
  if (!name) {
    return null
  }
  return [name.given?.join(' '), name.family.join(' ')].join(' ').trim()
}

function getContactPhoneNo(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const phoneNumberExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-phone-number',
    task.extension
  )
  return phoneNumberExtension?.valueString
}

function getContactEmail(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const emailExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-email',
    task.extension
  )
  return emailExtension?.valueString
}

export async function birthInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}

export async function deathInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}
