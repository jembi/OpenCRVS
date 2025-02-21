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
import styled from 'styled-components'
import {
  ActionFormData,
  FieldConfig,
  FieldValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isBulletListFieldType,
  isCheckboxFieldType,
  isCountryFieldType,
  isDateFieldType,
  isDividerFieldType,
  isEmailFieldType,
  isFacilityFieldType,
  isFileFieldType,
  isNumberFieldType,
  isPageHeaderFieldType,
  isParagraphFieldType,
  isRadioGroupFieldType,
  isSelectFieldType,
  isTextFieldType
} from '@opencrvs/commons/client'

import { Stringifiable } from '@client/v2-events/components/forms/utils'
import {
  Address,
  AdministrativeArea,
  Checkbox,
  Date as DateField,
  LocationSearch,
  RadioGroup,
  Select,
  SelectCountry
} from '@client/v2-events/features/events/registered-fields'

const Deleted = styled.del`
  color: ${({ theme }) => theme.colors.negative};
`
export const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
  }
`

interface FieldWithValue {
  config: FieldConfig
  value: FieldValue
}
/**
 *  Used for setting output/read (REVIEW) values for FORM input/write fields (string defaults based on FieldType).
 * For setting default fields for intl object @see setEmptyValuesForFields
 *
 *  @returns sensible default value for the field type given the field configuration.
 */
function ValueOutput(field: FieldWithValue) {
  /* eslint-disable react/destructuring-assignment */
  if (isDateFieldType(field)) {
    return <DateField.Output value={field.value} />
  }

  if (isPageHeaderFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isParagraphFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isTextFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isNumberFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isFileFieldType(field)) {
    return null
  }

  if (isBulletListFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isSelectFieldType(field)) {
    return <Select.Output options={field.config.options} value={field.value} />
  }

  if (isCountryFieldType(field)) {
    return <SelectCountry.Output value={field.value} />
  }

  if (isCheckboxFieldType(field)) {
    return <Checkbox.Output value={field.value} />
  }

  if (isEmailFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isAddressFieldType(field)) {
    return <Address.Output value={field.value} />
  }

  if (isRadioGroupFieldType(field)) {
    return (
      <RadioGroup.Output options={field.config.options} value={field.value} />
    )
  }

  if (isAdministrativeAreaFieldType(field)) {
    return <AdministrativeArea.Output value={field.value} />
  }

  if (isDividerFieldType(field)) {
    return <DefaultOutput value={field.value} />
  }

  if (isFacilityFieldType(field)) {
    return <LocationSearch.Output value={field.value} />
  }
}

function DefaultOutput<T extends Stringifiable>({ value }: { value?: T }) {
  return value?.toString() || ''
}

function getEmptyValueForFieldType(field: FieldWithValue) {
  return '-'
}

export function Output({
  form,
  field,
  value,
  previousValue,
  showPreviouslyMissingValuesAsChanged = true
}: {
  form: ActionFormData
  field: FieldConfig
  value?: FieldValue
  previousValue?: FieldValue
  showPreviouslyMissingValuesAsChanged: boolean
}) {
  // Explicitly check for null and undefined, so that e.g. number 0 is considered a value
  const hasValue = value !== null && value !== undefined

  if (!hasValue) {
    if (previousValue) {
      return <ValueOutput config={field} value={previousValue} />
    }

    return ''
  }

  if (previousValue && previousValue !== value) {
    return (
      <>
        <Deleted>
          <ValueOutput config={field} value={previousValue} />
        </Deleted>
        <br />
        <ValueOutput config={field} value={value} />
      </>
    )
  }
  if (!previousValue && hasValue && showPreviouslyMissingValuesAsChanged) {
    return (
      <>
        <Deleted>
          <ValueOutput
            config={field}
            value={getEmptyValueForFieldType({ config: field, value })}
          />
        </Deleted>
        <br />
        <ValueOutput config={field} value={value} />
      </>
    )
  }

  return <ValueOutput config={field} value={value} />
}
