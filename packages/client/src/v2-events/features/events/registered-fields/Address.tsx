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
import {
  ActionFormData,
  AddressFieldValue,
  and,
  ConditionalType,
  field as createFieldCondition,
  FieldConfig,
  FieldProps,
  FieldType,
  not
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'

// ADDRESS field may not contain another ADDRESS field
type FieldConfigWithoutAddress = Exclude<
  FieldConfig,
  { type: typeof FieldType.ADDRESS }
>

type Props = FieldProps<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
}

const AddressType = {
  URBAN: 'URBAN',
  RURAL: 'RURAL'
} as const

function addDefaultValue<T extends FieldConfigWithoutAddress>(
  defaultValues?: AddressFieldValue
): (fieldConfig: T) => T {
  if (!defaultValues) {
    return (fieldConfig) => fieldConfig
  }

  return (fieldConfig) => {
    const key = fieldConfig.id as keyof typeof defaultValues

    if (!defaultValues[key]) {
      return fieldConfig
    }

    return {
      ...fieldConfig,
      defaultValue: defaultValues[key]
    }
  }
}

/**
 * AddressInput is a form component for capturing address details based on administrative structure.
 *
 * - The form dynamically adjusts the fields displayed based on user input.
 * - By default, it includes fields for admin structure and a selection between urban and rural addresses.
 * - All admin structure fields are hidden until the previous field is selected.
 * - Address details fields are only shown when district is selected (it being the last admin structure field).
 */
function AddressInput(props: Props) {
  const { onChange, defaultValue, value = {}, ...otherProps } = props

  const fields = [
    ...ADMIN_STRUCTURE,
    ...URBAN_FIELDS,
    ...RURAL_FIELDS
  ] satisfies Array<FieldConfigWithoutAddress>

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={defaultValue ? fields.map(addDefaultValue(defaultValue)) : fields}
      formData={value}
      initialValues={value}
      setAllFieldsDirty={false}
      onChange={(values) => onChange(values as Partial<AddressFieldValue>)}
    />
  )
}

const displayWhenDistrictUrbanSelected = [
  {
    type: ConditionalType.SHOW,
    conditional: and(
      createFieldCondition('urbanOrRural').isEqualTo(AddressType.URBAN),
      not(createFieldCondition('district').isUndefined())
    )
  }
]

const URBAN_FIELDS = [
  {
    id: 'town',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'residentialArea',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.residentialArea.label',
      defaultMessage: 'Residential Area',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'street',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'number',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.number.label',
      defaultMessage: 'Number',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'zipCode',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.zipCode.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
] as const satisfies FieldConfigWithoutAddress[]

const RURAL_FIELDS = [
  {
    id: 'village',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          createFieldCondition('urbanOrRural').isEqualTo(AddressType.RURAL),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.village.label',
      defaultMessage: 'Village',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
] as const satisfies FieldConfigWithoutAddress[]

const ADMIN_STRUCTURE = [
  {
    id: 'country',
    conditionals: [],
    required: true,
    label: {
      id: 'v2.field.address.country.label',
      defaultMessage: 'Country',
      description: 'This is the label for the field'
    },
    type: FieldType.COUNTRY
  },
  {
    id: 'province',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('country').isUndefined())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'This is the label for the field'
    },
    type: 'ADMINISTRATIVE_AREA',
    configuration: { type: 'ADMIN_STRUCTURE' }
  },
  {
    id: 'district',
    type: 'ADMINISTRATIVE_AREA',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('province').isUndefined())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    configuration: {
      type: 'ADMIN_STRUCTURE',
      partOf: {
        $data: 'province'
      }
    }
  },
  {
    id: 'urbanOrRural',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('district').isUndefined())
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.urbanOrRural.label',
      defaultMessage: 'Urban or Rural',
      description: 'This is the label for the field'
    },
    hideLabel: true,
    type: 'RADIO_GROUP',
    options: [
      {
        value: 'URBAN',
        label: {
          id: 'v2.field.address.label.urban',
          defaultMessage: 'Urban',
          description: 'Label for form field checkbox option Urban'
        }
      },
      {
        value: 'RURAL',
        label: {
          id: 'v2.field.address.label.rural',
          defaultMessage: 'Rural',
          description: 'Label for form field checkbox option Rural'
        }
      }
    ],
    defaultValue: 'URBAN',
    configuration: {
      styles: { size: 'NORMAL' }
    }
  }
] as const satisfies FieldConfigWithoutAddress[]

export const ALL_ADDRESS_FIELDS = [
  ...ADMIN_STRUCTURE,
  ...URBAN_FIELDS,
  ...RURAL_FIELDS
]

type AllKeys<T> = T extends unknown ? keyof T : never
type RequiredKeysFromFieldValue = AllKeys<AddressFieldValue>
type EnsureSameUnion<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false
type Expect<T extends true> = T

type AllFields = (typeof ALL_ADDRESS_FIELDS)[number]['id']

/*
 * This type ensures that all fields needed in AddressFieldValue type
 * are actually defined in the field config below.
 * Comment out one field to see the error.
 *
 * If you see a type error, it means that the fields in the component do not
 * match the fields in the AddressFieldValue type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ExpectTrue = Expect<
  EnsureSameUnion<AllFields, RequiredKeysFromFieldValue>
>

function AddressOutput({ value }: { value?: AddressFieldValue }) {
  if (!value) {
    return ''
  }
  return (
    <>
      {ALL_ADDRESS_FIELDS.map((field) => ({
        field,
        value: value[field.id as keyof typeof value]
      }))
        .filter((field) => field.value)
        .map((field) => (
          <React.Fragment key={field.field.id}>
            <Output
              field={field.field}
              form={value}
              showPreviouslyMissingValuesAsChanged={false}
              value={field.value}
            />
            <br />
          </React.Fragment>
        ))}
    </>
  )
}

function useStringifier() {
  return function useAddressStringifier(value: AddressFieldValue) {
    /*
     * As address is just a collection of other form fields, its string formatter just redirects the data back to
     * form data stringifier so location and other form fields can handle stringifying their own data
     */
    const stringifier = useFormDataStringifier()
    return stringifier(ALL_ADDRESS_FIELDS, value as ActionFormData)
  }
}

export const Address = {
  Input: AddressInput,
  Output: AddressOutput,
  useStringifier: useStringifier
}
