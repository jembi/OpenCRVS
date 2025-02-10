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
  isAValidPhoneNumberFormat,
  requiredSymbol,
  required,
  minLength,
  numeric,
  phoneNumberFormat,
  dateFormat,
  emailAddressFormat,
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  range,
  validIDNumber,
  maxLength,
  isValidBirthDate,
  checkBirthDate,
  isValidDeathOccurrenceDate,
  greaterThanZero,
  dateGreaterThan,
  dateLessThan,
  dateNotInFuture,
  dateFormatIsCorrect,
  dateInPast,
  validLength,
  isDateAfter,
  notGreaterThan
} from '@client/utils/validate'
import { validationMessages as messages } from '@client/i18n/messages'

describe('validate', () => {
  describe('isAValidPhoneNumberFormat. Checks a local phone number format complies with regex', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      expect(isAValidPhoneNumberFormat(badValue)).toEqual(false)
    })
    it('should pass when supplied a good value for a Bangladeshi number', () => {
      const goodValue = '01720067890'
      expect(isAValidPhoneNumberFormat(goodValue)).toEqual(true)
    })
  })

  describe('requiredSymbol. Used for number fields that use a symbol (e.g.: x) as an error message', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = ''
      const response = {
        message: {
          defaultMessage: '',
          description:
            'A blank error message. Used for highlighting a required field without showing an error',
          id: 'validations.requiredSymbol'
        }
      }
      expect(requiredSymbol(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'jkgjgjgkgjkj'
      const response = undefined
      expect(requiredSymbol(goodValue)).toEqual(response)
    })
  })

  describe('required. Used for fields that must have a value', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = ''
      const response = {
        message: {
          id: 'validations.required',
          defaultMessage: 'Required',
          description: 'The error message that appears on required fields'
        }
      }
      expect(required()(badValue)).toEqual(response)
    })
    it('Should return custom error message when supplied a bad value and custom error message', () => {
      const badValue = ''
      const customErrorMessageDescriptor = {
        id: 'validations.userform.required',
        defaultMessage: 'Required for new user',
        description: 'The error message that appears on required fields'
      }
      const response = {
        message: customErrorMessageDescriptor
      }
      expect(required(customErrorMessageDescriptor)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'jkgjgjgkgjkj'
      const response = undefined
      expect(required()(goodValue)).toEqual(response)
    })
    it('should pass when supplied a good boolean value', () => {
      const goodValue = true
      const response = undefined
      expect(required()(goodValue)).toEqual(response)
    })
  })

  describe('minLength. Used for fields that have a minimum length', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '1'
      const response = {
        message: {
          id: 'validations.minLength',
          defaultMessage: 'Must be {min} characters or more',
          description:
            'The error message that appears on fields with a minimum length'
        },
        props: {
          min: 10
        }
      }
      expect(minLength(10)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '1234567890'
      const response = undefined
      expect(minLength(10)(goodValue)).toEqual(response)
    })
  })

  describe('maxLength. Used for fields that have a maximum length', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '186821638721616236132872163781268316863'
      const response = {
        message: {
          id: 'validations.maxLength',
          defaultMessage: 'Must not be more than {max} characters',
          description:
            'The error message that appears on fields with a maximum length'
        },
        props: {
          max: 17
        }
      }
      expect(maxLength(17)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '1234567890'
      const response = undefined
      expect(maxLength(17)(goodValue)).toEqual(response)
    })
  })

  describe('range. Used for fields that have a range limit', () => {
    it('Should error when supplied a bad value. ', () => {
      const badValue = '9'
      const response = {
        message: {
          id: 'validations.range',
          defaultMessage: 'Must be within {min} and {max}',
          description:
            'The error message that appears when an out of range value is used'
        },
        props: {
          min: 0,
          max: 6
        }
      }
      expect(range(0, 6)(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value. ', () => {
      const goodValue = '5'
      const response = undefined
      expect(range(0, 6)(goodValue)).toEqual(response)
    })
  })

  describe('validIDNumber. Used for ID number field that has a specific validation', () => {
    it('Should error when supplied a bad value containing characters as National ID.', () => {
      const badValue = '2019BrTVz8945'
      const typeOfID = 'NATIONAL_ID'
      const response = {
        message: {
          defaultMessage:
            'The National ID can only be numeric and must be 10 digits long',
          description:
            'The error message that appears when an invalid value is used as nid',
          id: 'validations.validNationalId'
        }
      }
      expect(validIDNumber(typeOfID)(badValue)).toEqual(response)
    })
    it('Should error when supplied a bad value containing more digits than desired as National ID.', () => {
      const badValue = '20197839489452'
      const typeOfID = 'NATIONAL_ID'
      const response = {
        message: {
          defaultMessage:
            'The National ID can only be numeric and must be 10 digits long',
          description:
            'The error message that appears when an invalid value is used as nid',
          id: 'validations.validNationalId'
        }
      }
      expect(validIDNumber(typeOfID)(badValue)).toEqual(response)
    })
    it('Should pass when supplied a good value as National ID.', () => {
      const goodValue = '123456789'
      const typeOfID = 'NATIONAL_ID'
      const response = undefined
      expect(validIDNumber(typeOfID)(goodValue)).toEqual(response)
    })
  })

  describe('numeric. Checks a value is numeric', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = {
        message: {
          id: 'validations.numberRequired',
          defaultMessage: 'Must be a number',
          description:
            'The error message that appears on fields where the value must be a number'
        }
      }
      expect(numeric(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '7'
      const response = undefined
      expect(numeric(goodValue)).toEqual(response)
    })
  })

  describe('phoneNumberFormat. Checks a value is a valid phone number returning the message descriptor', () => {
    it('should error when supplied a bad value.', () => {
      const badValue = 'hgjhg'
      const response = {
        message: {
          id: 'validations.phoneNumberFormat',
          defaultMessage:
            'Must be a valid {num} digit number that starts with {start}',
          description:
            'The error message that appears on phone numbers where the first two characters must be a 01 and length must be 11'
        }
      }
      expect(phoneNumberFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = '01845678912'
      const response = undefined
      expect(phoneNumberFormat(goodValue)).toEqual(response)
    })
  })

  describe('emailAddressFormat. Checks a value is a valid email address returning the message descriptor', () => {
    it('should error when supplied a value invalid email.', () => {
      const badValue = 'user@domain'
      const response = {
        message: {
          id: 'validations.emailAddressFormat',
          defaultMessage: 'Must be a valid email address',
          description:
            'The error message appears when the email addresses are not valid'
        }
      }
      expect(emailAddressFormat(badValue)).toEqual(response)
    })
    it('should error when supplied a value with invalid domain.', () => {
      const badValue = 'user@example.c'
      const response = {
        message: {
          id: 'validations.emailAddressFormat',
          defaultMessage: 'Must be a valid email address',
          description:
            'The error message appears when the email addresses are not valid'
        }
      }
      expect(emailAddressFormat(badValue)).toEqual(response)
    })
    it('should pass when supplied a good value.', () => {
      const goodValue = 'root@opencrvs.org'
      const response = undefined
      expect(emailAddressFormat(goodValue)).toEqual(response)
    })
  })

  describe('dateFormat. Checks a given date is a valid date', () => {
    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(dateFormat(invalidDate)).toEqual({ message: messages.dateFormat })
    })

    it('should pass when supplied a valid date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(dateFormat(validDate)).toEqual(response)
    })

    it('should pass when supplied a valid date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(dateFormat(validDate)).toEqual(response)
    })
  })

  describe('isValidBirthDate. Checks a given date is a valid birth date', () => {
    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input a future date', () => {
      const invalidDate = '2037-2-29'
      expect(isValidBirthDate(invalidDate)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should error when input a date after death', () => {
      const drafts = {
        deathEvent: {
          deathDate: '1991-10-22'
        }
      }
      const invalidDate = '1994-10-22'
      expect(isValidBirthDate(invalidDate, drafts)).toEqual({
        message: messages.isDateNotAfterDeath
      })
    })

    it('should error when input a date after birth event', () => {
      const drafts = {
        child: {
          childBirthDate: '1992-08-18'
        }
      }
      const invalidDate = '1994-10-22'
      expect(isValidBirthDate(invalidDate, drafts)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should pass when supplied a valid birth date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(isValidBirthDate(validDate)).toEqual(response)
    })

    it('should pass when supplied a valid birth date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(isValidBirthDate(validDate)).toEqual(response)
    })
  })

  describe('dateInPast. Checks if a given birth date is in the past', () => {
    it('should not give an error message if the birth date is in the past', () => {
      const todaysDate = new Date('1999-12-31')
      todaysDate.setHours(0, 0, 0)
      const today = todaysDate.toDateString()
      expect(dateInPast()(today)).toEqual(undefined)
    })
    it("should give an error message if the date is today's date", () => {
      const todaysDate = new Date()
      todaysDate.setHours(0, 0, 0)
      const today = todaysDate.toDateString()
      expect(dateInPast()(today)).toEqual({
        message: messages.isValidBirthDate
      })
    })

    it('should give an error message if the date is in the future', () => {
      const todaysDate = new Date(2040, 12, 12)
      todaysDate.setHours(0, 0, 0)
      const today = todaysDate.toDateString()
      expect(dateInPast()(today)).toEqual({
        message: messages.isValidBirthDate
      })
    })
  })

  describe('bengaliOnlyNameFormat. Checks a value is a valid Bengali name', () => {
    it('should error when a Bengali punctuation is given', () => {
      const badValue = 'মাসুম।'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when a Bengali number is given', () => {
      const badValue = 'মাসুম১'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when an English number is given', () => {
      const badValue = 'মাসুম1'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should error when a non Bengali character is given', () => {
      const badValue = 'Masum'
      expect(bengaliOnlyNameFormat(badValue)).toEqual({
        message: messages.bengaliOnlyNameFormat
      })
    })
    it('should pass when given a good name in Bengali', () => {
      const goodValue = 'মাসুম'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when given a good name in Bengali with multiple words', () => {
      const goodValue = 'আব্দুল জলিল'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when a hyphenated Bengali name is given', () => {
      const goodValue = 'আব্দুল-জলিল'
      expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
    })
    describe('when name has brackets', () => {
      it('should pass when entire name enclosed with bracket', () => {
        const goodValue = '(আব্দুল-জলিল)'
        expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with first part', () => {
        const goodValue = '(আব্দুল) জলিল'
        expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with middle part', () => {
        const goodValue = 'আব্দুল (জলিল) জন'
        expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with last part', () => {
        const goodValue = 'আব্দুল (জলিল)'
        expect(bengaliOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should error when brackets are wrongly used', () => {
        const badValue1 = 'আব্দুল জলিল()'
        const badValue2 = 'আব্দুল (জলিল'
        const badValue3 = '()'
        const badValue4 = 'আব্দুল (জলিল))'

        expect(bengaliOnlyNameFormat(badValue1)).toEqual({
          message: messages.bengaliOnlyNameFormat
        })
        expect(bengaliOnlyNameFormat(badValue2)).toEqual({
          message: messages.bengaliOnlyNameFormat
        })
        expect(bengaliOnlyNameFormat(badValue3)).toEqual({
          message: messages.bengaliOnlyNameFormat
        })
        expect(bengaliOnlyNameFormat(badValue4)).toEqual({
          message: messages.bengaliOnlyNameFormat
        })
      })
    })
  })

  describe('englishOnlyNameFormat. Checks a value is a valid English name', () => {
    it('should error when a Bengali number is given', () => {
      const badValue = 'John১'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should error when a non English character is given', () => {
      const badValue = 'জন'
      expect(englishOnlyNameFormat(badValue)).toEqual({
        message: messages.englishOnlyNameFormat
      })
    })
    it('should pass when given a good name in English', () => {
      const goodValue = 'John'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when given a good name in English with multiple words', () => {
      const goodValue = 'John Doe'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
    it('should pass when a hyphenated English name is given', () => {
      const goodValue = 'Anne-Marie'
      expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
    })
    describe('when name has brackets', () => {
      it('should pass when entire name enclosed with bracket', () => {
        const goodValue = '(John-Doe)'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with first part', () => {
        const goodValue = '(John) Doe'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with middle part', () => {
        const goodValue = 'John (Denver) Doe'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when brackets are with last part', () => {
        const goodValue = 'John (Doe)'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when given a good name in English with underscore', () => {
        const goodValue = 'John_Doe'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when given a good name in English with number', () => {
        const goodValue = 'John 3rd'
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when given a good name in English with number at first', () => {
        const goodValue = "10th John The Alex'ander"
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should pass when given a good name in English with apostrophe', () => {
        const goodValue = "John O'conor"
        expect(englishOnlyNameFormat(goodValue)).toBeUndefined()
      })

      it('should error when brackets are wrongly used', () => {
        const badValue1 = 'John Doe()'
        const badValue2 = 'John (Doe'
        const badValue3 = '()'
        const badValue4 = 'John (Doe))'

        expect(englishOnlyNameFormat(badValue1)).toEqual({
          message: messages.englishOnlyNameFormat
        })
        expect(englishOnlyNameFormat(badValue2)).toEqual({
          message: messages.englishOnlyNameFormat
        })
        expect(englishOnlyNameFormat(badValue3)).toEqual({
          message: messages.englishOnlyNameFormat
        })
        expect(englishOnlyNameFormat(badValue4)).toEqual({
          message: messages.englishOnlyNameFormat
        })
      })
    })
  })

  describe('checkBirthDate. Used for validation of date of birth.', () => {
    // When marriageDate = 'falsy'

    it('should fail for invalid format', () => {
      const marriageDate = ''
      const invalidDate = '1901-+2-2e'
      expect(checkBirthDate(marriageDate)(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })
    it('should fail for invalid number input', () => {
      const marriageDate = ''
      const invalidDate = '190-2-21'
      expect(checkBirthDate(marriageDate)(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })
    it('should fail for invalid date', () => {
      const marriageDate = ''
      const invalidDate = '2015-2-29'
      expect(checkBirthDate(marriageDate)(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })
    it('should fail for dates in the future', () => {
      const marriageDate = ''
      const invalidDate = '2125-2-27'
      expect(checkBirthDate(marriageDate)(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })
    it('should pass for one-digit figures for day and month', () => {
      const marriageDate = ''
      const validDate = '2012-2-2'
      expect(checkBirthDate(marriageDate)(validDate)).toEqual(undefined)
    })
    it('should pass for valid dates', () => {
      const marriageDate = ''
      const validDate = '2003-02-23'
      expect(checkBirthDate(marriageDate)(validDate)).toEqual(undefined)
    })

    // When the marriage date is before the birth date

    it('should fail for marriage dates before the birth date', () => {
      const marriageDate = '1801-02-23'
      const birthDate = '2003-02-23'
      expect(checkBirthDate(marriageDate)(birthDate)).toEqual({
        message: messages.dobEarlierThanDom
      })
    })

    // When the marriage date is after the birth date

    it('should fail for marriage dates after the birth date', () => {
      const marriageDate = '2101-02-23'
      const validDate = '2003-02-23'
      expect(checkBirthDate(marriageDate)(validDate)).toEqual(undefined)
    })
  })

  describe('dateGreaterThan. Checks if a given date is greater than another given date', () => {
    it('should give error message when the second date is greater than the first date', () => {
      const previousDate = '1971-03-26'
      const laterDate = '1971-12-16'
      expect(dateGreaterThan(laterDate)(previousDate)).toEqual({
        message: messages.domLaterThanDob
      })
    })
    it('should be okay when the first date is greater than the second date', () => {
      const previousDate = '1971-03-26'
      const laterDate = '1971-12-16'
      expect(dateGreaterThan(previousDate)(laterDate)).toEqual(undefined)
    })
  })

  describe('dateLessThan. Checks if a given date is less than another given date', () => {
    it('should be okay when the first date is less than the second date', () => {
      const previousDate = '1971-03-26'
      const laterDate = '1971-12-16'
      expect(dateLessThan(laterDate)(previousDate)).toEqual(undefined)
    })
    it('should give error message when the second date is less than the first date', () => {
      const previousDate = '1971-03-26'
      const laterDate = '1971-12-16'
      expect(dateLessThan(previousDate)(laterDate)).toEqual({
        message: messages.dobEarlierThanDom
      })
    })
  })

  describe('dateNotInFuture. Checks if a given date is in the future', () => {
    it('should be okay with date not in future', () => {
      const pastDate = '2003-02-23'
      expect(dateNotInFuture()(pastDate)).toEqual(undefined)
    })
    it('should give error message with date in future', () => {
      const futureDate = '2053-02-23'
      expect(dateNotInFuture()(futureDate)).toEqual({
        message: messages.dateFormat
      })
    })
  })

  describe('isDateAfter. Checks if a given date is after a given date', () => {
    it('should be okay with first after second', () => {
      const first = '1995-10-10'
      const second = '1971-02-23'
      expect(isDateAfter(first, second)).toEqual(true)
    })
    it('should not be okay with first after second', () => {
      const second = '1995-10-10'
      const first = '1994-10-10'
      expect(isDateAfter(first, second)).toEqual(false)
    })
  })

  describe('dateFormatIsCorrect. Checks if a given date is in correct format', () => {
    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(dateFormatIsCorrect()(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(dateFormatIsCorrect()(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(dateFormatIsCorrect()(invalidDate)).toEqual({
        message: messages.dateFormat
      })
    })

    it('should pass when supplied a valid date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(dateFormatIsCorrect()(validDate)).toEqual(response)
    })

    it('should pass when supplied a valid date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(dateFormatIsCorrect()(validDate)).toEqual(response)
    })
  })

  describe('isValidDeathOccrenceDate. Checks a given date of death is valid', () => {
    const drafts = {
      deceased: {
        deceasedBirthDate: '1991-10-22'
      }
    }

    it('should error when input invalid chararcters', () => {
      const invalidDate = '1901-+2-2e'
      expect(isValidDeathOccurrenceDate(invalidDate, drafts)).toEqual({
        message: messages.isValidDateOfDeath
      })
    })

    it('should error when input invalid format', () => {
      const invalidDate = '190-2-21'
      expect(isValidDeathOccurrenceDate(invalidDate, drafts)).toEqual({
        message: messages.isValidDateOfDeath
      })
    })

    it('should error when input invalid date', () => {
      const invalidDate = '2017-2-29'
      expect(isValidDeathOccurrenceDate(invalidDate, drafts)).toEqual({
        message: messages.isValidDateOfDeath
      })
    })

    it('should error when input a future date', () => {
      const futureDate = '2099-08-12'

      expect(isValidDeathOccurrenceDate(futureDate, drafts)).toEqual({
        message: messages.isValidDateOfDeath
      })
    })

    it('should error when input a date before DOB of deceased', () => {
      const futureDate = '1991-10-21'

      expect(isValidDeathOccurrenceDate(futureDate, drafts)).toEqual({
        message: messages.isDateNotBeforeBirth
      })
    })

    it('should pass when supplied a valid date with single digit', () => {
      const validDate = '2011-8-12'
      const response = undefined
      expect(isValidDeathOccurrenceDate(validDate, drafts)).toEqual(response)
    })

    it('should pass when supplied a valid date', () => {
      const validDate = '2011-08-12'
      const response = undefined
      expect(isValidDeathOccurrenceDate(validDate, drafts)).toEqual(response)
    })
  })

  describe('greaterThanZero. Checks a input value is greater than zero', () => {
    it('should error when supplied 0 as a inputvalue .', () => {
      const badValue = '0'
      const response = {
        message: {
          id: 'validations.greaterThanZero',
          defaultMessage: 'Must be a greater than zero',
          description:
            'The error message appears when input is less than or equal to 0'
        }
      }
      expect(greaterThanZero(badValue)).toEqual(response)
    })
    it('should pass when supplied 1 as good value.', () => {
      const goodValue = '1'
      const response = undefined
      expect(greaterThanZero(goodValue)).toEqual(response)
    })
  })

  describe('Checking validLength function', () => {
    it('Should return error message', () => {
      const factory = validLength(5)
      const result = factory(999999)
      expect(!!result).toBe(true)
    })

    it('Should return no error', () => {
      const factory = validLength(5)
      const result = factory(99999)
      expect(!!result).toBe(false)
    })
  })

  describe('notGreaterThan. Checks if a number value not greater than a given number', () => {
    it('should pass if the value is not greater than the given number', () => {
      const goodValue = '13'
      const maxValue = 15
      const response = undefined
      expect(notGreaterThan(maxValue)(goodValue)).toBe(response)
    })

    it('should error if the value is greater than the given number', () => {
      const badValue = '37'
      const maxValue = 15
      const response = {
        message: {
          defaultMessage: 'Must not be more than {maxValue}',
          description:
            'The error message that appears on numeric fields that exceed a limit',
          id: 'validations.notGreaterThan'
        },
        props: {
          maxValue
        }
      }
      expect(notGreaterThan(maxValue)(badValue)).toEqual(response)
    })
  })
})
