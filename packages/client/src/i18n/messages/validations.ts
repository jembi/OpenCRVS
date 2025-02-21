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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IValidationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  phoneNumberNotValid: MessageDescriptor
  bengaliOnlyNameFormat: MessageDescriptor
  blockAlphaNumericDot: MessageDescriptor
  dateFormat: MessageDescriptor
  dobEarlierThanDom: MessageDescriptor
  domLaterThanDob: MessageDescriptor
  emailAddressFormat: MessageDescriptor
  englishOnlyNameFormat: MessageDescriptor
  facilityMustBeSelected: MessageDescriptor
  officeMustBeSelected: MessageDescriptor
  greaterThanZero: MessageDescriptor
  isValidBirthDate: MessageDescriptor
  isValidDateOfDeath: MessageDescriptor
  isDateNotBeforeBirth: MessageDescriptor
  isDateNotAfterDeath: MessageDescriptor
  isMoVisitBeforeBirth: MessageDescriptor
  isMoVisitAfterDeath: MessageDescriptor
  isInformantOfLegalAge: MessageDescriptor
  illegalMarriageAge: MessageDescriptor
  maxLength: MessageDescriptor
  minLength: MessageDescriptor
  notGreaterThan: MessageDescriptor
  numberRequired: MessageDescriptor
  phoneNumberFormat: MessageDescriptor
  range: MessageDescriptor
  requiredBasic: MessageDescriptor
  required: MessageDescriptor
  requiredForNewUser: MessageDescriptor
  requiredReasonForCorrection: MessageDescriptor
  requiredSymbol: MessageDescriptor
  validBirthRegistrationNumber: MessageDescriptor
  validDeathRegistrationNumber: MessageDescriptor
  validNationalId: MessageDescriptor
  validNationalIDLengths: MessageDescriptor
  duplicateNationalID: MessageDescriptor
  validPassportNumber: MessageDescriptor
  validDrivingLicenseNumber: MessageDescriptor
  nonDecimalPointNumber: MessageDescriptor
  invalidDate: MessageDescriptor
  dateIsBetween: MessageDescriptor
}

const messagesToDefine: IValidationMessages = {
  phoneNumberNotValid: {
    id: 'register.SelectContactPoint.phoneNoError',
    defaultMessage: 'Not a valid mobile number',
    description: 'Phone no error text'
  },
  bengaliOnlyNameFormat: {
    defaultMessage: 'Must contain only Bengali characters',
    description:
      'The error message that appears when a non bengali character is used in a Bengali name',
    id: 'validations.bengaliOnlyNameFormat'
  },
  blockAlphaNumericDot: {
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used',
    id: 'validations.blockAlphaNumericDot'
  },
  dateFormat: {
    defaultMessage: 'Must be a valid date',
    description: 'The error message appears when the given date is not valid',
    id: 'validations.dateFormat'
  },
  dobEarlierThanDom: {
    defaultMessage: 'Must be earlier than marriage date',
    description:
      'The error message appears when the given birth date is later than the given marriage date',
    id: 'validations.dobEarlierThanDom'
  },
  domLaterThanDob: {
    defaultMessage: 'Must be later than birth date',
    description:
      'The error message appears when the given marriage date is earlier than the given birth date',
    id: 'validations.domLaterThanDob'
  },
  emailAddressFormat: {
    defaultMessage: 'Must be a valid email address',
    description:
      'The error message appears when the email addresses are not valid',
    id: 'validations.emailAddressFormat'
  },
  englishOnlyNameFormat: {
    defaultMessage:
      'Input contains invalid characters. Please use only letters (a-z), numbers (0-9), hyphens (-), and underscores (_)',
    description:
      'The error message that appears when a non English character except numbers, hyphens and underscores is used in an English name',
    id: 'validations.englishOnlyNameFormat'
  },
  facilityMustBeSelected: {
    defaultMessage: 'No facility selected',
    description: 'The error message appears when no valid facility is selected',
    id: 'validations.facilityMustBeSelected'
  },
  officeMustBeSelected: {
    defaultMessage: 'No Office selected',
    description: 'The error message appears when no valid office is selected',
    id: 'validations.officeMustBeSelected'
  },
  greaterThanZero: {
    defaultMessage: 'Must be a greater than zero',
    description:
      'The error message appears when input is less than or equal to 0',
    id: 'validations.greaterThanZero'
  },
  isValidBirthDate: {
    defaultMessage: 'Must be a valid birth date',
    description:
      'The error message appears when the given birth date is not valid',
    id: 'validations.isValidBirthDate'
  },
  isValidDateOfDeath: {
    defaultMessage: 'Must be a valid date of death',
    description:
      'The error message appears when the given date of death is not valid',
    id: 'validations.isValidDateOfDeath'
  },
  isDateNotBeforeBirth: {
    defaultMessage: 'Date must be after deceased birth date',
    description:
      'The error message appears when the given date of death is not valid',
    id: 'validations.isDateNotBeforeBirth'
  },
  isDateNotAfterDeath: {
    defaultMessage: 'Date must be before decease date',
    description:
      'The error message appears when the given date of death is not valid',
    id: 'validations.isDateNotAfterDeath'
  },
  isMoVisitBeforeBirth: {
    defaultMessage:
      'Medical Practitioner visit date must not be before the birth of deceased',
    description:
      'The error message appears when the given date of visit of medical practitioner is before the birth date of deceased',
    id: 'validations.isMoVisitBeforeBirth'
  },
  isMoVisitAfterDeath: {
    defaultMessage:
      'Medical Practitioner visit date must not be after the date of death',
    description:
      'The error message appears when the given date of visit of medical practitioner is after the death date',
    id: 'validations.isMoVisitAfterDeath'
  },
  isInformantOfLegalAge: {
    defaultMessage: 'Informant is not of legal age',
    description:
      'The error message appears when the informant is not old enough to register an event',
    id: 'validations.isInformantOfLegalAge'
  },
  illegalMarriageAge: {
    defaultMessage: 'Illegal age of marriage',
    description:
      'The error message appears when the birth date is not old enough to register for marriage',
    id: 'validations.illegalMarriageAge'
  },
  maxLength: {
    defaultMessage: 'Must not be more than {max} characters',
    description:
      'The error message that appears on fields with a maximum length',
    id: 'validations.maxLength'
  },
  minLength: {
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length',
    id: 'validations.minLength'
  },
  notGreaterThan: {
    defaultMessage: 'Must not be more than {maxValue}',
    description:
      'The error message that appears on numeric fields that exceed a limit',
    id: 'validations.notGreaterThan'
  },
  numberRequired: {
    defaultMessage: 'Must be a number',
    description:
      'The error message that appears on fields where the value must be a number',
    id: 'validations.numberRequired'
  },
  phoneNumberFormat: {
    defaultMessage:
      'Must be a valid {num} digit number that starts with {start}',
    description:
      'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11',
    id: 'validations.phoneNumberFormat'
  },
  range: {
    defaultMessage: 'Must be within {min} and {max}',
    description:
      'The error message that appears when an out of range value is used',
    id: 'validations.range'
  },
  requiredBasic: {
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields',
    id: 'validations.requiredBasic'
  },
  required: {
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields',
    id: 'validations.required'
  },
  requiredForNewUser: {
    defaultMessage: 'Required to register a new user',
    description:
      'The error message that appears on required fields on new user form',
    id: 'validations.userform.required'
  },
  requiredReasonForCorrection: {
    defaultMessage: 'Please provide a reason for this correction',
    description:
      'The error message that appears on reason field on correction form',
    id: 'validations.correctionReason'
  },
  requiredSymbol: {
    defaultMessage: '',
    description:
      'A blank error message. Used for highlighting a required field without showing an error',
    id: 'validations.requiredSymbol'
  },
  validBirthRegistrationNumber: {
    defaultMessage:
      'The Birth Registration Number can only be numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as brn',
    id: 'validations.validBirthRegistrationNumber'
  },
  validDeathRegistrationNumber: {
    defaultMessage:
      'The Death Registration Number can only be numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as drn',
    id: 'validations.validDeathRegistrationNumber'
  },
  validNationalId: {
    defaultMessage:
      'The National ID can only be numeric and must be 10 digits long',
    description:
      'The error message that appears when an invalid value is used as nid',
    id: 'validations.validNationalId'
  },
  validNationalIDLengths: {
    defaultMessage: '10 or 17',
    description: 'Nid valid lengths',
    id: 'validations.validNationalIDLengths'
  },
  duplicateNationalID: {
    defaultMessage: 'National ID must be unique',
    description: 'Unique Nid validation',
    id: 'validations.duplicateNationalID'
  },
  validPassportNumber: {
    defaultMessage:
      'The Passport Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appears when an invalid value is used as passport number',
    id: 'validations.validPassportNumber'
  },
  validDrivingLicenseNumber: {
    id: 'validations.validDrivingLicenseNumber',
    defaultMessage:
      'The Driving License Number can only be alpha numeric and must be {validLength} characters long',
    description:
      'The error message that appeards when an invalid value is used as driving license number'
  },
  nonDecimalPointNumber: {
    id: 'validations.nonDecimalPointNumber',
    defaultMessage: 'Can not have any decimal point number',
    description:
      'The error message that appeards when any decimal point number is used'
  },
  invalidDate: {
    id: 'validations.invalidDate',
    defaultMessage: 'Invalid date field',
    description: 'The error message that appears when a date field is invalid'
  },
  dateIsBetween: {
    id: 'validations.dateIsBetween',
    defaultMessage: 'Date must be between {dateOne} and {dateTwo}',
    description:
      'The error message that appears when a date is outside the valid date range'
  }
}

export const validationMessages = defineMessages(messagesToDefine)
