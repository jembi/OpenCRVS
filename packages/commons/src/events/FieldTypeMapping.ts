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
  BulletList,
  Checkbox,
  Country,
  DateField,
  Divider,
  FieldConfig,
  File,
  Location,
  PageHeader,
  Paragraph,
  RadioGroup,
  SelectField,
  TextField
} from './FieldConfig'
import { FieldType } from './FieldType'
import {
  CheckboxFieldValue,
  DateValue,
  FieldValue,
  FieldValueSchema,
  FileFieldValue,
  TextValue
} from './FieldValue'

/**
 * FieldTypeMapping.ts should include functions that map field types to different formats dynamically.
 * File is separated from FieldType and FieldConfig to avoid circular dependencies.
 */

/**
 * Mapping of field types to Zod schema.
 * Useful for building dynamic validations against FieldConfig
 */
export function mapFieldTypeToZod(type: FieldType, required?: boolean) {
  let schema: FieldValueSchema
  switch (type) {
    case FieldType.DATE:
      schema = DateValue

      break
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
    case FieldType.HIDDEN:
      schema = TextValue

      break
    case FieldType.CHECKBOX:
      schema = CheckboxFieldValue

      break
    case FieldType.FILE:
      schema = FileFieldValue

      break
  }

  return required ? schema : schema.optional()
}

export function mapFieldTypeToElasticsearch(field: FieldConfig) {
  switch (field.type) {
    case FieldType.DATE:
      // @TODO: This should be changed back to 'date'
      // When we have proper validation of custom fields.
      return { type: 'text' }
    case FieldType.TEXT:
    case FieldType.PARAGRAPH:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
      return { type: 'text' }
    case FieldType.DIVIDER:
    case FieldType.RADIO_GROUP:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.CHECKBOX:
    case FieldType.LOCATION:
      return { type: 'keyword' }
    case FieldType.FILE:
      return {
        type: 'object',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }
  }
}

/**
 * Quick-and-dirty mock data generator for event actions.
 */
export function mapFieldTypeToMockValue(field: FieldConfig, i: number) {
  switch (field.type) {
    case FieldType.DIVIDER:
    case FieldType.TEXT:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.PARAGRAPH:
      return `${field.id}-${field.type}-${i}`
    case FieldType.DATE:
      return '2021-01-01'
    case FieldType.CHECKBOX:
      return true
    case FieldType.FILE:
      return null
  }
}

export const isParagraphFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Paragraph } => {
  return (
    field.config.type === FieldType.PARAGRAPH && typeof field.value === 'string'
  )
}

export const isDateFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: DateField } => {
  return field.config.type === FieldType.DATE && typeof field.value === 'string'
}

export const isPageHeaderFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: PageHeader } => {
  return field.config.type === FieldType.DATE && typeof field.value === 'string'
}

export const isTextFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: TextField } => {
  return field.config.type === FieldType.TEXT && typeof field.value === 'string'
}

export const isFileFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: FileFieldValue; config: File } => {
  // @TODO?
  return field.config.type === FieldType.FILE
}

export const isBulletListFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: BulletList } => {
  return field.config.type === FieldType.BULLET_LIST
}

export const isSelectFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: SelectField } => {
  return (
    field.config.type === FieldType.SELECT && typeof field.value === 'string'
  )
}

export const isCountryFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Country } => {
  return field.config.type === FieldType.COUNTRY
}

export const isCheckboxFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: 'true' | 'false'; config: Checkbox } => {
  // @TODO: check
  return field.config.type === FieldType.CHECKBOX
}

export const isRadioGroupFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: RadioGroup } => {
  return (
    field.config.type === FieldType.RADIO_GROUP &&
    typeof field.value === 'string'
  )
}

export const isLocationFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Location } => {
  return (
    field.config.type === FieldType.LOCATION && typeof field.value === 'string'
  )
}

export const isDividerFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Divider } => {
  return field.config.type === FieldType.DIVIDER
}
