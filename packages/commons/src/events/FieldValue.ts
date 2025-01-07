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
import { FieldType } from './FieldConfig'

const TextFieldValue = z.string()
export type TextFieldValue = z.infer<typeof TextFieldValue>

const DateFieldValue = z.string().nullable()
export type DateFieldValue = z.infer<typeof DateFieldValue>

const ParagraphFieldValue = z.string()
export type ParagraphFieldValue = z.infer<typeof ParagraphFieldValue>

export const FileFieldValue = z
  .object({
    filename: z.string(),
    originalFilename: z.string(),
    type: z.string()
  })
  .nullable()

export type FileFieldValue = z.infer<typeof FileFieldValue>

const RadioGroupFieldValue = z.string()
export type RadioGroupFieldValue = z.infer<typeof RadioGroupFieldValue>

export type FieldTypeToFieldValue<T extends FieldType> = T extends 'TEXT'
  ? TextFieldValue
  : T extends 'PARAGRAPH'
  ? ParagraphFieldValue
  : T extends 'DATE'
  ? DateFieldValue
  : T extends 'FILE'
  ? FileFieldValue
  : T extends 'RADIO_GROUP'
  ? RadioGroupFieldValue
  : never

export const FieldValue = z.union([
  TextFieldValue,
  DateFieldValue,
  ParagraphFieldValue,
  FileFieldValue,
  RadioGroupFieldValue
])

export type FieldValue = z.infer<typeof FieldValue>
