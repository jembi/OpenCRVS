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
  IFormField,
  Ii18nFormField,
  ISelectOption,
  IFormSectionData,
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
  IFormSection,
  IQuery,
  DATE,
  IDateFormField,
  IFormSectionGroup,
  IRadioGroupFormField,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IFormFieldValue,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IRadioGroupWithNestedFieldsFormField,
  ISelectFormFieldWithOptions,
  BULLET_LIST,
  HIDDEN,
  Ii18nHiddenFormField,
  IDocumentUploaderWithOptionsFormField,
  HTTP,
  InitialValue,
  DependencyInfo,
  IHttpFormField,
  IButtonFormField,
  BUTTON,
  Ii18nButtonFormField,
  ILinkButtonFormField,
  LINK_BUTTON,
  IDReaderFormField,
  ID_READER,
  Ii18nIDReaderFormField,
  QRReaderType,
  ReaderType
} from '@client/forms'
import { IntlShape, MessageDescriptor } from 'react-intl'
import {
  getValidationErrorsForForm,
  IFieldErrors,
  Errors
} from '@client/forms/validation'
import {
  OFFLINE_LOCATIONS_KEY,
  OFFLINE_FACILITIES_KEY,
  ILocation,
  IOfflineData
} from '@client/offline/reducer'
import {
  Validation,
  isAValidDateFormat,
  isDateNotInFuture
} from '@client/utils/validate'
import { IRadioOption as CRadioOption } from '@opencrvs/components/lib/Radio'
import { IDynamicValues } from '@client/navigation'
import { callingCountries } from 'country-data'
import { IDeclaration } from '@client/declarations'
import differenceInDays from 'date-fns/differenceInDays'
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import { Conditional } from './conditionals'
import { UserDetails } from '@client/utils/userUtils'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'

export const VIEW_TYPE = {
  FORM: 'form',
  REVIEW: 'review',
  PREVIEW: 'preview',
  HIDDEN: 'hidden'
}

const REGISTRATION_TARGET_DAYS =
  window.config &&
  window.config.BIRTH &&
  window.config.BIRTH.REGISTRATION_TARGET

interface IRange {
  start: number
  end?: number
  value: string
}

const internationaliseOptions = (
  intl: IntlShape,
  options: Array<ISelectOption | IRadioOption | ICheckboxOption>
) => {
  return options.map((opt) => {
    return {
      ...opt,
      label: intl.formatMessage(
        opt.label,
        'param' in opt ? opt.param : undefined
      )
    }
  })
}

const internationaliseListFieldObject = (
  intl: IntlShape,
  options: MessageDescriptor[]
) => {
  return options.map((opt) => intl.formatMessage(opt))
}

export const internationaliseFieldObject = (
  intl: IntlShape,
  field: IFormField
): Ii18nFormField => {
  const base = {
    ...field,
    label:
      field.type === PARAGRAPH
        ? field.label
        : intl.formatMessage(field.label, field.labelParam),
    helperText: field.helperText && intl.formatMessage(field.helperText),
    tooltip: field.tooltip && intl.formatMessage(field.tooltip),
    unit: field.unit && intl.formatMessage(field.unit),
    description: field.description && intl.formatMessage(field.description),
    placeholder: field.placeholder && intl.formatMessage(field.placeholder)
  }

  if (base.type === HIDDEN) {
    return base as Ii18nHiddenFormField
  }

  if (
    base.type === SELECT_WITH_OPTIONS ||
    base.type === INFORMATIVE_RADIO_GROUP ||
    base.type === CHECKBOX_GROUP ||
    base.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
  }

  if (base.type === BULLET_LIST) {
    ;(base as any).items = internationaliseListFieldObject(intl, base.items)
  }

  if (
    base.type === RADIO_GROUP ||
    base.type === RADIO_GROUP_WITH_NESTED_FIELDS
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
    if ((field as IDateFormField).notice) {
      ;(base as any).notice = intl.formatMessage(
        // @ts-ignore
        (field as IRadioGroupFormField).notice
      )
    }
  }

  if (base.type === DATE && (field as IDateFormField).notice) {
    ;(base as any).notice = intl.formatMessage(
      // @ts-ignore
      (field as IDateFormField).notice
    )
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

  if (isFieldButton(field)) {
    ;(base as Ii18nButtonFormField).buttonLabel = intl.formatMessage(
      field.buttonLabel
    )
    if (field.loadingLabel) {
      ;(base as Ii18nButtonFormField).loadingLabel = intl.formatMessage(
        field.loadingLabel
      )
    }
  }

  if (isFieldIDReader(field)) {
    ;(base as Ii18nIDReaderFormField).dividerLabel = intl.formatMessage(
      field.dividerLabel
    )
    ;(base as Ii18nIDReaderFormField).manualInputInstructionLabel =
      intl.formatMessage(field.manualInputInstructionLabel)
  }

  return base as Ii18nFormField
}

const generateOptions = (
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
      return field.dynamicDefinitions.type.typeMapper(
        values[field.dynamicDefinitions.type.dependency] as string
      )
    case 'static':
    default:
      return field.dynamicDefinitions.type.staticType
  }
}

export const getFieldLabel = (
  field: IDynamicFormField,
  values: IFormSectionData
): MessageDescriptor | undefined => {
  if (!field.dynamicDefinitions.label) {
    return undefined
  }
  return field.dynamicDefinitions.label.labelMapper(
    values[field.dynamicDefinitions.label.dependency] as string
  )
}

export const getFieldHelperText = (
  field: IDynamicFormField,
  values: IFormSectionData
): MessageDescriptor | undefined => {
  if (!field.dynamicDefinitions.helperText) {
    return undefined
  }
  return field.dynamicDefinitions.helperText.helperTextMapper(
    values[field.dynamicDefinitions.helperText.dependency] as string
  )
}

export const getFieldLabelToolTip = (
  field: IDynamicFormField,
  values: IFormSectionData
): MessageDescriptor | undefined => {
  if (!field.dynamicDefinitions.tooltip) {
    return undefined
  }
  return field.dynamicDefinitions.tooltip.tooltipMapper(
    values[field.dynamicDefinitions.tooltip.dependency] as string
  )
}

export const getFieldValidation = (
  field: IDynamicFormField,
  values: IFormSectionData
): Validation[] => {
  const validator: Validation[] = []
  if (
    field.dynamicDefinitions &&
    field.dynamicDefinitions.validator &&
    field.dynamicDefinitions.validator.length > 0
  ) {
    field.dynamicDefinitions.validator.map(
      (element: IDynamicFormFieldValidators) => {
        const params: any[] = []
        element.dependencies.map((dependency: string) =>
          params.push(values[dependency])
        )
        const fun = element.validator(...params)
        validator.push(fun)
        return element
      }
    )
  }

  return validator
}

export function getNextSectionIds(
  sections: IFormSection[],
  fromSection: IFormSection,
  fromSectionGroup: IFormSectionGroup,
  declaration: IDeclaration,
  userDetails?: UserDetails | null
): { [key: string]: string } | null {
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    fromSection,
    declaration.data[fromSection.id] || {},
    declaration.data,
    userDetails
  )
  const currentGroupIndex = visibleGroups.findIndex(
    (group: IFormSectionGroup) => group.id === fromSectionGroup.id
  )

  if (currentGroupIndex === visibleGroups.length - 1) {
    const visibleSections = sections.filter(
      (section) =>
        section.viewType !== VIEW_TYPE.HIDDEN &&
        getVisibleSectionGroupsBasedOnConditions(
          section,
          declaration.data[fromSection.id] || {},
          declaration.data,
          userDetails
        ).length > 0
    )

    const currentIndex = visibleSections.findIndex(
      (section: IFormSection) => section.id === fromSection.id
    )
    if (currentIndex === visibleSections.length - 1) {
      return null
    }

    return {
      sectionId: visibleSections[currentIndex + 1].id,
      groupId: visibleSections[currentIndex + 1].groups[0].id
    }
  }
  return {
    sectionId: fromSection.id,
    groupId: visibleGroups[currentGroupIndex + 1].id
  }
}

export const getVisibleGroupFields = (group: IFormSectionGroup) => {
  return group.fields.filter((field) => !field.hidden)
}
export const getFieldOptions = (
  field:
    | ISelectFormFieldWithOptions
    | ISelectFormFieldWithDynamicOptions
    | IDocumentUploaderWithOptionsFormField,
  values: IFormSectionData,
  offlineCountryConfig: IOfflineData,
  declaration?: IFormData
) => {
  if (
    field.type === SELECT_WITH_OPTIONS ||
    field.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) {
    if (field.optionCondition) {
      // eslint-disable-next-line no-eval
      const conditionEvaluator = eval(field.optionCondition!)
      return field.options.filter((field) =>
        conditionEvaluator({ field, values, declaration })
      )
    }

    return field.options
  }

  const locations = offlineCountryConfig[OFFLINE_LOCATIONS_KEY]
  if (!field.dynamicOptions.dependency) {
    throw new Error(
      `Dependency is undefined, the value should have an entry in the dynamic options object.`
    )
  }
  const dependencyVal = values[field.dynamicOptions.dependency] as string
  if (field.dynamicOptions.jurisdictionType) {
    return generateOptions(
      Object.values(locations).filter((location: ILocation) => {
        return (
          location.jurisdictionType === field.dynamicOptions.jurisdictionType
        )
      }),
      'location'
    )
  } else if (
    offlineCountryConfig &&
    field.dynamicOptions.resource === OFFLINE_LOCATIONS_KEY
  ) {
    if (!dependencyVal) {
      return []
    }
    let partOf: string
    if (dependencyVal === window.config.COUNTRY.toUpperCase()) {
      partOf = 'Location/0'
    } else {
      partOf = `Location/${dependencyVal}`
    }
    return generateOptions(
      Object.values(locations).filter((location: ILocation) => {
        return location.partOf === partOf && location.status === 'active'
      }),
      'location'
    )
  } else if (
    offlineCountryConfig &&
    field.dynamicOptions.resource === OFFLINE_FACILITIES_KEY
  ) {
    const facilities = offlineCountryConfig[OFFLINE_FACILITIES_KEY]
    return generateOptions(Object.values(facilities), 'facility')
  } else {
    let options
    if (!field.dynamicOptions.options) {
      throw new Error(
        `Dependency '${dependencyVal}' has illegal value, the value should have an entry in the dynamic options object.`
      )
    } else {
      options = field.dynamicOptions.options[dependencyVal] || []
    }
    return options
  }
}

interface INested {
  [key: string]: any
}

const getNestedValue = (obj: Record<string, unknown>, key: string) => {
  return key.split('.').reduce((res: INested, k) => res[k] || '', obj)
}

const betweenRange = (range: IRange, check: number) =>
  range.end ? check >= range.start && check <= range.end : check >= range.start

export const getFieldOptionsByValueMapper = (
  field: IDynamicListFormField,
  values: IFormSectionData | IFormData,
  valueMapper: IDynamicValueMapper
) => {
  const dependencyVal = getNestedValue(
    values,
    field.dynamicItems.dependency
  ) as unknown as string

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
  if (!isAValidDateFormat(doB) || !isDateNotInFuture(doB))
    return 'withinTargetdays'
  const todaysDate = new Date()
  const birthDate = new Date(doB)
  const diffInDays = differenceInDays(todaysDate, birthDate)

  const ranges: IRange[] = [
    { start: 0, end: REGISTRATION_TARGET_DAYS, value: 'withinTargetdays' },
    {
      start: REGISTRATION_TARGET_DAYS + 1,
      end: 5 * 365,
      value: 'between46daysTo5yrs'
    },
    { start: 5 * 365 + 1, value: 'after5yrs' }
  ]
  const valueWithinRange = ranges.find((range) =>
    betweenRange(range, diffInDays)
  )
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

export function isDefaultCountry(countryCode: string): boolean {
  return countryCode === window.config.COUNTRY.toUpperCase()
}

interface IVars {
  [key: string]: any
}

function getInputValues(
  inputs: IFieldInput[],
  values: IFormSectionData
): IDynamicValues {
  const variables: IVars = {}
  inputs.forEach((input: IFieldInput) => {
    if (input.type && input.type === 'ENVIRONMENT') {
      variables[input.name] =
        window.config[input.valueField as keyof typeof window.config]
    } else {
      variables[input.name] = values[input.valueField]
    }
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
  offlineCountryConfig: IOfflineData,
  draftData: IFormData,
  draftId: string,
  userDetails: UserDetails | null
): string[] => {
  if (!field.conditionals) {
    return []
  }
  return (
    field.conditionals
      // eslint-disable-next-line no-eval
      .filter((conditional) =>
        evalExpressionInFieldDefinition(
          conditional.expression,
          values,
          offlineCountryConfig,
          draftData,
          draftId,
          userDetails
        )
      )
      .map((conditional: Conditional) => conditional.action)
  )
}

export const evalExpressionInFieldDefinition = (
  expression: string,
  /*
   * These are used in the eval expression
   */
  $form: IFormSectionData,
  $config: IOfflineData,
  $draft: IFormData,
  $draftId: string,
  $user: (UserDetails & { token?: string }) | null
) => {
  // For backwards compatibility
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const values = $form
  const offlineCountryConfig = $config
  const draftData = $draft
  const draftId = $draftId
  const userDetails = $user
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // eslint-disable-next-line no-eval
  return eval(expression)
}

export const getVisibleSectionGroupsBasedOnConditions = (
  section: IFormSection,
  sectionData: IFormSectionData,
  draftData?: IFormData,
  userDetails?: UserDetails | null
): IFormSectionGroup[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const values = sectionData

  // handling all possible group visibility conditionals
  return section.groups.filter((group) => {
    if (!group.conditionals) {
      return true
    }
    return (
      group.conditionals
        // eslint-disable-next-line no-eval
        .filter((conditional) => eval(conditional.expression))
        .map((conditional: Conditional) => conditional.action)
        .includes('hide') !== true
    )
  })
}

export const getVisibleOptions = (
  radioOptions: CRadioOption[],
  draftData: IFormData
): CRadioOption[] => {
  return radioOptions.filter((option) => {
    if (!option.conditionals) {
      return true
    }
    return (
      option.conditionals
        // eslint-disable-next-line no-eval
        .filter((conditional) => eval(conditional.expression))
        .map((conditional: Conditional) => conditional.action)
        .includes('hide') !== true
    )
  })
}

export const getSectionFields = (
  section: IFormSection,
  values?: IFormSectionData,
  draftData?: IFormData
) => {
  let fields: IFormField[] = []
  getVisibleSectionGroupsBasedOnConditions(
    section,
    values || {},
    draftData
  ).forEach((group) => (fields = fields.concat(group.fields)))
  return fields
}

export const hasFormError = (
  fields: IFormField[],
  values: IFormSectionData,
  resource: IOfflineData,
  drafts: IFormData,
  user: UserDetails | null
): boolean => {
  const errors: Errors = getValidationErrorsForForm(
    fields,
    values,
    resource,
    drafts,
    user
  )

  const fieldListWithErrors = Object.values(errors).filter(
    (error) =>
      (error as IFieldErrors).errors.length > 0 ||
      Object.values(error.nestedFields).some(
        (nestedFieldErrors) => nestedFieldErrors.length > 0
      )
  )
  return fieldListWithErrors && fieldListWithErrors.length > 0
}

export const convertToMSISDN = (phone: string, alpha3CountryCode: string) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  const countryCode =
    alpha3CountryCode === 'FAR'
      ? 'ZM'
      : callingCountries[alpha3CountryCode].alpha2

  const phoneUtil = PhoneNumberUtil.getInstance()

  try {
    const number = phoneUtil.parse(phone, countryCode)
    return (
      phoneUtil
        .format(number, PhoneNumberFormat.INTERNATIONAL)
        // libphonenumber adds spaces and dashes to phone numbers,
        // which we do not want to keep for now
        .replace(/[\s-]/g, '')
    )
  } catch (error) {
    return phone
  }
}

export const isRadioGroupWithNestedField = (
  field: IFormField
): field is IRadioGroupWithNestedFieldsFormField => {
  return field.type === RADIO_GROUP_WITH_NESTED_FIELDS
}

const isDynamicField = (field: IFormField): field is IDynamicFormField => {
  return field.type === FIELD_WITH_DYNAMIC_DEFINITIONS
}

const isDateField = (
  field: IFormField,
  sectionData: IFormSectionData
): field is IDateFormField => {
  if (isDynamicField(field)) {
    return getFieldType(field, sectionData) === DATE
  }

  return field.type === DATE
}

export const serializeFieldValue = (
  field: IFormField,
  fieldValue: IFormFieldValue,
  sectionData: IFormSectionData
) => {
  if (isDateField(field, sectionData)) {
    return fieldValue?.toString()
  }

  return fieldValue
}

export const getSelectedRadioOptionWithNestedFields = (
  field: IRadioGroupWithNestedFieldsFormField,
  sectionData: IFormSectionData
): string | undefined => {
  return (sectionData[field.name] as IFormSectionData).value as string
}

export function getSelectedOption(
  value: string,
  options: ISelectOption[]
): ISelectOption | null {
  const selectedOption = options.find((x: ISelectOption) => x.value === value)
  if (selectedOption) {
    return selectedOption
  }

  return null
}

export function isFieldButton(field: IFormField): field is IButtonFormField {
  return field.type === BUTTON
}

function isFieldIDReader(field: IFormField): field is IDReaderFormField {
  return field.type === ID_READER
}

export function isReaderQR(reader: ReaderType): reader is QRReaderType {
  return reader.type === 'QR'
}

export function isReaderLinkButton(
  reader: ReaderType
): reader is ILinkButtonFormField {
  return reader.type === LINK_BUTTON
}

export function isFieldHttp(field: IFormField): field is IHttpFormField {
  return field.type === HTTP
}

export function isFieldLinkButton(
  field: IFormField
): field is ILinkButtonFormField {
  return field.type === LINK_BUTTON
}

function isInitialValueDependencyInfo(
  value: InitialValue
): value is DependencyInfo {
  return typeof value === 'object' && value !== null && 'dependsOn' in value
}

export function getDependentFields(
  fields: IFormField[],
  fieldName: string
): IFormField[] {
  return fields.filter(
    ({ initialValue }) =>
      initialValue &&
      isInitialValueDependencyInfo(initialValue) &&
      initialValue.dependsOn.includes(fieldName)
  )
}

export function handleUnsupportedIcon(iconName?: string) {
  if (iconName && iconName in SupportedIcons) {
    return iconName as keyof typeof SupportedIcons
  }
  return null
}

export function handleInitialValue(
  initialValue: InitialValue,
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
): IFormFieldValue {
  return isInitialValueDependencyInfo(initialValue)
    ? (evalExpressionInFieldDefinition(
        initialValue.expression,
        ...evalParams
      ) as IFormFieldValue)
    : initialValue
}
