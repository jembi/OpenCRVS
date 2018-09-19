import { Validation } from '../utils/validate'
import { FormattedMessage } from 'react-intl'
import {
  ISelectOption as SelectComponentOption,
  IRadioOption as RadioComponentOption,
  ICheckboxOption as CheckboxComponentOption
} from '@opencrvs/components/lib/forms'

export const TEXT = 'TEXT'
export const RADIO_GROUP = 'RADIO_GROUP'
export const CHECKBOX_GROUP = 'CHECKBOX_GROUP'
export const DATE = 'DATE'
export const TEXTAREA = 'TEXTAREA'
export const SUBSECTION = 'SUBSECTION'
export const DOCUMENTS = 'DOCUMENTS'
export const SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS'
export const SELECT_WITH_DYNAMIC_OPTIONS = 'SELECT_WITH_DYNAMIC_OPTIONS'

export interface ISelectOption {
  value: SelectComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}
export interface IRadioOption {
  value: RadioComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}
export interface ICheckboxOption {
  value: CheckboxComponentOption['value']
  label: FormattedMessage.MessageDescriptor
}

export type IFormFieldValue = string | string[] | boolean

export interface IFormFieldBase {
  name: string
  type: IFormField['type']
  label: FormattedMessage.MessageDescriptor
  validate: Validation[]
  required?: boolean
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
  disabled?: boolean
  initialValue?: IFormFieldValue
  conditionals?: IConditional[]
  description?: FormattedMessage.MessageDescriptor
}

export interface ISelectFormFieldWithOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_OPTIONS
  options: ISelectOption[]
}
export interface ISelectFormFieldWithDynamicOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_DYNAMIC_OPTIONS
  dynamicOptions: string
}

export interface IRadioGroupFormField extends IFormFieldBase {
  type: typeof RADIO_GROUP
  options: IRadioOption[]
}

export interface ITextFormField extends IFormFieldBase {
  type: typeof TEXT
}
export interface ICheckboxGroupFormField extends IFormFieldBase {
  type: typeof CHECKBOX_GROUP
  options: ICheckboxOption[]
}
export interface IDateFormField extends IFormFieldBase {
  type: typeof DATE
}
export interface ITextareaFormField extends IFormFieldBase {
  type: typeof TEXTAREA
}
export interface ISubsectionFormField extends IFormFieldBase {
  type: typeof SUBSECTION
}
export interface IDocumentsFormField extends IFormFieldBase {
  type: typeof DOCUMENTS
}

export type IFormField =
  | ITextFormField
  | ISelectFormFieldWithOptions
  | ISelectFormFieldWithDynamicOptions
  | IRadioGroupFormField
  | ICheckboxGroupFormField
  | IDateFormField
  | ITextareaFormField
  | ISubsectionFormField
  | IDocumentsFormField

export interface IConditional {
  action: string
  expression: string
}

export interface IConditionals {
  fathersDetailsExist: IConditional
  permanentAddressSameAsMother: IConditional
  addressSameAsMother: IConditional
  countryPermanent: IConditional
  statePermanent: IConditional
  districtPermanent: IConditional
  addressLine4Permanent: IConditional
  addressLine3Options1Permanent: IConditional
  country: IConditional
  state: IConditional
  district: IConditional
  addressLine4: IConditional
  addressLine3Options1: IConditional
}

export type ViewType = 'form' | 'preview'

export interface IFormSection {
  id: string
  viewType: ViewType
  name: FormattedMessage.MessageDescriptor
  title: FormattedMessage.MessageDescriptor
  fields: IFormField[]
}

export interface IForm {
  sections: IFormSection[]
}

export interface Ii18nSelectOption {
  value: string
  label: string
}

export interface Ii18nFormFieldBase {
  name: string
  type: string
  label: string
  description?: string
  validate: Validation[]
  required?: boolean
  prefix?: React.ComponentClass<any> | string
  postfix?: React.ComponentClass<any> | string
  disabled?: boolean
  conditionals?: IConditional[]
}

export interface Ii18nSelectFormField extends Ii18nFormFieldBase {
  type: typeof SELECT_WITH_OPTIONS
  options: SelectComponentOption[]
}

export interface Ii18nRadioGroupFormField extends Ii18nFormFieldBase {
  type: typeof RADIO_GROUP
  options: RadioComponentOption[]
}

export interface Ii18nTextFormField extends Ii18nFormFieldBase {
  type: typeof TEXT
}
export interface Ii18nCheckboxGroupFormField extends Ii18nFormFieldBase {
  type: typeof CHECKBOX_GROUP
  options: CheckboxComponentOption[]
}
export interface Ii18nDateFormField extends Ii18nFormFieldBase {
  type: typeof DATE
}
export interface Ii18nTextareaFormField extends Ii18nFormFieldBase {
  type: typeof TEXTAREA
}
export interface Ii18nSubsectionFormField extends Ii18nFormFieldBase {
  type: typeof SUBSECTION
}
export interface Ii18nDocumentsFormField extends Ii18nFormFieldBase {
  type: typeof DOCUMENTS
}

export type Ii18nFormField =
  | Ii18nTextFormField
  | Ii18nSelectFormField
  | Ii18nRadioGroupFormField
  | Ii18nCheckboxGroupFormField
  | Ii18nDateFormField
  | Ii18nTextareaFormField
  | Ii18nSubsectionFormField
  | Ii18nDocumentsFormField

export interface IFormSectionData {
  [key: string]: IFormFieldValue
}

export interface IFormData {
  [key: string]: IFormSectionData
}
