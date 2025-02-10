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

import {
  AddressFieldValue,
  EventConfig,
  EventDocument,
  EventIndex,
  FieldConfig,
  FieldType,
  getCurrentEventState
} from '@opencrvs/commons/events'
import { type estypes } from '@elastic/elasticsearch'
import * as eventsDb from '@events/storage/mongodb/events'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { getAllFields, logger } from '@opencrvs/commons'
import { Transform } from 'stream'
import { z } from 'zod'
function eventToEventIndex(event: EventDocument): EventIndex {
  return encodeEventIndex(getCurrentEventState(event))
}

export type EncodedEventIndex = EventIndex
export function encodeEventIndex(event: EventIndex): EncodedEventIndex {
  return {
    ...event,
    data: Object.entries(event.data).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [encodeFieldId(key)]: value
      }),
      {}
    )
  }
}

export function decodeEventIndex(event: EncodedEventIndex): EventIndex {
  return {
    ...event,
    data: Object.entries(event.data).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [decodeFieldId(key)]: value
      }),
      {}
    )
  }
}

/*
 * This type ensures all properties of EventIndex are present in the mapping
 */
type EventIndexMapping = { [key in keyof EventIndex]: estypes.MappingProperty }

export async function ensureIndexExists(eventConfiguration: EventConfig) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    await createIndex(indexName, getAllFields(eventConfiguration))
  }
}

export async function createIndex(
  indexName: string,
  formFields: FieldConfig[]
) {
  const client = getOrCreateClient()

  await client.indices.create({
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
          data: {
            type: 'object',
            properties: formFieldsToDataMapping(formFields)
          }
        } satisfies EventIndexMapping
      }
    }
  })

  return client.indices.putAlias({
    index: indexName,
    name: getEventAliasName()
  })
}

const SEPARATOR = '____'

export function encodeFieldId(fieldId: string) {
  return fieldId.replaceAll('.', SEPARATOR)
}

function decodeFieldId(fieldId: string) {
  return fieldId.replaceAll(SEPARATOR, '.')
}

function mapFieldTypeToElasticsearch(field: FieldConfig) {
  switch (field.type) {
    case FieldType.DATE:
      // @TODO: This should be changed back to 'date'
      // When we have proper validation of custom fields.
      return { type: 'text' }
    case FieldType.TEXT:
    case FieldType.PARAGRAPH:
    case FieldType.BULLET_LIST:
    case FieldType.PAGE_HEADER:
      return { type: 'text' }
    case FieldType.DIVIDER:
    case FieldType.RADIO_GROUP:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.CHECKBOX:
    case FieldType.LOCATION:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.OFFICE:
      return { type: 'keyword' }
    case FieldType.ADDRESS:
      const addressProperties = {
        country: { type: 'keyword' },
        province: { type: 'keyword' },
        district: { type: 'keyword' },
        urbanOrRural: { type: 'keyword' },
        town: { type: 'keyword' },
        residentialArea: { type: 'keyword' },
        street: { type: 'keyword' },
        number: { type: 'keyword' },
        zipCode: { type: 'keyword' },
        village: { type: 'keyword' }
      } satisfies {
        [K in keyof Required<
          NonNullable<AddressFieldValue>
        >]: estypes.MappingProperty
      }
      return {
        type: 'object',
        properties: addressProperties
      }
    case FieldType.FILE:
      return {
        type: 'object',
        properties: {
          filename: { type: 'keyword' },
          originalFilename: { type: 'keyword' },
          type: { type: 'keyword' }
        }
      }
    default:
      const _exhaustiveCheck: never = field
      throw new Error(
        `Unhandled field type: ${JSON.stringify(_exhaustiveCheck)}`
      )
  }
}

function formFieldsToDataMapping(fields: FieldConfig[]) {
  return fields.reduce((acc, field) => {
    return {
      ...acc,
      [encodeFieldId(field.id)]: mapFieldTypeToElasticsearch(field)
    }
  }, {})
}

export async function indexAllEvents(eventConfiguration: EventConfig) {
  const mongoClient = await eventsDb.getClient()
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(eventConfiguration.id)
  const hasEventsIndex = await esClient.indices.exists({
    index: indexName
  })

  if (!hasEventsIndex) {
    await createIndex(indexName, getAllFields(eventConfiguration))
  }

  const stream = mongoClient.collection(indexName).find().stream()

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: EventDocument, _encoding, callback) => {
      callback(null, eventToEventIndex(record))
    }
  })

  await esClient.helpers.bulk({
    retries: 3,
    wait: 3000,
    datasource: stream.pipe(transformedStreamData),
    onDocument: (doc: EventIndex) => ({
      index: {
        _index: indexName,
        _id: doc.id
      }
    }),
    refresh: 'wait_for'
  })
}

export async function indexEvent(event: EventDocument) {
  const esClient = getOrCreateClient()
  const indexName = getEventIndexName(event.type)

  return esClient.update<EventIndex>({
    index: indexName,
    id: event.id,
    body: {
      doc: eventToEventIndex(event),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })
}

export async function deleteEventIndex(event: EventDocument) {
  const esClient = getOrCreateClient()

  const response = await esClient.delete({
    index: getEventIndexName(event.type),
    id: event.id,
    refresh: 'wait_for'
  })

  return response
}

export async function getIndexedEvents() {
  const esClient = getOrCreateClient()

  const hasEventsIndex = await esClient.indices.exists({
    index: getEventAliasName()
  })

  if (!hasEventsIndex) {
    logger.error(
      'Event index not created. Sending empty array. Ensure indexing is running.'
    )
    return []
  }

  const response = await esClient.search<EncodedEventIndex>({
    index: getEventAliasName(),
    size: 10000,
    request_cache: false
  })

  const events = z.array(EventIndex).parse(
    response.hits.hits
      .map((hit) => hit._source)
      .filter((event): event is EncodedEventIndex => event !== undefined)
      .map((event) => decodeEventIndex(event))
  )

  return events
}
