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
  marriageDocumentForWhomFhirMapping,
  marriageDocumentTypeFhirMapping
} from '@client/forms/register/fieldMappings/marriage/mutation/documents-mappings'

const fieldNameMapping = {
  [marriageDocumentForWhomFhirMapping.GROOM]: 'uploadDocForGroom',
  [marriageDocumentForWhomFhirMapping.BRIDE]: 'uploadDocForBride',
  [marriageDocumentForWhomFhirMapping.MARRIAGE_NOTICE_PROOF]:
    'uploadDocForMarriageProof',
  [marriageDocumentForWhomFhirMapping.WITNESSES]:
    'uploadDocForIdentityWitnesses',
  [marriageDocumentForWhomFhirMapping.FAMILY_HEADS]:
    'uploadDocForIdentityHeadsOfFamily'
}

export function marriageAttachmentToFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  return attachmentToFieldTransformer(
    transformedData,
    queryData,
    sectionId,
    field,
    'registration',
    marriageDocumentForWhomFhirMapping,
    marriageDocumentTypeFhirMapping,
    fieldNameMapping
  )
}
