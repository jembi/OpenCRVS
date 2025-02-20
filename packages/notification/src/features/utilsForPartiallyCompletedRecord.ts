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
  findCompositionSection,
  findExtension,
  findResourceFromBundleById,
  getComposition,
  getResourceFromBundleById,
  getTaskFromSavedBundle,
  Patient,
  InProgressRecord,
  RejectedRecord,
  RelatedPerson,
  resourceIdentifierToUUID,
  SavedRelatedPerson
} from '@opencrvs/commons/types'

export function getInformantName(record: InProgressRecord | RejectedRecord) {
  const composition = getComposition(record)
  const informantSection = findCompositionSection(
    'informant-details',
    composition
  )
  if (!informantSection) {
    return
  }
  const informantRelation: Partial<SavedRelatedPerson> =
    getResourceFromBundleById<RelatedPerson>(
      record,
      resourceIdentifierToUUID(informantSection.entry[0].reference)
    )
  if (!informantRelation.patient?.reference) {
    return
  }
  const informant = findResourceFromBundleById<Patient>(
    record,
    resourceIdentifierToUUID(informantRelation.patient.reference)
  )
  const name = informant?.name?.find(({ use }: { use: string }) => use === 'en')
  if (!name) {
    return
  }
  return [name.given?.join(' '), name.family].join(' ').trim()
}

export function getContactPhoneNo(record: InProgressRecord | RejectedRecord) {
  const task = getTaskFromSavedBundle(record)
  const phoneNumberExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-phone-number',
    task.extension
  )
  return phoneNumberExtension?.valueString
}

export function getContactEmail(record: InProgressRecord | RejectedRecord) {
  const task = getTaskFromSavedBundle(record)
  const emailExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-email',
    task.extension
  )
  return emailExtension?.valueString
}
