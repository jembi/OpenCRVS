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

const FieldReference = z.string()

const Matcher = z.object({
  fieldId: z.string(),
  options: z
    .object({
      boost: z.number().optional()
    })
    .optional()
    .default({})
})

const FuzzyMatcher = Matcher.extend({
  type: z.literal('fuzzy'),
  options: z
    .object({
      /**
       * Names of length 3 or less characters = 0 edits allowed
       * Names of length 4 - 6 characters = 1 edit allowed
       * Names of length >7 characters = 2 edits allowed
       */
      fuzziness: z
        .union([z.string(), z.number()])
        .optional()
        .default('AUTO:4,7'),
      boost: z.number().optional().default(1)
    })
    .optional()
    .default({})
})

const StrictMatcher = Matcher.extend({
  type: z.literal('strict'),
  options: z
    .object({
      boost: z.number().optional().default(1)
    })
    .optional()
    .default({})
})

const DateRangeMatcher = Matcher.extend({
  type: z.literal('dateRange'),
  options: z.object({
    days: z.number(),
    origin: FieldReference,
    boost: z.number().optional().default(1)
  })
})

const DateDistanceMatcher = Matcher.extend({
  type: z.literal('dateDistance'),
  options: z.object({
    days: z.number(),
    origin: FieldReference,
    boost: z.number().optional().default(1)
  })
})

export interface AndInput {
  type: 'and'
  clauses: ClauseInput[]
}

export interface AndOutput {
  type: 'and'
  clauses: ClauseOutput[]
}

export interface OrInput {
  type: 'or'
  clauses: ClauseInput[]
}

export interface OrOutput {
  type: 'or'
  clauses: ClauseOutput[]
}

const And = z.object({
  type: z.literal('and'),
  clauses: z.lazy(() => Clause.array())
})

const Or = z.object({
  type: z.literal('or'),
  clauses: z.lazy(() => Clause.array())
})

export type ClauseInput =
  | AndInput
  | OrInput
  | z.input<typeof FuzzyMatcher>
  | z.input<typeof StrictMatcher>
  | z.input<typeof DateRangeMatcher>
  | z.input<typeof DateDistanceMatcher>

export type ClauseOutput =
  | AndOutput
  | OrOutput
  | z.output<typeof FuzzyMatcher>
  | z.output<typeof StrictMatcher>
  | z.output<typeof DateRangeMatcher>
  | z.output<typeof DateDistanceMatcher>

/**
 * Defines a deduplication clause. Clauses are either matcher clauses or logical clauses. Logical clauses (and, or) are used to combine multiple clauses.
 * Since the definiton is recursive, we use z.lazy to define the schema.
 * Zod supports recursive schemas, but needs help with Input and Output types.
 *
 * Default assumption is that the ZodType is the input. Markers use default values, so we need to explicitly define output type, too.
 *
 */
export const Clause: z.ZodType<ClauseOutput, z.ZodTypeDef, ClauseInput> =
  z.lazy(() =>
    z.discriminatedUnion('type', [
      And,
      Or,
      FuzzyMatcher,
      StrictMatcher,
      DateRangeMatcher,
      DateDistanceMatcher
    ])
  )

export type Clause = z.infer<typeof Clause>

export const DeduplicationConfig = z.object({
  id: z.string(),
  label: TranslationConfig,
  query: Clause
})

export type DeduplicationConfig = z.infer<typeof DeduplicationConfig>
