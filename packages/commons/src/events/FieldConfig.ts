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
import { z } from 'zod'
import { TranslationConfig } from './TranslationConfig'
import { Conditional } from '../conditionals/conditionals'
import {
  DateFieldValue,
  FileFieldValue,
  ParagraphFieldValue,
  TextFieldValue
} from './FieldValue'

export const ConditionalTypes = {
  SHOW: 'SHOW',
  ENABLE: 'ENABLE'
} as const

export type ConditionalTypes =
  (typeof ConditionalTypes)[keyof typeof ConditionalTypes]

const FieldId = z.string()

const ShowConditional = z.object({
  type: z.literal(ConditionalTypes.SHOW),
  conditional: Conditional()
})

const EnableConditional = z.object({
  type: z.literal(ConditionalTypes.ENABLE),
  conditional: Conditional()
})

const FieldConditional = z.discriminatedUnion('type', [
  ShowConditional,
  EnableConditional
])

const BaseField = z.object({
  id: FieldId,
  conditionals: z.array(FieldConditional).optional().default([]),
  initialValue: z
    .union([
      z.string(),
      z.object({
        dependsOn: z.array(FieldId).default([]),
        expression: z.string()
      })
    ])
    .optional(),
  required: z.boolean().default(false).optional(),
  disabled: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),
  placeholder: TranslationConfig.optional(),
  validation: z
    .array(
      z.object({
        validator: Conditional(),
        message: TranslationConfig
      })
    )
    .default([])
    .optional(),
  dependsOn: z.array(FieldId).default([]).optional(),
  label: TranslationConfig
})

export type BaseField = z.infer<typeof BaseField>

export const FieldType = {
  TEXT: 'TEXT',
  DATE: 'DATE',
  PARAGRAPH: 'PARAGRAPH',
  RADIO_GROUP: 'RADIO_GROUP',
  FILE: 'FILE',
  HIDDEN: 'HIDDEN'
} as const

export const fieldTypes = Object.values(FieldType)
export type FieldType = (typeof fieldTypes)[number]

export type FieldValueByType = {
  [FieldType.TEXT]: TextFieldValue
  [FieldType.DATE]: DateFieldValue
  [FieldType.PARAGRAPH]: ParagraphFieldValue
  [FieldType.RADIO_GROUP]: string
  [FieldType.FILE]: FileFieldValue
}

const TextField = BaseField.extend({
  type: z.literal(FieldType.TEXT),
  options: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text')
    })
    .default({})
    .optional()
}).describe('Text input')

const DateField = BaseField.extend({
  type: z.literal(FieldType.DATE),
  options: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the date input'
      ).optional()
    })
    .optional()
}).describe('A single date input (dd-mm-YYYY)')

const Paragraph = BaseField.extend({
  type: z.literal(FieldType.PARAGRAPH),
  options: z
    .object({
      fontVariant: z.literal('reg16').optional()
    })
    .default({})
}).describe('A read-only HTML <p> paragraph')

const File = BaseField.extend({
  type: z.literal(FieldType.FILE)
}).describe('File upload')

const RadioGroup = BaseField.extend({
  type: z.literal(FieldType.RADIO_GROUP),
  options: z.array(
    z.object({
      value: z.string().describe('The value of the option'),
      label: z.string().describe('The label of the option')
    })
  )
}).describe('Grouped radio options')

export const FieldConfig = z.discriminatedUnion('type', [
  TextField,
  DateField,
  Paragraph,
  RadioGroup,
  File
])

export type FieldConfig = z.infer<typeof FieldConfig>
export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
