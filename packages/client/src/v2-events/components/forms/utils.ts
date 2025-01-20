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
import {
  ActionFormData,
  BaseField,
  ConditionalParameters,
  FieldConfig,
  FieldType,
  FieldValue,
  FieldTypeToFieldValue,
  validate
} from '@opencrvs/commons/client'

import { DependencyInfo } from '@client/forms'
import {
  dateToString,
  INITIAL_DATE_VALUE,
  INITIAL_PARAGRAPH_VALUE,
  INITIAL_RADIO_GROUP_VALUE,
  INITIAL_TEXT_VALUE,
  paragraphToString,
  radioGroupToString,
  textToString
} from '@client/v2-events/features/events/registered-fields'

export function handleInitialValue(
  field: FieldConfig,
  formData: ActionFormData
) {
  const initialValue = field.initialValue

  if (hasInitialValueDependencyInfo(initialValue)) {
    return evalExpressionInFieldDefinition(initialValue.expression, {
      $form: formData
    })
  }

  return initialValue
}

export function getConditionalActionsForField(
  field: FieldConfig,
  values: ConditionalParameters
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) => validate(conditional.conditional, values))
    .map((conditional) => conditional.type)
}

export function evalExpressionInFieldDefinition(
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: ActionFormData }
) {
  // eslint-disable-next-line no-eval
  return eval(expression) as FieldValue
}

export function hasInitialValueDependencyInfo(
  value: BaseField['initialValue']
): value is DependencyInfo {
  return typeof value === 'object' && 'dependsOn' in value
}

export function getDependentFields(
  fields: FieldConfig[],
  fieldName: string
): FieldConfig[] {
  return fields.filter((field) => {
    if (!field.initialValue) {
      return false
    }
    if (!hasInitialValueDependencyInfo(field.initialValue)) {
      return false
    }
    return field.initialValue.dependsOn.includes(fieldName)
  })
}

const initialValueMapping: Record<FieldType, FieldValue | null> = {
  [FieldType.TEXT]: INITIAL_TEXT_VALUE,
  [FieldType.DATE]: INITIAL_DATE_VALUE,
  [FieldType.RADIO_GROUP]: INITIAL_RADIO_GROUP_VALUE,
  [FieldType.PARAGRAPH]: INITIAL_PARAGRAPH_VALUE,
  [FieldType.FILE]: null,
  [FieldType.HIDDEN]: null,
  [FieldType.BULLET_LIST]: null,
  [FieldType.CHECKBOX]: null,
  [FieldType.COUNTRY]: null,
  [FieldType.SELECT]: null
}

export function getInitialValues(fields: FieldConfig[]) {
  return fields.reduce((initialValues, field) => {
    return { ...initialValues, [field.id]: initialValueMapping[field.type] }
  }, {})
}

export function fieldValueToString<T extends FieldType>(
  field: T,
  value: FieldTypeToFieldValue<T>
) {
  switch (field) {
    case FieldType.DATE:
      return dateToString(value as FieldTypeToFieldValue<'DATE'>)
    case FieldType.TEXT:
      return textToString(value as FieldTypeToFieldValue<'TEXT'>)
    case FieldType.PARAGRAPH:
      return paragraphToString(value as FieldTypeToFieldValue<'PARAGRAPH'>)
    case FieldType.RADIO_GROUP:
      return radioGroupToString(value as FieldTypeToFieldValue<'RADIO_GROUP'>)
    default:
      return ''
  }
}
