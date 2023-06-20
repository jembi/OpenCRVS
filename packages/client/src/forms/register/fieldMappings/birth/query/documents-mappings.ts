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
import { IFormField, IFormData } from '@client/forms'
import { attachmentToFieldTransformer } from '@client/forms/mappings/query/field-mappings'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/birth/mutation/documents-mappings'
import { EventRegistration } from '@client/utils/gateway'

const fieldNameMapping = {
  [birthDocumentForWhomFhirMapping.MOTHER]: 'uploadDocForMother',
  [birthDocumentForWhomFhirMapping.FATHER]: 'uploadDocForFather',
  [birthDocumentForWhomFhirMapping.CHILD]: 'uploadDocForChildDOB',
  [birthDocumentForWhomFhirMapping.INFORMANT_ID_PROOF]: 'uploadDocForInformant',
  [birthDocumentForWhomFhirMapping.LEGAL_GUARDIAN_PROOF]:
    'uploadDocForProofOfLegarGuardian'
}

export function birthAttachmentToFieldTransformer(
  transformedData: IFormData,
  queryData: EventRegistration,
  sectionId: keyof EventRegistration,
  field: IFormField
) {
  return attachmentToFieldTransformer(
    transformedData,
    queryData,
    sectionId,
    field,
    'registration',
    birthDocumentForWhomFhirMapping,
    birthDocumentTypeFhirMapping,
    fieldNameMapping
  )
}
