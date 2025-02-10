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

import { ActionType } from '../events/ActionType'
import { ITokenPayload } from '../authentication'
import { ActionFormData } from '../events/ActionDocument'
import { EventDocument } from '../events/EventDocument'

import { PartialSchema as AjvJSONSchemaType } from 'ajv/dist/types/json-schema'

/** @knipignore */
export type JSONSchema = {
  readonly __nominal__type: 'JSONSchema'
}

export function defineConditional(schema: any) {
  return schema as JSONSchema
}

export type ConditionalParameters = { $now: string } & (
  | {
      $event: EventDocument
    }
  | {
      $event: EventDocument
      $form: ActionFormData
      $user: ITokenPayload
    }
  | {
      $form: ActionFormData
    }
)

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type AjvJSONSchema = AjvJSONSchemaType<
  UnionToIntersection<ConditionalParameters>
>

/**
 * Returns an empty JSON Schema object, which is treated as always valid.
 *
 * @returns {AjvJSONSchema} An empty schema object `{}` that always evaluates to true.
 */
export function alwaysTrue(): AjvJSONSchema {
  return {}
}

export function and(...conditions: AjvJSONSchema[]): AjvJSONSchema {
  return {
    type: 'object',
    allOf: conditions,
    required: []
  }
}

export function or(...conditions: AjvJSONSchema[]): AjvJSONSchema {
  return {
    type: 'object',
    anyOf: conditions,
    required: []
  }
}

export function not(condition: AjvJSONSchema): AjvJSONSchema {
  return {
    type: 'object',
    not: condition,
    required: []
  }
}

export function userHasScope(scope: string): AjvJSONSchema {
  return {
    type: 'object',
    properties: {
      $user: {
        type: 'object',
        required: ['scope'],
        properties: {
          scope: {
            contains: {
              type: 'string',
              const: scope
            }
          }
        }
      }
    },
    required: ['$user']
  }
}

export function eventHasAction(type: ActionType): AjvJSONSchema {
  return {
    type: 'object',
    properties: {
      $event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: {
                  const: type
                },
                draft: {
                  type: 'boolean'
                }
              },
              required: ['type'],
              not: {
                properties: {
                  draft: {
                    const: true
                  }
                }
              }
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['$event']
  }
}

type DateBoundary = {
  now: () => FieldAPI
  date: (
    // date should be in yyyy-mm-dd format
    date: `${number}${number}${number}${number}-${number}${number}-${number}${number}`
  ) => FieldAPI
  days: (days: number) => {
    inPast: () => FieldAPI
    inFuture: () => FieldAPI
  }
}

export type FieldAPI = {
  inArray: (values: string[]) => FieldAPI
  /**
   * Checks if the date is within `days` days in the past from now.
   */
  isBefore: () => DateBoundary
  isAfter: () => DateBoundary
  isEqualTo: (value: string | boolean) => FieldAPI
  isUndefined: () => FieldAPI
  not: {
    isBefore: () => DateBoundary
    isAfter: () => DateBoundary
    inArray: (values: string[]) => FieldAPI
    equalTo: (value: string | boolean) => FieldAPI
  }
  /**
   * joins multiple conditions with OR instead of AND.
   * @example field('fieldId').or((field) => field.isUndefined().not.inArray(['value1', 'value2'])).apply()
   */
  or: (callback: (field: FieldAPI) => FieldAPI) => FieldAPI
  /**
   *  @private
   *  @returns array of conditions. Used internally by methods that consolidate multiple conditions into one.
   */
  _apply: () => AjvJSONSchema[]
  /**
   * @public
   * @returns single object for consolidated conditions
   */
  apply: () => JSONSchema
}

/**
 * Generate conditional rules for a field.
 * @param fieldId - The field ID conditions are being applied to
 *
 * @returns @see FieldAPI
 */
export function field(fieldId: string) {
  const conditions: AjvJSONSchema[] = []

  const addCondition = (rule: AjvJSONSchema) => {
    conditions.push(rule)
    return api
  }

  const getDateFromNow = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

  const getDateRange = (
    date: string,
    clause: 'formatMinimum' | 'formatMaximum'
  ) => ({
    type: 'object',
    properties: {
      $form: {
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'string',
            format: 'date',
            [clause]: date
          }
        },
        required: [fieldId]
      }
    },
    required: ['$form']
  })

  const getNegativeDateRange = (
    date: string,
    clause: 'formatMinimum' | 'formatMaximum'
  ) => ({
    type: 'object',
    properties: {
      $form: {
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'string',
            not: {
              format: 'date',
              [clause]: date
            }
          }
        },
        required: [fieldId]
      }
    },
    required: ['$form']
  })

  const api: FieldAPI = {
    isAfter: () => ({
      days: (days: number) => ({
        inPast: () =>
          addCondition(getDateRange(getDateFromNow(days), 'formatMinimum')),
        inFuture: () =>
          addCondition(getDateRange(getDateFromNow(-days), 'formatMinimum'))
      }),
      date: (date: string) => addCondition(getDateRange(date, 'formatMinimum')),
      now: () => addCondition(getDateRange(getDateFromNow(0), 'formatMinimum'))
    }),
    isBefore: () => ({
      days: (days: number) => ({
        inPast: () =>
          addCondition(getDateRange(getDateFromNow(days), 'formatMaximum')),
        inFuture: () =>
          addCondition(getDateRange(getDateFromNow(-days), 'formatMaximum'))
      }),
      date: (date: string) => addCondition(getDateRange(date, 'formatMaximum')),
      now: () => addCondition(getDateRange(getDateFromNow(0), 'formatMaximum'))
    }),
    isEqualTo: (value: string | boolean) =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                oneOf: [
                  { type: 'string', const: value },
                  { type: 'boolean', const: value }
                ],
                const: value
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    isUndefined: () =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                enum: ['undefined']
              }
            },
            not: {
              required: [fieldId]
            }
          }
        },
        required: ['$form']
      }),
    inArray: (values: string[]) =>
      addCondition({
        type: 'object',
        properties: {
          $form: {
            type: 'object',
            properties: {
              [fieldId]: {
                type: 'string',
                enum: values
              }
            },
            required: [fieldId]
          }
        },
        required: ['$form']
      }),
    not: {
      isAfter: () => ({
        days: (days: number) => ({
          inPast: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(days), 'formatMinimum')
            ),
          inFuture: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(-days), 'formatMinimum')
            )
        }),
        date: (date: string) =>
          addCondition(getNegativeDateRange(date, 'formatMinimum')),
        now: () =>
          addCondition(getNegativeDateRange(getDateFromNow(0), 'formatMinimum'))
      }),
      isBefore: () => ({
        days: (days: number) => ({
          inPast: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(days), 'formatMaximum')
            ),
          inFuture: () =>
            addCondition(
              getNegativeDateRange(getDateFromNow(-days), 'formatMaximum')
            )
        }),
        date: (date: string) =>
          addCondition(getNegativeDateRange(date, 'formatMaximum')),
        now: () =>
          addCondition(getNegativeDateRange(getDateFromNow(0), 'formatMaximum'))
      }),
      inArray: (values: string[]) =>
        addCondition({
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: {
                  type: 'string',
                  not: {
                    enum: values
                  }
                }
              },
              required: [fieldId]
            }
          },
          required: ['$form']
        }),
      equalTo: (value: string | boolean) =>
        addCondition({
          type: 'object',
          properties: {
            $form: {
              type: 'object',
              properties: {
                [fieldId]: {
                  oneOf: [
                    { type: 'string', const: value },
                    { type: 'boolean', const: value }
                  ],
                  not: {
                    const: value
                  }
                }
              },
              required: [fieldId]
            }
          },
          required: ['$form']
        })
    },
    or: (callback: (field: FieldAPI) => FieldAPI) => {
      const nestedConditions = callback(field(fieldId))._apply()

      return addCondition(ensureWrapper(nestedConditions, 'or'))
    },
    _apply: () => conditions,
    apply: () => {
      if (conditions.length === 1) {
        return defineConditional(conditions[0])
      }

      return defineConditional(ensureWrapper(conditions, 'and'))
    }
  }

  return api
}

type BooleanConnector = 'and' | 'or'

/**
 * Makes sure JSON Schema conditions are wrapped in an object with a $form property.
 */
const ensureWrapper = (
  conditions: AjvJSONSchema[],
  booleanConnector: BooleanConnector
): AjvJSONSchema => {
  const conditionsWithConnector = (
    conditions: AjvJSONSchema[],
    connector: BooleanConnector
  ): AjvJSONSchema =>
    connector === 'and'
      ? { type: 'object' as const, allOf: conditions, required: [] }
      : { type: 'object' as const, anyOf: conditions, required: [] }

  const needsWrapper = conditions.some(
    (condition) =>
      !(
        condition.type === 'object' &&
        condition.properties &&
        condition.properties.$form
      )
  )

  if (needsWrapper) {
    return {
      type: 'object',
      properties: {
        $form: {
          ...conditionsWithConnector(conditions, booleanConnector)
        }
      },
      required: []
    }
  }

  return conditionsWithConnector(conditions, booleanConnector)
}

export function objectHasProperty(
  property: string,
  type: 'string' | 'number' | 'boolean' | 'array' | 'object',
  format?: string
) {
  return {
    type: 'object',
    properties: {
      [property]: {
        type,
        format
      }
    },
    required: [property]
  }
}
