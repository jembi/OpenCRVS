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
  MarriageSection
} from '@client/forms'

export const marriageDocumentForWhomFhirMapping = {
  GROOM: 'GROOM',
  BRIDE: 'BRIDE',
  MARRIAGE_NOTICE_PROOF: 'MARRIAGE_NOTICE_PROOF',
  FAMILY_HEADS: 'FAMILY_HEADS',
  WITNESSES: 'WITNESSES'
}

export const marriageSectionMapping = {
  [MarriageSection.Registration]: [
    marriageDocumentForWhomFhirMapping.MARRIAGE_NOTICE_PROOF,
    marriageDocumentForWhomFhirMapping.FAMILY_HEADS,
    marriageDocumentForWhomFhirMapping.WITNESSES
  ],
  [MarriageSection.Groom]: [marriageDocumentForWhomFhirMapping.GROOM],
  [MarriageSection.Bride]: [marriageDocumentForWhomFhirMapping.BRIDE]
}

export const marriageDocumentTypeFhirMapping = {
  MARRIAGE_NOTICE: 'MARRIAGE_NOTICE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  RESIDENT_CARD: 'RESIDENT_CARD',
  REFUGEE_CARD: 'REFUGEE_CARD',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_POLICE_ID: 'NATIONAL_POLICE_ID',
  RETIRED_POLICE_ID: 'RETIRED_POLICE_ID',
  OTHER: 'OTHER'
}

export function marriageFieldToAttachmentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: MarriageSection,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    marriageDocumentForWhomFhirMapping,
    marriageDocumentTypeFhirMapping
  )
}
