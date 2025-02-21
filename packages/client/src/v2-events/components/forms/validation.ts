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
import { MessageDescriptor } from 'react-intl'
import {
  FieldConfig,
  getFieldValidationErrors,
  ActionFormData,
  FormConfig
} from '@opencrvs/commons/client'

interface FieldErrors {
  errors: {
    message: MessageDescriptor
  }[]
}

export interface Errors {
  [fieldName: string]: FieldErrors
}

export function getValidationErrorsForForm(
  fields: FieldConfig[],
  values: ActionFormData,
  checkValidationErrorsOnly?: boolean
) {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    if (
      // eslint-disable-next-line
      errorsForAllFields[field.id] &&
      errorsForAllFields[field.id].errors.length > 0
    ) {
      return errorsForAllFields
    }

    return {
      ...errorsForAllFields,
      [field.id]: getFieldValidationErrors({
        field: {
          ...field,
          required: field.required && !checkValidationErrorsOnly
        },
        values
      })
    }
  }, {})
}

export function validationErrorsInActionFormExist(
  formConfig: FormConfig,
  form: ActionFormData,
  metadata?: ActionFormData
): boolean {
  const hasValidationErrors = formConfig.pages.some((page) => {
    const fieldErrors = getValidationErrorsForForm(page.fields, form)
    return Object.values(fieldErrors).some((field) => field.errors.length > 0)
  })
  const hasMetadataValidationErrors = Object.values(
    getValidationErrorsForForm(formConfig.review.fields, metadata ?? {})
  ).some((field) => field.errors.length > 0)

  return hasValidationErrors || hasMetadataValidationErrors
}
