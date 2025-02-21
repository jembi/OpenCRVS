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

export const TextValue = z.string()
export const RequiredTextValue = TextValue.min(1)

export const DateValue = z
  .string()
  .date()
  .describe('Date in the format YYYY-MM-DD')

export const EmailValue = z.string().email()

export const FileFieldValue = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  type: z.string()
})

export type FileFieldValue = z.infer<typeof FileFieldValue>

const AdminStructure = z.object({
  country: z.string(),
  province: z.string(),
  district: z.string()
})

const UrbanAddress = AdminStructure.extend({
  urbanOrRural: z.literal('URBAN'),
  town: z.string().optional(),
  residentialArea: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  zipCode: z.string().optional()
})

const RuralAddress = AdminStructure.extend({
  urbanOrRural: z.literal('RURAL'),
  village: z.string().optional()
})

export const AddressFieldValue = z.discriminatedUnion('urbanOrRural', [
  UrbanAddress,
  RuralAddress
])

export type AddressFieldValue = z.infer<typeof AddressFieldValue>
export const FileFieldValueWithOption = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  type: z.string(),
  option: z.string()
})

export type FileFieldValueWithOption = z.infer<typeof FileFieldValueWithOption>

export const FileFieldWithOptionValue = z.array(FileFieldValueWithOption)

export type FileFieldWithOptionValue = z.infer<typeof FileFieldWithOptionValue>

export const CheckboxFieldValue = z.boolean()
export type CheckboxFieldValue = z.infer<typeof CheckboxFieldValue>
export const NumberFieldValue = z.number()
export type NumberFieldValue = z.infer<typeof NumberFieldValue>

export const FieldValue = z.union([
  TextValue,
  DateValue,
  FileFieldValue,
  FileFieldWithOptionValue,
  CheckboxFieldValue,
  NumberFieldValue,
  UrbanAddress,
  RuralAddress
])

export type FieldValue = z.infer<typeof FieldValue>

/**
 * NOTE: This is an exception. We need schema as a type in order to generate schema dynamically.
 * */
export type FieldValueSchema =
  | typeof FileFieldValue
  | typeof FileFieldWithOptionValue
  | typeof CheckboxFieldValue
  | typeof AddressFieldValue
  | typeof NumberFieldValue
  | z.ZodString
  | z.ZodBoolean

export type OptionalFieldValueSchema = z.ZodOptional<FieldValueSchema>
