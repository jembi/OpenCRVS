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
import { IFormData } from '@client/forms'
import { transformStatusData } from '@client/forms/register/mappings/query/utils'
import { EventType } from '@client/utils/gateway'

export function getBirthRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = EventType.Birth
  }

  if (queryData[sectionId].status) {
    transformStatusData(transformedData, queryData[sectionId].status, sectionId)
  }

  if (
    Array.isArray(queryData[sectionId].certificates) &&
    queryData[sectionId].certificates.length > 0
  ) {
    const currentCertificate =
      queryData[sectionId].certificates[
        queryData[sectionId].certificates.length - 1
      ]
    if (currentCertificate?.collector?.relationship === 'PRINT_IN_ADVANCE') {
      transformedData[sectionId].certificates = [
        { certificateTemplateId: currentCertificate.certificateTemplateId }
      ]
    }
  }
}
