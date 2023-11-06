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
import { IDeclaration } from '@client/declarations'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { TDocumentDefinitions, TFontFamilyTypes } from 'pdfmake/interfaces'
import { IOfflineData } from '@client/offline/reducer'
import { IAvailableCountries } from '@client/views/PrintCertificate/utils'
import { UserDetails } from '@client/utils/userUtils'

export type OptionalData = IAvailableCountries[]

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: Record<string, TFontFamilyTypes>
  vfs?: { [file: string]: string }
  transformers?: IFieldTransformer[]
}
export interface ISVGTemplate {
  id: string
  definition: string
  hash?: string
  fonts?: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs?: { [file: string]: string }
  transformers?: IFieldTransformer[]
  fileName: string
  lastModifiedDate: string
}

export type TransformerPayload =
  | IIntLabelPayload
  | IConditionExecutorPayload
  | IInformantNamePayload
  | IFeildValuePayload
  | IDateFeildValuePayload
  | IFormattedFeildValuePayload
  | INumberFeildConversionPayload
  | IOfflineAddressPayload
  | ILanguagePayload
  | ILocationPayload
  | IPersonIdentifierValuePayload
  | IArithmeticOperationPayload

export type Condition = IInformantNameCondition | IOfflineAddressCondition

interface IFieldTransformer {
  field: string
  operation: string
  parameters?: TransformerPayload
  valueIndex?: number // this will allow us to pick a specific char from the whole result
}

export type TemplateTransformerData = {
  declaration: IDeclaration
  userDetails: UserDetails
  resource: IOfflineData
}

export interface IFunctionTransformer {
  [transformerFunction: string]: (
    data: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload,
    optionalData?: OptionalData
  ) => string | null
}
export interface IIntLabelPayload {
  messageDescriptor: MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

export enum ConditionOperation {
  MATCH = 'MATCH',
  DOES_NOT_MATCH = 'DOES_NOT_MATCH',
  VALUE_EXISTS = 'VALUE_EXISTS',
  VALUE_DOES_NOT_EXISTS = 'VALUE_DOES_NOT_EXISTS'
}
interface ICondition {
  key: string
  operation?: ConditionOperation
  values: string[]
}

export interface IInformantNameCondition {
  condition?: ICondition
  key: {
    [event: string]: string // data key: child || deceased
  }
  format: {
    [language: string]: string[] // corresponding field names
  }
}

export interface IInformantNamePayload {
  conditions: IInformantNameCondition[]
  language?: string
  allCapital?: boolean
}

export interface IFeildValuePayload {
  valueKey: string // ex: child.dob
  condition?: string // ex: "(!draftData || !draftData.informant || draftData.informant.relationship == \"OTHER\")"
  messageDescriptors?: {
    messageDescriptor: MessageDescriptor
    matchValue: string
  }[]
}

export interface IDateFeildValuePayload {
  key?: {
    [event: string]: string // data key: child.dob || deceased.dod
  }
  format: string
  language?: string
  momentLocale?: {
    [language: string]: string // bn: 'locale/bn'
  }
}

export interface IFormattedFeildValuePayload {
  formattedKeys: string // ex: {child.firstName}, {child.lastName}
}

export interface INumberFeildConversionPayload {
  valueKey: string // ex: child.dob
  conversionMap: { [key: string]: string } // { 0: '০', 1: '১'}
}

export interface IOfflineAddressCondition {
  condition?: ICondition
  addressType: string
  addressKey: string
  addresses: {
    countryCode: string
    localAddress: string
    internationalAddress?: string
  }
}

export interface IOfflineAddressPayload {
  language: string
  conditions: IOfflineAddressCondition[]
}

export interface ILanguagePayload {
  language: string
}

export interface ILocationPayload {
  language?: string
  jurisdictionType: string
}

export interface IPersonIdentifierValuePayload {
  idTypeKey: string // ex: mother.iDType
  idTypeValue: string // ex: NATIONAL_ID
  idValueKey: string // ex: mother.iD
}

// Based on the need, add more here
export type ExecutorKey = 'CURRENT_DATE'

export interface IEventWiseKey {
  [event: string]: string // {birth: child.dob}
}
// Based on the need, add more here
type ConditionType = 'COMPARE_DATE_IN_DAYS'

export interface IConditionExecutorPayload {
  fromKey: IEventWiseKey | ExecutorKey
  toKey: IEventWiseKey | ExecutorKey
  conditions: {
    type: ConditionType
    minDiff: number
    maxDiff: number
    output: IIntLabelPayload // based on the we can add more type here
  }[]
}

type ArithmeticOperationType =
  | 'ADDITION'
  | 'SUBTRACTION'
  | 'DIVISION'
  | 'MULTIPLICATION'

export interface IArithmeticOperationPayload {
  operationType: ArithmeticOperationType
  leftValueKey: string
  rightValueKey: string
}
