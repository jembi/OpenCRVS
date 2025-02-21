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
import { EventSearchIndex } from '@opencrvs/commons/events'
import {
  QueryDslQueryContainer,
  SearchRequest
} from '@elastic/elasticsearch/lib/api/types'
const FIELD_SEPARATOR = '____'
export const DEFAULT_SIZE = 10

export function generateQuery(event: Omit<EventSearchIndex, 'type'>) {
  const must: QueryDslQueryContainer[] = Object.entries(event).map(
    ([key, value]) => ({
      term: {
        [key.replaceAll('.', FIELD_SEPARATOR)]: value
      }
    })
  )

  return {
    bool: {
      must
    }
  } as SearchRequest['query']
}
