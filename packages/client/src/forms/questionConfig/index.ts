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
import {
  IDynamicOptions,
  IMapping,
  ISerializedForm,
  IValidatorDescriptor,
  SerializedFormField
} from '@client/forms'
import { FieldPosition } from '@client/forms/configuration'
import {
  transformUIConfiguredConditionalsToDefaultFormat,
  getDefaultLanguageMessage
} from '@client/forms/configuration/customUtils'
import { getSection } from '@client/forms/configuration/defaultUtils'
import { fieldIdentifiersToQuestionConfig } from '@client/forms/questionConfig/transformers'
import {
  CustomFieldType,
  CustomSelectOption,
  Event
} from '@client/utils/gateway'
import { MessageDescriptor } from 'react-intl'
import { Message } from 'typescript-react-intl'

export * from './transformers'

export interface IMessage {
  lang: string
  descriptor: Message
}
export interface IConditionalConfig {
  fieldId: string
  regexp: string
}

export interface ICustomSelectOption {
  label: IMessage[]
  value: string
}

interface IBaseQuestionConfig {
  fieldId: string
  precedingFieldId: string
}

export interface IFieldIdentifiers {
  sectionIndex: number
  groupIndex: number
  fieldIndex: number
}

export interface IDefaultQuestionConfig extends IBaseQuestionConfig {
  required?: boolean
  enabled: string
  ignoreBottomMargin?: boolean
  validateEmpty?: boolean
  identifiers: IFieldIdentifiers
  conditionals?: IConditionalConfig[]
  optionCondition?: string
  validator?: IValidatorDescriptor[]
  label?: Message
  helperText?: Message
  hideHeader?: boolean
  hideInPreview?: boolean
  options?: Array<
    Omit<CustomSelectOption, 'label'> & { label: MessageDescriptor }
  >
}

export interface ICustomQuestionConfig extends IBaseQuestionConfig {
  custom: boolean
  label: IMessage[]
  required?: boolean
  placeholder?: IMessage[]
  description?: IMessage[]
  helperText?: IMessage[]
  unit?: IMessage[]
  tooltip?: IMessage[]
  errorMessage?: IMessage[]
  validateEmpty?: boolean
  maxLength?: number
  ignoreBottomMargin?: boolean
  inputWidth?: number
  initialValue?: string
  fieldName: string
  extraValue?: string
  fieldType: CustomFieldType
  conditionals?: IConditionalConfig[]
  options?: ICustomSelectOption[]
  datasetId?: string
  validator?: IValidatorDescriptor[]
  mapping?: IMapping
  hideInPreview?: boolean
  optionCondition?: string
  dynamicOptions?: IDynamicOptions
  hideHeader?: boolean
  previewGroup?: string
  disabled?: boolean
}

export type IQuestionConfig = IDefaultQuestionConfig | ICustomQuestionConfig

export function isDefaultQuestionConfig(
  questionConfig: IQuestionConfig
): questionConfig is IDefaultQuestionConfig {
  return !('custom' in questionConfig)
}

export function getIdentifiersFromFieldId(fieldId: string) {
  const splitIds = fieldId.split('.')
  return {
    event: splitIds[0] as Event,
    sectionId: splitIds[1],
    groupId: splitIds[2],
    fieldName: splitIds[3]
  }
}

function hasQuestionAlteredOptions(question: IDefaultQuestionConfig) {
  return question.options?.length
}
export function getCustomizedDefaultField(
  question: IDefaultQuestionConfig,
  defaultForm: ISerializedForm
): SerializedFormField {
  const {
    identifiers: { sectionIndex, groupIndex, fieldIndex },
    conditionals,
    ...rest
  } = question

  const serializedField =
    defaultForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]
  const customizedDefaultField = {
    ...serializedField,
    ...rest
  }
  if (conditionals) {
    customizedDefaultField.conditionals =
      transformUIConfiguredConditionalsToDefaultFormat(conditionals)
  }

  if (
    serializedField.type === 'SELECT_WITH_OPTIONS' &&
    hasQuestionAlteredOptions(question)
  ) {
    customizedDefaultField.options =
      question.options?.map((option) => {
        return {
          ...option,
          label: Array.isArray(option.label)
            ? (getDefaultLanguageMessage(option.label) as MessageDescriptor)
            : option.label
        }
      }) || []
  }
  return customizedDefaultField
}

export function getSectionIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, sectionId } = getIdentifiersFromFieldId(fieldId)

  const sectionIndex = form.sections.findIndex(({ id }) => id === sectionId)
  return {
    event,
    sectionIndex
  }
}

export function getGroupIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, groupId } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex } = getSectionIdentifiers(fieldId, form)

  const groups = form.sections[sectionIndex].groups

  const groupIndex = groups.findIndex(({ id }) => id === groupId)

  return {
    event,
    sectionIndex,
    groupIndex
  }
}

export function getFieldIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, fieldName } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex, groupIndex } = getGroupIdentifiers(fieldId, form)

  const fields = form.sections[sectionIndex].groups[groupIndex].fields

  const fieldIndex = fields.findIndex(({ name }) => name === fieldName)

  return {
    event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}

export function orderByPosition(questions: IQuestionConfig[]) {
  const questionsMap = questions.reduce<Record<string, IQuestionConfig>>(
    (accum, question) => ({ ...accum, [question.fieldId]: question }),
    {}
  )
  const previouslyVisited: Record<string, boolean> = {}

  function dfs(question: IQuestionConfig): IQuestionConfig[] {
    if (previouslyVisited[question.fieldId]) {
      return []
    }
    previouslyVisited[question.fieldId] = true
    if (question.precedingFieldId === FieldPosition.TOP) {
      return [question]
    }
    const precedingQuestions = dfs(questionsMap[question.precedingFieldId])
    return [...precedingQuestions, question]
  }

  return questions.reduce<IQuestionConfig[]>(
    (orderedQuestions, question) => [...orderedQuestions, ...dfs(question)],
    []
  )
}

export function getConfiguredQuestions(
  event: Event,
  defaultForm: ISerializedForm,
  questions: IQuestionConfig[]
) {
  const defaultQuestions = questions.filter(isDefaultQuestionConfig)

  const customQuestions = questions.filter(
    (question): question is ICustomQuestionConfig =>
      !isDefaultQuestionConfig(question)
  )

  const toQuestionConfig = (identifiers: IFieldIdentifiers) => {
    const questionConfig = fieldIdentifiersToQuestionConfig(
      event,
      defaultForm,
      identifiers
    )
    const previouslyCustomizedQuestionConfig = defaultQuestions.find(
      ({ fieldId }) => fieldId === questionConfig.fieldId
    )
    return previouslyCustomizedQuestionConfig ?? questionConfig
  }

  return defaultForm.sections
    .map((section, sectionIndex) =>
      section.groups.flatMap((group, groupIndex) =>
        group.fields.map((_, fieldIndex) => ({
          sectionIndex,
          groupIndex,
          fieldIndex
        }))
      )
    )
    .map((sectionFieldIdentifiers) => {
      if (sectionFieldIdentifiers.length === 0) return []
      const section = getSection(sectionFieldIdentifiers[0], defaultForm)
      return [
        ...sectionFieldIdentifiers.map(toQuestionConfig),
        ...customQuestions.filter((question) =>
          question.fieldId.startsWith(`${event}.${section.id}`)
        )
      ]
    })
    .map(orderByPosition)
}
