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

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { ConditionalParameters, JSONSchema } from './conditionals'

import { formatISO } from 'date-fns'
import { ErrorMapCtx, ZodIssueOptionalMessage } from 'zod'
import { ActionFormData } from '../events/ActionDocument'
import { FieldConfig } from '../events/FieldConfig'
import { mapFieldTypeToZod } from '../events/FieldTypeMapping'
import { FieldValue } from '../events/FieldValue'
import { TranslationConfig } from '../events/TranslationConfig'

const ajv = new Ajv({
  $data: true
})

// https://ajv.js.org/packages/ajv-formats.html
addFormats(ajv)
export function validate(schema: JSONSchema, data: ConditionalParameters) {
  return ajv.validate(schema, data)
}

function getConditionalActionsForField(
  field: FieldConfig,
  values: ConditionalParameters
) {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) => validate(conditional.conditional, values))
    .map((conditional) => conditional.type)
}

export function isFieldHidden(
  field: FieldConfig,
  params: ConditionalParameters
) {
  const hasShowRule = (field.conditionals ?? []).some(
    (conditional) => conditional.type === 'SHOW'
  )
  const validConditionals = getConditionalActionsForField(field, params)

  const isVisible = !hasShowRule || validConditionals.includes('SHOW')

  return !isVisible
}

export function isFieldDisabled(
  field: FieldConfig,
  params: ConditionalParameters
) {
  const hasEnableRule = (field.conditionals ?? []).some(
    (conditional) => conditional.type === 'ENABLE'
  )
  const validConditionals = getConditionalActionsForField(field, params)
  const isEnabled = !hasEnableRule || validConditionals.includes('ENABLE')
  return !isEnabled
}

export function isFieldHiddenOrDisabled(
  field: FieldConfig,
  params: ConditionalParameters
) {
  return isFieldHidden(field, params) || isFieldDisabled(field, params)
}

/**
 * Form error message definitions for Zod validation errors.
 * Overrides zod internal type error messages (string) to match the OpenCRVS error messages (TranslationConfig).
 */
const zodToIntlErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
) => {
  if (issue.code === 'invalid_string' && issue.validation === 'date') {
    return {
      message: {
        message: {
          defaultMessage: 'Invalid date. Please use the format YYYY-MM-DD',
          description: 'This is the error message for invalid date fields',
          id: 'v2.error.invalidDate'
        }
      }
    }
  }

  if (issue.code === 'invalid_string' && issue.validation === 'email') {
    return {
      message: {
        message: {
          defaultMessage: 'Invalid email address',
          description: 'This is the error message for invalid email fields',
          id: 'v2.error.invalidEmail'
        }
      }
    }
  }

  if (
    issue.code === 'invalid_type' &&
    issue.expected !== issue.received &&
    issue.received === 'undefined'
  ) {
    return {
      message: {
        message: {
          defaultMessage: 'Required for registration',
          description: 'This is the error message for required fields',
          id: 'v2.error.required'
        }
      }
    }
  }

  return {
    message: {
      message: {
        defaultMessage: 'Invalid input',
        description: 'This is the error message for invalid field value',
        id: 'v2.error.invalid'
      }
    }
  }
}

/**
 * Custom error map for Zod to override the default error messages in intl-formik format.
 */
export type CustomZodToIntlErrorMap = {
  /** Zod by default expects { message: string } */
  message: {
    /** Override it to match current intl-formik model */
    message: TranslationConfig
  }
}

/**
 * Checks if a field has validation errors based on its type and custom conditionals.
 *
 * @returns an array of error messages for the field
 */
export function getFieldValidationErrors({
  field,
  values
}: {
  field: FieldConfig
  values: ActionFormData
}) {
  const conditionalParameters = {
    $form: values,
    $now: formatISO(new Date(), { representation: 'date' })
  }

  if (
    isFieldHidden(field, conditionalParameters) ||
    isFieldDisabled(field, conditionalParameters)
  ) {
    if (values[field.id]) {
      return {
        errors: [
          {
            message: {
              id: 'v2.error.hidden',
              defaultMessage:
                'Hidden or disabled field should not receive a value',
              description:
                'Error message when field is hidden or disabled, but a value was received'
            }
          }
        ]
      }
    }

    return {
      errors: []
    }
  }

  const fieldValidationResult = validateFieldInput({
    field,
    value: values[field.id]
  })

  const customValidationResults = runCustomFieldValidations({
    field,
    conditionalParameters
  })

  return {
    // Assumes that custom validation errors are more important than field validation errors
    errors: [...customValidationResults, ...fieldValidationResult]
  }
}

/**
 * Each field can have custom validations defined in the field configuration.
 * It is separate from standard field type validations. e.g. "is this a valid date" vs "is this date in the future"
 * @see validateFieldInput
 * @returns list of error messages for the field
 *
 */
function runCustomFieldValidations({
  field,
  conditionalParameters
}: {
  field: FieldConfig
  conditionalParameters: ConditionalParameters
}) {
  return (field.validation ?? [])
    .filter((validation) => {
      return !validate(validation.validator, conditionalParameters)
    })
    .map((validation) => ({ message: validation.message }))
}

/**
 * Validates primitive fields defined by the FieldConfig type.
 * e.g. email is proper format, date is a valid date, etc.
 * for custom validations @see runCustomFieldValidations
 */
function validateFieldInput({
  field,
  value
}: {
  field: FieldConfig
  value: FieldValue
}) {
  const rawError = mapFieldTypeToZod(field.type, field.required).safeParse(
    value,
    {
      // @ts-expect-error
      errorMap: zodToIntlErrorMap
    }
  )

  // We have overridden the standard error messages
  return (rawError.error?.issues.map((issue) => issue.message) ??
    []) as unknown as {
    message: TranslationConfig
  }[]
}
