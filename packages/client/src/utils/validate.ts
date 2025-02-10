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
import { validationMessages as messages } from '@client/i18n/messages'
// import {
//   IFormFieldValue,
//   IFormData,
//   IFormSectionData
// } from '@opencrvs/client/src/forms'
import {
  REGEXP_BLOCK_ALPHA_NUMERIC_DOT,
  REGEXP_DECIMAL_POINT_NUMBER,
  INFORMANT_MINIMUM_AGE,
  NATIONAL_ID
} from '@client/utils/constants'
import { validate as validateEmail } from 'email-validator'
import XRegExp from 'xregexp'
import { IOfflineData } from '@client/offline/reducer'
import _, { get } from 'lodash'
import format, { convertAgeToDate } from '@client/utils/date-formatting'

export function getListOfLocations(
  resource: IOfflineData,
  resourceType: Extract<
    keyof IOfflineData,
    'facilities' | 'locations' | 'offices'
  >
) {
  return resource[resourceType]
}

// @TODO: Importing from forms breaks the tests. Basically the references are not resolved correctly
// and @opencrvs/client/src/forms causes recursion in this branch.
// https://github.com/vitest-dev/vitest/issues/546
type IFormFieldValue = any
type IFormData = any
type IFormSectionData = any
/**
 * NOTE! When amending validators in this file, remember to also update country configuration typings to reflect the changes
 */

export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: any }
}

export type RangeValidation = (
  min: number,
  max: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type MaxLengthValidation = (
  customisation: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type Validation = (
  value: IFormFieldValue,
  drafts?: IFormData,
  offlineCountryConfig?: IOfflineData,
  form?: IFormSectionData
) => IValidationResult | undefined

export type ValidationInitializer = (...value: any[]) => Validation

export const isAValidPhoneNumberFormat = (value: string): boolean => {
  const pattern = window.config.PHONE_NUMBER_PATTERN
  return new RegExp(pattern).test(value)
}

export const isAValidEmailAddressFormat = (value: string): boolean => {
  return validateEmail(value)
}

export const isAValidDateFormat = (value: string): boolean => {
  const dateFormatRegex = '^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$'
  const dateRegex = new RegExp(dateFormatRegex)

  if (!dateRegex.test(value)) {
    return false
  }

  const pad = (n: number) => {
    return (str: string) => {
      while (str.length < n) {
        str = '0' + str
      }
      return str
    }
  }

  const valueISOString = value.split(/-/g).map(pad(2)).join('-')

  const givenDate = new Date(valueISOString)

  return givenDate.toISOString().slice(0, 10) === valueISOString
}

export const requiredBasic: Validation = (value: IFormFieldValue) =>
  value ? undefined : { message: messages.requiredBasic }

export const requiredSymbol: Validation = (value: IFormFieldValue) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required =
  (message: MessageDescriptor = messages.required): Validation =>
  (value: IFormFieldValue) => {
    if (typeof value === 'string') {
      return value !== '' ? undefined : { message }
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? undefined : { message }
    }
    return value !== undefined && value !== null ? undefined : { message }
  }

export const minLength = (min: number) => (value: string) => {
  return value && value.length < min
    ? { message: messages.minLength, props: { min } }
    : undefined
}

export const validLength = (length: number) => (value: IFormFieldValue) => {
  return value && value.toString().length === length
    ? undefined
    : {
        message: messages.validNationalId,
        props: { validLength: length }
      }
}

const isLessOrEqual = (value: string, max: number) => {
  return value && value.toString().length <= max
}

export const maxLength: MaxLengthValidation =
  (max: number) => (value: IFormFieldValue) => {
    return isLessOrEqual(value as string, max)
      ? undefined
      : { message: messages.maxLength, props: { max } }
  }

const isNumber = (value: string): boolean => !value || !isNaN(Number(value))

const isRegexpMatched = (value: string, regexp: string): boolean =>
  !value || value.match(regexp) !== null

export const blockAlphaNumericDot: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isRegexpMatched(cast, REGEXP_BLOCK_ALPHA_NUMERIC_DOT)
    ? undefined
    : { message: messages.blockAlphaNumericDot }
}

export const nonDecimalPointNumber: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  if (cast) {
    return !isRegexpMatched(cast.toString(), REGEXP_DECIMAL_POINT_NUMBER)
      ? undefined
      : { message: messages.nonDecimalPointNumber }
  }
}

export const numeric: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isNumber(cast) ? undefined : { message: messages.numberRequired }
}

export const facilityMustBeSelected: Validation = (
  value: IFormFieldValue,
  drafts,
  offlineCountryConfig
) => {
  const locationsList = getListOfLocations(
    offlineCountryConfig as IOfflineData,
    'facilities'
  )
  const isValid = !value || locationsList[value as string]
  return isValid ? undefined : { message: messages.facilityMustBeSelected }
}

export const officeMustBeSelected: Validation = (
  value: IFormFieldValue,
  drafts,
  offlineCountryConfig
) => {
  const locationsList = getListOfLocations(
    offlineCountryConfig as IOfflineData,
    'offices'
  )
  const isValid = !value || locationsList[value as string]
  return isValid ? undefined : { message: messages.officeMustBeSelected }
}

export const phoneNumberFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  const trimmedValue = cast === undefined || cast === null ? '' : cast.trim()

  if (!trimmedValue) {
    return undefined
  }

  return isAValidPhoneNumberFormat(trimmedValue)
    ? undefined
    : {
        message: messages.phoneNumberFormat
      }
}

export const emailAddressFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  if (cast === '') {
    return
  }

  return cast && isAValidEmailAddressFormat(cast)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}

export const dateFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return cast && isAValidDateFormat(cast)
    ? undefined
    : {
        message: messages.dateFormat
      }
}

export const isDateNotInFuture = (date: string) => {
  return new Date(date) <= new Date(Date.now())
}

export const isDateNotPastLimit = (date: string, limit: Date) => {
  return new Date(date) >= limit
}

export const isDateNotBeforeBirth = (date: string, drafts: IFormData) => {
  const birthDate = drafts?.deceased?.deceasedBirthDate as string
  return birthDate ? new Date(date) >= new Date(birthDate) : true
}

export const isDateNotAfterBirthEvent = (date: string, drafts?: IFormData) => {
  const dateOfBirth = drafts?.child?.childBirthDate as string
  return dateOfBirth ? new Date(date) <= new Date(dateOfBirth) : true
}

export const isDateNotAfterDeath = (date: string, drafts?: IFormData) => {
  const deathDate = drafts?.deathEvent?.deathDate as string
  return deathDate
    ? new Date(date).setHours(0, 0, 0, 0) <=
        new Date(deathDate).setHours(0, 0, 0, 0)
    : true
}

export const isDateAfter = (first: string, second: string) => {
  return new Date(first) >= new Date(second)
}

export const minAgeGapExist = (
  first: string,
  second: string,
  minAgeGap: number
): boolean => {
  const diff =
    (new Date(first).getTime() - new Date(second).getTime()) /
    (1000 * 60 * 60 * 24) /
    365
  return diff >= minAgeGap
}

export const isValidBirthDate: Validation = (
  value: IFormFieldValue,
  drafts?
) => {
  const cast = value as string
  return !cast
    ? { message: messages.required }
    : cast &&
      isDateNotInFuture(cast) &&
      isAValidDateFormat(cast) &&
      isDateNotAfterBirthEvent(cast, drafts as IFormData)
    ? isDateNotAfterDeath(cast, drafts as IFormData)
      ? undefined
      : {
          message: messages.isDateNotAfterDeath
        }
    : {
        message: messages.isValidBirthDate
      }
}

export const isValidChildBirthDate: Validation = (value: IFormFieldValue) => {
  const childBirthDate = value as string
  const pastDateLimit = new Date(1900, 0, 1)
  return !childBirthDate
    ? { message: messages.required }
    : childBirthDate &&
      isAValidDateFormat(childBirthDate) &&
      isDateNotInFuture(childBirthDate) &&
      isDateNotPastLimit(childBirthDate, pastDateLimit)
    ? undefined
    : { message: messages.isValidBirthDate }
}

export const isValidParentsBirthDate =
  (minAgeGap: number, isAge?: boolean): Validation =>
  (value: IFormFieldValue, drafts) => {
    const parentsBirthDate = isAge
      ? convertAgeToDate(value as string)
      : (value as string)
    const childBirthDate =
      drafts && drafts.child && (drafts.child.childBirthDate as string)

    return parentsBirthDate &&
      isAValidDateFormat(parentsBirthDate) &&
      isDateNotInFuture(parentsBirthDate)
      ? childBirthDate
        ? minAgeGapExist(childBirthDate, parentsBirthDate, minAgeGap)
          ? undefined
          : {
              message: messages.isValidBirthDate
            }
        : undefined
      : {
          message: messages.isValidBirthDate
        }
  }

export const checkBirthDate =
  (marriageDate: string): Validation =>
  (value: IFormFieldValue) => {
    const cast = value as string
    if (!isAValidDateFormat(cast)) {
      return {
        message: messages.dateFormat
      }
    }

    const bDate = new Date(cast)
    // didn't call `isDateNotInFuture(value)`, because no need to call `new Date(value)` twice
    if (bDate > new Date()) {
      return {
        message: messages.dateFormat
      }
    }

    if (!marriageDate || !isAValidDateFormat(marriageDate)) {
      return undefined
    }

    return bDate < new Date(marriageDate)
      ? undefined
      : {
          message: messages.dobEarlierThanDom
        }
  }

const getBirthDate = (
  isExactDateOfBirthUnknown: boolean,
  date: string,
  age: string
) => (isExactDateOfBirthUnknown ? convertAgeToDate(age) : date)

export const checkMarriageDate =
  (minAge: number): Validation =>
  (value: IFormFieldValue, drafts) => {
    const cast = value as string
    if (!isAValidDateFormat(cast)) {
      return {
        message: messages.dateFormat
      }
    }

    const mDate = new Date(cast)
    // didn't call `isDateNotInFuture(value)`, because no need to call `new Date(value)` twice
    if (mDate > new Date()) {
      return {
        message: messages.dateFormat
      }
    }

    const groomDOB =
      drafts &&
      drafts.groom &&
      getBirthDate(
        Boolean(drafts.groom.exactDateOfBirthUnknown),
        String(drafts.groom.groomBirthDate),
        String(drafts.groom.ageOfIndividualInYears)
      )
    const brideDOB =
      drafts &&
      drafts.bride &&
      getBirthDate(
        Boolean(drafts.bride.exactDateOfBirthUnknown),
        String(drafts.bride.brideBirthDate),
        String(drafts.bride.ageOfIndividualInYears)
      )

    if (!groomDOB || !brideDOB) {
      return undefined
    } else {
      if (
        !minAgeGapExist(cast, groomDOB, minAge) ||
        !minAgeGapExist(cast, brideDOB, minAge)
      ) {
        return {
          message: messages.illegalMarriageAge
        }
      } else if (mDate < new Date(groomDOB) && mDate < new Date(brideDOB)) {
        return {
          message: messages.domLaterThanDob
        }
      } else {
        return undefined
      }
    }
  }

export const isValidDateOfBirthForMarriage =
  (sectionName: string, minAge: number): Validation =>
  (value: IFormFieldValue, drafts) => {
    const isExactDateOfBirthUnknown =
      drafts &&
      drafts[sectionName] &&
      drafts[sectionName].exactDateOfBirthUnknown
    const cast = isExactDateOfBirthUnknown
      ? convertAgeToDate(value as string)
      : (value as string)
    if (!isAValidDateFormat(cast)) {
      return {
        message: messages.dateFormat
      }
    } else if (!isDateNotInFuture(cast)) {
      return { message: messages.isValidBirthDate }
    }

    if (
      !minAgeGapExist(
        format(new Date(Date.now()), 'yyyy-MM-dd'),
        String(value),
        minAge
      )
    ) {
      return {
        message: messages.illegalMarriageAge
      }
    } else {
      return undefined
    }
  }

export const dateGreaterThan =
  (previousDate: string): Validation =>
  (value: IFormFieldValue) => {
    const cast = value as string
    if (!previousDate || !isAValidDateFormat(previousDate)) {
      return undefined
    }

    return new Date(cast) > new Date(previousDate)
      ? undefined
      : {
          message: messages.domLaterThanDob
        }
  }

export const dateLessThan =
  (laterDate: string): Validation =>
  (value: IFormFieldValue) => {
    const cast = value as string
    if (!laterDate || !isAValidDateFormat(laterDate)) {
      return undefined
    }

    return new Date(cast) < new Date(laterDate)
      ? undefined
      : {
          message: messages.dobEarlierThanDom
        }
  }

export const dateNotInFuture = (): Validation => (value: IFormFieldValue) => {
  const cast = value as string
  if (isDateNotInFuture(cast)) {
    return undefined
  } else {
    return { message: messages.dateFormat }
  }
}

export const dateNotPastLimit =
  (limit: string): Validation =>
  (value: IFormFieldValue) => {
    const cast = value as string
    if (isDateNotPastLimit(cast, new Date(limit))) {
      return undefined
    } else {
      return { message: messages.dateFormat }
    }
  }

export const dateNotToday = (date: string): boolean => {
  const today = new Date().setHours(0, 0, 0, 0)
  const day = new Date(date).setHours(0, 0, 0, 0)
  return day !== today
}

export const isDateInPast: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  if (isDateNotInFuture(cast) && dateNotToday(cast)) {
    return undefined
  } else {
    return { message: messages.isValidBirthDate } // specific to DOB of parent/informant
  }
}

export const dateInPast = (): Validation => (value: IFormFieldValue) =>
  isDateInPast(value)

export const dateFormatIsCorrect = (): Validation => (value: IFormFieldValue) =>
  dateFormat(value as string)

/*
 * TODO: The name validation functions should be refactored out.
 *
 * Name validation has some complexities. These will vary from country to
 * country too. e.g. in Bangladesh there is actually no given name or
 * family name. Or first name/last name. To fit names in the common western
 * format, people have to use multiple words in a "first name" or a "last name".
 *
 * Another complexity is what letters are allowed. Should we allow hyphens?
 * Then in Bengali, there are some rules which we can build to ensure better
 * quality input. e.g. a word can not start with a "mark" or diatribe.
 *
 * For now, we are going with simple validation that just prevents entering
 * an English name in the Bengali name field and vice versa.
 */

// Each character has to be a part of the Unicode Bengali script or the hyphen.

export const isValidBengaliWord = (value: string): boolean => {
  const bengaliRe = XRegExp.cache(
    '(^[\\p{Bengali}.-]*\\([\\p{Bengali}.-]+\\)[\\p{Bengali}.-]*$)|(^[\\p{Bengali}.-]+$)',
    ''
  )
  const lettersRe = XRegExp.cache(
    '(^[\\pL\\pM.-]*\\([\\pL\\pM.-]+\\)[\\pL\\pM.-]*$)|(^[\\pL\\pM.-]+$)',
    ''
  )

  return bengaliRe.test(value) && lettersRe.test(value)
}

//
// Simple pattern. Allow only English (Latin) characters and the hyphen.
//
export const isValidEnglishWord = (value: string): boolean => {
  // Still using XRegExp for its caching ability
  const englishRe = XRegExp.cache(
    `(^[\\p{Latin}0-9'._-]*\\([\\p{Latin}0-9'._-]+\\)[\\p{Latin}0-9'._-]*$)|(^[\\p{Latin}0-9'._-]+$)`,
    ''
  )
  return englishRe.test(value)
}

type Checker = (value: string) => boolean

// Utility 2nd order function. Does a little common task then passes on to
// the callback.

const checkNameWords = (value: string, checker: Checker): boolean => {
  const trimmedValue = value === undefined || value === null ? '' : value.trim()

  if (!trimmedValue) {
    return true
  }

  const parts: string[] = trimmedValue.split(/\s+/)
  return parts.every(checker)
}

export const isValidBengaliName = (value: string): boolean => {
  return checkNameWords(value, isValidBengaliWord)
}

export const isValidEnglishName = (value: string): boolean => {
  return checkNameWords(value, isValidEnglishWord)
}

export const isLengthWithinRange = (value: string, min: number, max: number) =>
  !value || (value.length >= min && value.length <= max)

export const isValueWithinRange =
  (min: number, max: number) =>
  (value: number): boolean => {
    return !isNaN(value) && value >= min && value <= max
  }

export const bengaliOnlyNameFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isValidBengaliName(cast)
    ? undefined
    : { message: messages.bengaliOnlyNameFormat }
}

export const englishOnlyNameFormat: Validation = (value: IFormFieldValue) => {
  const cast = value as string
  return isValidEnglishName(cast)
    ? undefined
    : { message: messages.englishOnlyNameFormat }
}

export const range: RangeValidation =
  (min: number, max: number) => (value: IFormFieldValue) => {
    const cast = value as string
    return isValueWithinRange(min, max)(parseFloat(cast))
      ? undefined
      : { message: messages.range, props: { min, max } }
  }

export const oneOf = (
  fields: string[],
  errorMessage: MessageDescriptor
): Validation => {
  return (_value, fieldValues) => {
    const someFilled = fields.some((field) => get(fieldValues, field))

    if (someFilled) {
      return undefined
    }

    return { message: errorMessage }
  }
}

export const isAValidNIDNumberFormat = (value: string): boolean => {
  const pattern = window.config.NID_NUMBER_PATTERN
  return new RegExp(pattern).test(value)
}

export const validIDNumber =
  (typeOfID: string): Validation =>
  (value: any) => {
    value = (value && value.toString()) || ''

    const cast = value as string
    const trimmedValue = cast === undefined || cast === null ? '' : cast.trim()
    if (typeOfID === NATIONAL_ID) {
      if (isAValidNIDNumberFormat(trimmedValue) || !trimmedValue) {
        return undefined
      }

      return {
        message: messages.validNationalId
      }
    }
    return undefined
  }
export const duplicateIDNumber =
  (fieldToDuplicateCheck: string): Validation =>
  (value: IFormFieldValue, drafts) => {
    const valueToCheck = _.get(drafts, fieldToDuplicateCheck)
    if (value && valueToCheck && value === valueToCheck) {
      return {
        message: messages.duplicateNationalID
      }
    }

    return undefined
  }

export const isValidDeathOccurrenceDate: Validation = (
  value: IFormFieldValue,
  drafts
) => {
  const cast = value && value.toString()
  return cast && isDateNotInFuture(cast) && isAValidDateFormat(cast)
    ? isDateNotBeforeBirth(cast, drafts as IFormData)
      ? undefined
      : {
          message: messages.isDateNotBeforeBirth
        }
    : {
        message: messages.isValidDateOfDeath
      }
}

export const isMoVisitDateAfterBirthDateAndBeforeDeathDate: Validation = (
  value: IFormFieldValue,
  drafts
) => {
  const cast = value && value.toString()
  if (drafts && drafts.deathEvent && !drafts.deathEvent.birthDate) {
    if (drafts && drafts.deathEvent && cast <= drafts.deathEvent.deathDate) {
      return undefined
    } else if (
      drafts &&
      drafts.deathEvent &&
      cast > drafts.deathEvent.deathDate
    ) {
      return {
        message: messages.isMoVisitAfterDeath
      }
    }
  } else {
    if (
      drafts &&
      drafts.deathEvent &&
      cast <= drafts.deathEvent.deathDate &&
      cast >= drafts.deceased.birthDate
    ) {
      return undefined
    } else if (
      drafts &&
      drafts.deathEvent &&
      cast > drafts.deathEvent.deathDate
    ) {
      return {
        message: messages.isMoVisitAfterDeath
      }
    } else if (
      drafts &&
      drafts.deathEvent &&
      cast < drafts.deceased.birthDate
    ) {
      return {
        message: messages.isMoVisitBeforeBirth
      }
    }
  }
}

export const isInformantOfLegalAge: Validation = (value: IFormFieldValue) => {
  if (value) {
    if (
      minAgeGapExist(
        format(new Date(Date.now()), 'yyyy-MM-dd'),
        value.toString(),
        INFORMANT_MINIMUM_AGE
      )
    ) {
      return undefined
    } else {
      return {
        message: messages.isInformantOfLegalAge
      }
    }
  }
}

export const greaterThanZero: Validation = (value: IFormFieldValue) => {
  return !value && value !== 0
    ? { message: messages.required }
    : value && Number(value) > 0
    ? undefined
    : { message: messages.greaterThanZero }
}

export const notGreaterThan =
  (maxValue: number): Validation =>
  (value: IFormFieldValue) => {
    const numericValue = Number.parseInt(value as string)
    return value && !Number.isNaN(numericValue) && numericValue <= maxValue
      ? undefined
      : { message: messages.notGreaterThan, props: { maxValue } }
  }
