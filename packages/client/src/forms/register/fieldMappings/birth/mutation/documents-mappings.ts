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
import { fieldToAttachmentTransformer } from '@client/forms/mappings/mutation/field-mappings'
import {
  TransformedData,
  IFormData,
  IFormField,
  BirthSection
} from '@client/forms'

export const birthDocumentForWhomFhirMapping = {
  CHILD: 'CHILD',
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  PARENT: 'PARENT',
  OTHER: 'OTHER',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF',
  LEGAL_GUARDIAN_PROOF: 'LEGAL_GUARDIAN_PROOF'
}

export const birthSectionMapping = {
  [BirthSection.Child]: [birthDocumentForWhomFhirMapping.CHILD],
  [BirthSection.Mother]: [birthDocumentForWhomFhirMapping.MOTHER],
  [BirthSection.Father]: [birthDocumentForWhomFhirMapping.FATHER],
  [BirthSection.Informant]: [
    birthDocumentForWhomFhirMapping.INFORMANT_ID_PROOF,
    birthDocumentForWhomFhirMapping.LEGAL_GUARDIAN_PROOF
  ]
}

export const birthSectionTitle = {
  [BirthSection.Child]: 'Child',
  [BirthSection.Mother]: 'Mother',
  [BirthSection.Father]: 'Father',
  [BirthSection.Informant]: 'Informant'
}

export const birthDocumentTypeFhirMapping = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER',
  NOTIFICATION_OF_BIRTH: 'NOTIFICATION_OF_BIRTH',
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY',
  REQUISITION: 'REQUISITION',
  COURT_ORDER: 'COURT_ORDER',
  MARRIAGE_CERTIFICATE: 'MARRIAGE_CERTIFICATE',
  RECOGNITION_PROOF: 'RECOGNITION_PROOF',
  ADOPTION_PROOF: 'ADOPTION_PROOF',
  NATIONAL_POLICE_ID: 'NATIONAL_POLICE_ID',
  REFUGEE_CARD: 'REFUGEE_CARD',
  RESIDENT_CARD: 'RESIDENT_CARD',
  RETIRED_POLICE_ID: 'RETIRED_POLICE_ID'
}

export function birthFieldToAttachmentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: BirthSection,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    birthDocumentForWhomFhirMapping,
    birthDocumentTypeFhirMapping
  )
}
