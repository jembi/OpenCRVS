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
import { Conditional } from '../conditionals/conditionals'
import { FormConfig } from './FormConfig'
import { TranslationConfig } from './TranslationConfig'

export const ActionConfigBase = z.object({
  label: TranslationConfig,
  allowedWhen: Conditional().optional(),
  draft: z.boolean().optional(),
  forms: z.array(FormConfig)
})

/**
 * Actions recognized by the system
 */
export const ActionType = {
  CREATE: 'CREATE',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  REGISTER: 'REGISTER',
  VALIDATE: 'VALIDATE',
  CORRECT: 'CORRECT',
  DETECT_DUPLICATE: 'DETECT_DUPLICATE',
  NOTIFY: 'NOTIFY',
  DECLARE: 'DECLARE',
  DELETE: 'DELETE',
  PRINT_CERTIFICATE: 'PRINT_CERTIFICATE',
  CUSTOM: 'CUSTOM'
} as const

export const ActionTypeSchema = z.nativeEnum(ActionType)
export type ActionType = z.infer<typeof ActionTypeSchema>

const CreateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const DeclareConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const RegisterConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER)
  })
)

const DeleteConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DELETE)
  })
)

const PrintCertificateActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE)
  })
)

const CustomConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ActionConfig = z.discriminatedUnion('type', [
  CreateConfig,
  DeclareConfig,
  ValidateConfig,
  RegisterConfig,
  DeleteConfig,
  PrintCertificateActionConfig,
  CustomConfig
])

export type ActionConfig = z.infer<typeof ActionConfig>
