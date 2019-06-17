import {
  IFormField,
  Ii18nFormField,
  ISelectOption,
  IConditionals,
  IFormSectionData,
  IConditional,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  IRadioOption,
  ICheckboxOption,
  ISelectFormFieldWithDynamicOptions,
  INFORMATIVE_RADIO_GROUP,
  PARAGRAPH,
  IDynamicListFormField,
  IDynamicValueMapper,
  IFormData,
  IDynamicFormFieldValidators,
  IDynamicFormField,
  FETCH_BUTTON,
  ILoaderButton,
  IFieldInput,
  IQuery
} from '@register/forms'
import { InjectedIntl, FormattedMessage } from 'react-intl'
import { getValidationErrorsForForm } from '@register/forms/validation'
import {
  IOfflineDataState,
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation
} from '@register/offline/reducer'
import { Validation } from '@register/utils/validate'
import moment from 'moment'
import { IDynamicValues } from '@opencrvs/register/src/navigation'

interface IRange {
  start: number
  end?: number
  value: string
}

export const internationaliseOptions = (
  intl: InjectedIntl,
  options: Array<ISelectOption | IRadioOption | ICheckboxOption>
) => {
  return options.map(opt => {
    return {
      ...opt,
      label: intl.formatMessage(opt.label)
    }
  })
}

export const internationaliseFieldObject = (
  intl: InjectedIntl,
  field: IFormField
): Ii18nFormField => {
  const base = {
    ...field,
    label:
      field.type === PARAGRAPH ? field.label : intl.formatMessage(field.label),
    description: field.description && intl.formatMessage(field.description)
  }

  if (
    base.type === SELECT_WITH_OPTIONS ||
    base.type === RADIO_GROUP ||
    base.type === INFORMATIVE_RADIO_GROUP ||
    base.type === CHECKBOX_GROUP
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
  }

  if (base.type === FETCH_BUTTON) {
    ;(base as any).modalTitle = intl.formatMessage(
      (field as ILoaderButton).modalTitle
    )
    ;(base as any).successTitle = intl.formatMessage(
      (field as ILoaderButton).successTitle
    )
    ;(base as any).errorTitle = intl.formatMessage(
      (field as ILoaderButton).errorTitle
    )
  }

  return base as Ii18nFormField
}

export const generateOptions = (
  options: ILocation[],
  optionType: string
): ISelectOption[] => {
  const optionsArray: ISelectOption[] = []
  options.forEach((option: ILocation, index: number) => {
    optionsArray.push({
      value: option.id,
      label: {
        id: `${optionType}.${option.id}`,
        defaultMessage: option.name,
        description: `${optionType} select item for ${option.id}`
      }
    })
  })
  return optionsArray
}

export const getFieldType = (
  field: IDynamicFormField,
  values: IFormSectionData
): string => {
  if (!field.dynamicDefinitions.type) {
    return field.type
  }

  switch (field.dynamicDefinitions.type.kind) {
    case 'dynamic':
      return field.dynamicDefinitions.type.typeMapper(values[
        field.dynamicDefinitions.type.dependency
      ] as string)
    case 'static':
    default:
      return field.dynamicDefinitions.type.staticType
  }
}

export const getFieldLabel = (
  field: IDynamicFormField,
  values: IFormSectionData
): FormattedMessage.MessageDescriptor | undefined => {
  if (!field.dynamicDefinitions.label) {
    return undefined
  }
  return field.dynamicDefinitions.label.labelMapper(values[
    field.dynamicDefinitions.label.dependency
  ] as string)
}

export const getFieldValidation = (
  field: IDynamicFormField,
  values: IFormSectionData
): Validation[] => {
  const validate: Validation[] = []
  if (
    field.dynamicDefinitions &&
    field.dynamicDefinitions.validate &&
    field.dynamicDefinitions.validate.length > 0
  ) {
    field.dynamicDefinitions.validate.map(
      (element: IDynamicFormFieldValidators) => {
        const params: any[] = []
        element.dependencies.map((dependency: string) =>
          params.push(values[dependency])
        )
        const fun = element.validator(...params)
        validate.push(fun)
      }
    )
  }

  return validate
}

export const getFieldOptions = (
  field: ISelectFormFieldWithDynamicOptions,
  values: IFormSectionData,
  resources?: IOfflineDataState
) => {
  const dependencyVal = values[field.dynamicOptions.dependency] as string
  if (!dependencyVal) {
    return []
  }
  if (resources && field.dynamicOptions.resource === OFFLINE_LOCATIONS_KEY) {
    const locations = resources[OFFLINE_LOCATIONS_KEY]
    let partOf: string
    if (dependencyVal === window.config.COUNTRY.toUpperCase()) {
      partOf = 'Location/0'
    } else {
      partOf = `Location/${dependencyVal}`
    }
    return generateOptions(
      Object.values(locations).filter((location: ILocation) => {
        return location.partOf === partOf
      }),
      'location'
    )
  } else if (
    resources &&
    field.dynamicOptions.resource === OFFLINE_FACILITIES_KEY
  ) {
    const facilities = resources[OFFLINE_FACILITIES_KEY]
    return generateOptions(Object.values(facilities), 'facility')
  } else {
    let options
    if (!field.dynamicOptions.options) {
      throw new Error(
        `Dependency '${dependencyVal}' has illegal value, the value should have an entry in the dynamic options object.`
      )
    } else {
      options = field.dynamicOptions.options[dependencyVal]
    }
    return options
  }
}

interface INested {
  [key: string]: any
}

const getNestedValue = (obj: object, key: string) => {
  return key.split('.').reduce((res: INested, k) => res[k] || '', obj)
}

const betweenRange = (range: IRange, check: number) =>
  range.end ? check >= range.start && check <= range.end : check >= range.start

export const getFieldOptionsByValueMapper = (
  field: IDynamicListFormField,
  values: IFormSectionData | IFormData,
  valueMapper: IDynamicValueMapper
) => {
  const dependencyVal = (getNestedValue(
    values,
    field.dynamicItems.dependency
  ) as unknown) as string

  const firstKey = Object.keys(field.dynamicItems.items)[0]

  if (!dependencyVal) {
    return field.dynamicItems.items[firstKey]
  }

  const mappedValue = valueMapper(dependencyVal)

  let items

  if (!field.dynamicItems.items[mappedValue]) {
    items = field.dynamicItems.items[firstKey]
  } else {
    items = field.dynamicItems.items[mappedValue]
  }
  return items
}

export const diffDoB = (doB: string) => {
  const todaysDate = moment(Date.now())
  const birthDate = moment(doB)
  const diffInDays = todaysDate.diff(birthDate, 'days')

  const ranges: IRange[] = [
    { start: 0, end: 45, value: 'within45days' },
    { start: 46, end: 5 * 365, value: 'between46daysTo5yrs' },
    { start: 5 * 365 + 1, value: 'after5yrs' }
  ]
  const valueWithinRange = ranges.find(range => betweenRange(range, diffInDays))
  return valueWithinRange ? valueWithinRange.value : ''
}

export function isCityLocation(
  locations: { [key: string]: ILocation },
  locationId: string
): boolean {
  const selectedLocation = locations[locationId]
  if (selectedLocation) {
    if (selectedLocation.jurisdictionType === 'CITYCORPORATION') {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

interface IVars {
  [key: string]: any
}

export function getInputValues(
  inputs: IFieldInput[],
  values: IFormSectionData
): IDynamicValues {
  const variables: IVars = {}
  inputs.forEach((input: IFieldInput) => {
    variables[input.name] = values[input.valueField]
  })
  return variables
}

export function getQueryData(
  field: ILoaderButton,
  values: IFormSectionData
): IQuery | undefined {
  const selectedValue = values[field.querySelectorInput.valueField] as string
  const queryData = field.queryMap[selectedValue]

  if (!queryData) {
    return
  }

  const variables = getInputValues(queryData.inputs, values)
  queryData.variables = variables
  return queryData
}

export const getConditionalActionsForField = (
  field: IFormField,
  values: IFormSectionData,
  resources?: IOfflineDataState
): string[] => {
  if (!field.conditionals) {
    return []
  }

  return field.conditionals
    .filter(conditional =>
      /* eslint-disable-line  no-eval */
      eval(conditional.expression)
    )
    .map((conditional: IConditional) => conditional.action)
}

export const hasFormError = (
  fields: IFormField[],
  values: IFormSectionData
): boolean => {
  const errors = getValidationErrorsForForm(fields, values)

  const fieldListWithErrors = Object.keys(errors).filter(key => {
    return errors[key] && errors[key].length > 0
  })
  return fieldListWithErrors && fieldListWithErrors.length > 0
}

export const conditionals: IConditionals = {
  iDType: {
    action: 'hide',
    expression: "!values.iDType || (values.iDType !== 'OTHER')"
  },
  fathersDetailsExist: {
    action: 'hide',
    expression: '!values.fathersDetailsExist'
  },
  permanentAddressSameAsMother: {
    action: 'hide',
    expression: 'values.permanentAddressSameAsMother'
  },
  addressSameAsMother: {
    action: 'hide',
    expression: 'values.addressSameAsMother'
  },
  currentAddressSameAsPermanent: {
    action: 'hide',
    expression: 'values.currentAddressSameAsPermanent'
  },
  countryPermanent: {
    action: 'hide',
    expression: '!values.countryPermanent'
  },
  statePermanent: {
    action: 'hide',
    expression: '!values.statePermanent'
  },
  districtPermanent: {
    action: 'hide',
    expression: '!values.districtPermanent'
  },
  addressLine4Permanent: {
    action: 'hide',
    expression: '!values.addressLine4Permanent'
  },
  addressLine3Permanent: {
    action: 'hide',
    expression: '!values.addressLine3Permanent'
  },
  country: {
    action: 'hide',
    expression: '!values.country'
  },
  state: {
    action: 'hide',
    expression: '!values.state'
  },
  district: {
    action: 'hide',
    expression: '!values.district'
  },
  addressLine4: {
    action: 'hide',
    expression: '!values.addressLine4'
  },
  addressLine3: {
    action: 'hide',
    expression: '!values.addressLine3'
  },
  uploadDocForWhom: {
    action: 'hide',
    expression: '!values.uploadDocForWhom'
  },
  motherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="MOTHER"'
  },
  fatherCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="FATHER"'
  },
  informantCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="INFORMANT"'
  },
  otherPersonCollectsCertificate: {
    action: 'hide',
    expression: 'values.personCollectingCertificate!="OTHER"'
  },
  birthCertificateCollectorNotVerified: {
    action: 'hide',
    expression:
      '!(values.personCollectingCertificate=="MOTHER" && values.motherDetails===false) && !(values.personCollectingCertificate=="FATHER" && values.fatherDetails===false) && !(values.personCollectingCertificate =="OTHER" && values.otherPersonSignedAffidavit===false)'
  },
  deathCertificateCollectorNotVerified: {
    action: 'hide',
    expression:
      '!(values.personCollectingCertificate=="INFORMANT" && values.informantDetails===false) && !(values.personCollectingCertificate =="OTHER" && values.otherPersonSignedAffidavit===false)'
  },
  placeOfBirthHospital: {
    action: 'hide',
    expression:
      '(values.placeOfBirth!="HOSPITAL" && values.placeOfBirth!="OTHER_HEALTH_INSTITUTION")'
  },
  placeOfDeathHospital: {
    action: 'hide',
    expression:
      '(values.placeOfDeath!="HOSPITAL" && values.placeOfDeath!="OTHER_HEALTH_INSTITUTION")'
  },
  otherBirthEventLocation: {
    action: 'hide',
    expression:
      '(values.placeOfBirth!="OTHER" && values.placeOfBirth!="PRIVATE_HOME")'
  },
  otherDeathEventLocation: {
    action: 'hide',
    expression:
      '(values.placeOfDeath!="OTHER" && values.placeOfDeath!="PRIVATE_HOME")'
  },
  isNotCityLocation: {
    action: 'hide',
    expression:
      '(resources && resources.locations && isCityLocation(resources.locations,values.addressLine4))'
  },
  isCityLocation: {
    action: 'hide',
    expression:
      '!(resources && resources.locations && isCityLocation(resources.locations,values.addressLine4))'
  },
  isNotCityLocationPermanent: {
    action: 'hide',
    expression:
      '(resources && resources.locations && isCityLocation(resources.locations,values.addressLine4Permanent))'
  },
  isCityLocationPermanent: {
    action: 'hide',
    expression:
      '!(resources && resources.locations && isCityLocation(resources.locations,values.addressLine4Permanent))'
  },
  iDAvailable: {
    action: 'hide',
    expression: 'values.iDType === "NO_ID"'
  },
  applicantPermanentAddressSameAsCurrent: {
    action: 'hide',
    expression: 'values.applicantPermanentAddressSameAsCurrent'
  },
  deathPlaceOther: {
    action: 'hide',
    expression: 'values.deathPlaceAddress !== "OTHER"'
  },
  causeOfDeathEstablished: {
    action: 'hide',
    expression: '!values.causeOfDeathEstablished'
  },
  isMarried: {
    action: 'hide',
    expression: '(!values.maritalStatus || values.maritalStatus !== "MARRIED")'
  },
  identifierIDSelected: {
    action: 'hide',
    expression:
      '(!values.iDType || (values.iDType !== "BIRTH_REGISTRATION_NUMBER" && values.iDType !== "NATIONAL_ID"))'
  },
  otherRelationship: {
    action: 'hide',
    expression: 'values.applicantsRelationToDeceased !== "OTHER"'
  }
}
