/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'
import { PrimitiveType } from 'intl-messageformat'

export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: PrimitiveType }
}

export type Validation = (value: string) => IValidationResult | undefined

export const messages: {
  [key: string]: MessageDescriptor
} = defineMessages({
  required: {
    id: 'validations.required',
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields'
  },
  minLength: {
    id: 'validations.minLength',
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length'
  },
  numberRequired: {
    id: 'validations.numberRequired',
    defaultMessage: 'Must be number',
    description:
      'The error message that appears on fields where the value must be number'
  },
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage:
      'Must be a valid mobile phone number. Starting with 0. e.g. {example}',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  },
  mobilePhoneRegex: {
    id: 'validations.mobilePhoneRegex',
    defaultMessage: '07[0-9]{9,10}',
    description:
      'The regular expression to use when validating a local mobile phone number'
  },
  mobileNumberFormat: {
    id: 'validations.mobileNumberFormat',
    defaultMessage: '07123456789',
    description:
      'The format of the mobile number that appears in an error message'
  },
  requiredSymbol: {
    id: 'validations.requiredSymbol',
    defaultMessage: '',
    description:
      'A blank error message. Used for highlighting a required field without showing an error'
  }
})

export const isAValidPhoneNumberFormat = (value: string): boolean => {
  const { pattern } = window.config.PHONE_NUMBER_PATTERN
  return new RegExp(pattern).test(value)
}

export const requiredSymbol: Validation = (value: string) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required: Validation = (value: string) =>
  value ? undefined : { message: messages.required }

export const minLength = (min: number) => (value: string) => {
  return value && value.length < min
    ? { message: messages.minLength, props: { min } }
    : undefined
}

export const isNumber: Validation = (value: string) =>
  value && isNaN(Number(value))
    ? { message: messages.numberRequired }
    : undefined

export const phoneNumberFormat: Validation = (value: string) => {
  const { example } = window.config.PHONE_NUMBER_PATTERN
  const validationProps = { example }

  const trimmedValue = value === undefined || value === null ? '' : value.trim()

  if (!trimmedValue) {
    return undefined
  }

  return isAValidPhoneNumberFormat(trimmedValue)
    ? undefined
    : {
        message: messages.phoneNumberFormat,
        props: validationProps
      }
}
