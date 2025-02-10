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
  AddressField,
  AdministrativeArea,
  BulletList,
  Checkbox,
  Country,
  DateField,
  Divider,
  Facility,
  FieldConfig,
  File,
  Location,
  Office,
  PageHeader,
  Paragraph,
  RadioGroup,
  SelectField,
  TextField
} from './FieldConfig'
import { FieldType } from './FieldType'
import {
  AddressFieldValue,
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
 *
 * We can move the specific mapFieldTypeTo* functions where they are used once the core fields are implemented.
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
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
    case FieldType.HIDDEN:
      schema = TextValue

      break
    case FieldType.CHECKBOX:
      schema = CheckboxFieldValue

      break
    case FieldType.FILE:
      schema = FileFieldValue

      break
    case FieldType.ADDRESS:
      schema = AddressFieldValue

      break
  }

  return required ? schema : schema.optional()
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
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
      return `${field.id}-${field.type}-${i}`
    case FieldType.ADDRESS:
      return {
        country: 'FAR',
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
        urbanOrRural: 'URBAN',
        town: 'Example Town',
        residentialArea: 'Example Residential Area',
        street: 'Example Street',
        number: '55',
        zipCode: '123456',
        village: 'Example Village'
      }
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
  return field.config.type === FieldType.PARAGRAPH
}

export const isDateFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: DateField } => {
  return field.config.type === FieldType.DATE
}

export const isPageHeaderFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: PageHeader } => {
  return field.config.type === FieldType.PAGE_HEADER
}

export const isTextFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: TextField } => {
  return field.config.type === FieldType.TEXT
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
  return field.config.type === FieldType.SELECT
}

export const isAddressFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: AddressFieldValue; config: AddressField } => {
  return field.config.type === FieldType.ADDRESS
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
}): field is { value: boolean; config: Checkbox } => {
  return field.config.type === FieldType.CHECKBOX
}

export const isRadioGroupFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: RadioGroup } => {
  return field.config.type === FieldType.RADIO_GROUP
}

export const isLocationFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Location } => {
  return field.config.type === FieldType.LOCATION
}

export const isDividerFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Divider } => {
  return field.config.type === FieldType.DIVIDER
}

export const isAdministrativeAreaFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: AdministrativeArea } => {
  return field.config.type === FieldType.ADMINISTRATIVE_AREA
}

export const isFacilityFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Facility } => {
  return field.config.type === FieldType.FACILITY
}

export const isOfficeFieldType = (field: {
  config: FieldConfig
  value: FieldValue
}): field is { value: string; config: Office } => {
  return field.config.type === FieldType.OFFICE
}
