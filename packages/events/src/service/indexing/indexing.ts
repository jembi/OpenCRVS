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

const EVENTS_INDEX = 'events'

import {
  EventDocument,
  EventIndex,
  getCurrentEventState
} from '@opencrvs/commons/events'

import { type estypes } from '@elastic/elasticsearch'
import { getClient } from '@events/storage'
import { getOrCreateClient } from '@events/storage/elasticsearch'
import { Transform } from 'stream'
import { z } from 'zod'

function eventToEventIndex(event: EventDocument): EventIndex {
  return getCurrentEventState(event)
}

/*
 * This type ensures all properties of EventIndex are present in the mapping
 */
type EventIndexMapping = { [key in keyof EventIndex]: estypes.MappingProperty }

function createIndex(indexName: string) {
  const client = getOrCreateClient()
  return client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          status: { type: 'keyword' },
          createdAt: { type: 'date' },
          createdBy: { type: 'keyword' },
          createdAtLocation: { type: 'keyword' },
          modifiedAt: { type: 'date' },
          assignedTo: { type: 'keyword' },
          updatedBy: { type: 'keyword' },
          data: { type: 'object', enabled: true }
        } satisfies EventIndexMapping
      }
    }
  })
}

export async function indexAllEvents() {
  const mongoClient = await getClient()
  const esClient = getOrCreateClient()
  await createIndex(EVENTS_INDEX)

  const stream = mongoClient.collection(EVENTS_INDEX).find().stream()

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record, _encoding, callback) => {
      callback(null, eventToEventIndex(record))
    }
  })

  return esClient.helpers.bulk({
    retries: 3,
    wait: 3000,
    datasource: stream.pipe(transformedStreamData),
    onDocument: (doc: EventIndex) => ({
      index: {
        _index: EVENTS_INDEX,
        _id: doc.id
      }
    }),
    refresh: 'wait_for'
  })
}

export async function indexEvent(event: EventDocument) {
  const esClient = getOrCreateClient()

  return esClient.update({
    index: EVENTS_INDEX,
    id: event.id,
    body: {
      doc: eventToEventIndex(event),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })
}

export async function deleteEventIndex(eventId: string) {
  const esClient = getOrCreateClient()

  const response = await esClient.delete({
    index: EVENTS_INDEX,
    id: eventId,
    refresh: 'wait_for'
  })

  return response
}

export async function getIndexedEvents() {
  const esClient = getOrCreateClient()

  const hasEventsIndex = await esClient.indices.exists({ index: EVENTS_INDEX })

  if (!hasEventsIndex) {
    // @TODO: We probably want to create the index on startup or as part of the deployment process.
    // eslint-disable-next-line no-console
    console.error('Events index does not exist. Creating one.')
    await createIndex(EVENTS_INDEX)

    return []
  }

  const response = await esClient.search({
    index: EVENTS_INDEX,
    size: 10000,
    request_cache: false
  })

  return z.array(EventIndex).parse(response.hits.hits.map((hit) => hit._source))
}
