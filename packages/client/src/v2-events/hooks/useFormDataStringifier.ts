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
  FieldConfig,
  FieldValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isFacilityFieldType,
  isLocationFieldType,
  isRadioGroupFieldType
} from '@opencrvs/commons/client'
import {
  Address,
  AdministrativeArea,
  RadioGroup
} from '@client/v2-events/features/events/registered-fields'

function useFieldStringifier() {
  const stringifyLocation = AdministrativeArea.useStringifier()
  const stringifyAddress = Address.useStringifier()
  const stringifyRadioGroup = RadioGroup.useStringifier()

  return (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (
      isLocationFieldType(field) ||
      isAdministrativeAreaFieldType(field) ||
      isFacilityFieldType(field)
    ) {
      // Since all of the above field types are actually locations
      return stringifyLocation(field.value)
    }

    if (isAddressFieldType(field)) {
      return stringifyAddress(field.value)
    }

    if (isRadioGroupFieldType(field)) {
      return stringifyRadioGroup(field.value, field.config)
    }

    return value.toString()
  }
}

interface RecursiveStringRecord {
  [key: string]: string | RecursiveStringRecord
}

/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const useFormDataStringifier = () => {
  const stringifier = useFieldStringifier()
  return (
    formFields: FieldConfig[],
    values: ActionFormData
  ): RecursiveStringRecord => {
    const stringifiedValues: RecursiveStringRecord = {}

    for (const [key, value] of Object.entries(values)) {
      const fieldConfig = formFields.find((field) => field.id === key)
      if (!fieldConfig) {
        throw new Error(`Field ${key} not found in form config`)
      }
      stringifiedValues[key] = stringifier(fieldConfig, value)
    }

    return stringifiedValues
  }
}
