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
import { GQLContactPoint } from '@opencrvs/gateway/src/graphql/schema'
import { getBirthRegistrationSectionTransformer } from '@client/forms/register/fieldMappings/birth/query/registration-mappings'
import { getDeathRegistrationSectionTransformer } from '@client/forms/mappings/query'

export const phoneNumberToFieldTransformer = (
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) => {
  if (queryData[sectionId] && queryData[sectionId].telecom) {
    ;(queryData[sectionId].telecom as GQLContactPoint[]).map((tel) => {
      if (tel.system === 'phone' && tel.value) {
        transformedData[sectionId][field.name] = tel.value
      }
      return tel
    })
  }
  return transformedData
}
export function getInformantSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (
    queryData[sectionId]?.id &&
    queryData[sectionId]?.individual &&
    queryData[sectionId]?.individual.id
  ) {
    transformedData[sectionId]._fhirIDMap = {
      // @ts-ignore
      relatedPerson: queryData[sectionId].id,
      individual: queryData[sectionId].individual.id
    }
  }
  // Getting Informant's relationship data
  if (queryData[sectionId]?.relationship) {
    transformedData[sectionId].relationship = queryData[sectionId].relationship
  }
  return transformedData
}

export function getInformantRegistrationComposedTransformer(
  event: 'birth' | 'death'
) {
  return function (
    transformedData: IFormData,
    queryData: any,
    sectionId: string
  ) {
    if (!transformedData.registration) {
      transformedData.registration = {}
    }
    if (queryData.registration?.id) {
      transformedData.registration._fhirID = queryData.registration.id
    }
    getInformantSectionTransformer(transformedData, queryData, sectionId)
    if (event === 'birth') {
      getBirthRegistrationSectionTransformer(
        transformedData,
        queryData,
        'registration'
      )
    } else if (event === 'death') {
      getDeathRegistrationSectionTransformer(
        transformedData,
        queryData,
        'registration'
      )
    }
  }
}
