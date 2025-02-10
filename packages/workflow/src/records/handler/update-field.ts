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
import * as Hapi from '@hapi/hapi'
import { getValidRecordById } from '@workflow/records/index'
import { sendBundleToHearth } from '@workflow/records/fhir'
import {
  isQuestionnaireResponse,
  QuestionnaireResponse
} from '@opencrvs/commons/types'
import { unionBy } from 'lodash'

interface FieldInput {
  fieldId: string
  valueString?: string
  valueBoolean?: boolean
}

const upsertAnswer = (
  responses: NonNullable<QuestionnaireResponse['item']>,
  { fieldId, valueString, valueBoolean }: FieldInput
) => {
  const updatedEntry = {
    text: fieldId,
    answer: [{ valueString, valueBoolean }]
  }

  return unionBy([...responses, updatedEntry], 'text')
}

/**
 * Upserts (updates or adds) a field to the record QuestionnaireResponse
 * Helpful for 3rd party integrations adding NID verification statuses for example
 */
export async function updateField(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const compositionId = request.params.id
  const { fieldId, valueString, valueBoolean } = request.payload as FieldInput

  const savedRecord = await getValidRecordById(
    compositionId,
    request.headers.authorization,
    false
  )
  const recordResources = savedRecord.entry.map((x) => x.resource)

  // There is only one QuestionnaireResponse in the record
  const questionnaireResponseResource = recordResources.filter((resource) =>
    isQuestionnaireResponse(resource)
  )[0]

  const questionnaireResponseItems = upsertAnswer(
    questionnaireResponseResource.item ?? [],
    { fieldId, valueString, valueBoolean }
  )

  const updatedQuestionnaireResponseResource = {
    resource: {
      ...questionnaireResponseResource,
      item: questionnaireResponseItems
    }
  }

  const updatedRecord = {
    ...savedRecord,
    entry: [updatedQuestionnaireResponseResource]
  }

  await sendBundleToHearth(updatedRecord)
  return h.response(updatedRecord).code(200)
}
