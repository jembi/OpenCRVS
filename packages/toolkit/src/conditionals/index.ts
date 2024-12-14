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
import { JSONSchema } from '@opencrvs/commons/conditionals'
import { ActionDocument } from '@opencrvs/commons/events'

export function defineConditional(conditional: JSONSchema): JSONSchema {
  return conditional
}

export function and(...conditions: JSONSchema[]): JSONSchema {
  return {
    type: 'object',
    allOf: conditions
  }
}

export function or(...conditions: JSONSchema[]): JSONSchema {
  return {
    type: 'object',
    anyOf: conditions
  }
}

export function not(condition: JSONSchema): JSONSchema {
  return {
    type: 'object',
    not: condition
  }
}

export function userHasScope(scope: string) {
  return {
    properties: {
      $user: {
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

export function eventHasAction(type: ActionDocument['type']) {
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
                }
              },
              required: ['type']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['$event']
  }
}
