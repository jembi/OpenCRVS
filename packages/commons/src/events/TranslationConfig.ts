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

export type TranslationConfig = {
  id: string
  defaultMessage: string
  description: string
}

export type MessageDescriptorZod = {
  id: z.ZodString
  defaultMessage: z.ZodString
  description: z.ZodString
}

/*
 * The only purpose of this explicit type definition is to reduce the size of
 * packages/commons/build/dist/common/events/EventConfig.d.ts
 * Doing this makes it go from 60705 to 40250
 */
type ExplicitTypeToReduceDeclarationSize = z.ZodObject<
  MessageDescriptorZod,
  'strip',
  z.ZodTypeAny,
  TranslationConfig
>

export const TranslationConfig: ExplicitTypeToReduceDeclarationSize = z.object({
  id: z
    .string()
    .describe(
      'The identifier of the translation referred in translation CSV files'
    ),
  defaultMessage: z.string().describe('Default translation message'),
  description: z
    .string()
    .describe(
      'Describe the translation for a translator to be able to identify it.'
    )
})
