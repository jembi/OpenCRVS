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
import React from 'react'
import { parse } from 'query-string'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  FieldConfig,
  FieldValue,
  validateFieldInput
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

function validateEventSearchParams(
  fields: FieldConfig[],
  values: Record<string, any>
): Record<string, FieldValue> {
  const errors = fields.reduce(
    (
      errorResults: { message: string; id: string; value: FieldValue }[],
      field: FieldConfig
    ) => {
      const fieldErrors = validateFieldInput({
        field: { ...field, required: false },
        value: values[field.id]
      })

      if (fieldErrors.length === 0) {
        return errorResults
      }

      // For backend, use the default message without translations.
      const errormessageWithId = fieldErrors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: values[field.id]
      }))

      return [...errorResults, ...errormessageWithId]
    },
    []
  )

  if (errors) {
    console.log(errors)
  }

  return values as Record<string, FieldValue>
}

export const SearchResult = () => {
  const { search } = useEvents()
  const searchParams = parse(window.location.search)
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)

  const { eventConfiguration } = useEventConfiguration(eventType)
  const allFields = getAllUniqueFields(eventConfiguration)

  validateEventSearchParams(allFields, searchParams)
  const res = search({ ...searchParams, type: eventType })

  return (
    <div>
      <h1>Search Result</h1>
    </div>
  )
}
