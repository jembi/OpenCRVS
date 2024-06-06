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

import { Client } from '@elastic/elasticsearch'

const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'
const ES_HOST = process.env.ES_HOST || 'localhost:9200'
const ELASTICSEARCH_INDEX_NAME = 'ocrvs'

export const client = new Client({
  node: `http://${ES_HOST}`
})

export const updateComposition = async (
  id: string,
  body: any,
  extraConfigs?: Record<string, any>
) => {
  let response
  try {
    response = await client.update({
      index: ELASTICSEARCH_INDEX_NAME,
      type: 'compositions',
      id,
      body: {
        doc: body
      },
      ...extraConfigs
    })
  } catch (e) {
    console.error(`updateComposition: error: ${e}`)
  }

  return response
}

export const renameField = async (
  oldFieldName: string,
  newFieldName: string
) => {
  try {
    const response = await client.updateByQuery({
      index: ELASTICSEARCH_INDEX_NAME,
      body: {
        query: {
          bool: {
            must_not: {
              exists: {
                field: newFieldName
              }
            }
          }
        },
        script: {
          inline: `ctx._source.${newFieldName} = ctx._source.${oldFieldName}; ctx._source.remove("${oldFieldName}");`
        }
      }
    })
    return response
  } catch (err) {
    console.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}

export const searchByCompositionId = async (compositionId: string) => {
  try {
    return await client.search({
      index: ELASTICSEARCH_INDEX_NAME,
      body: {
        query: {
          match: {
            _id: compositionId
          }
        }
      }
    })
  } catch (err) {
    console.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}

export const searchCompositionByCriteria = async (
  criteriaObject: Record<string, any>,
  extraConfigs?: Record<string, any>
) => {
  try {
    return await client.search({
      index: ELASTICSEARCH_INDEX_NAME,
      type: 'compositions',
      body: {
        query: criteriaObject,
        ...extraConfigs
      }
    })
  } catch (err) {
    console.error(`searchCompositionByCriteria: error: ${err}`)
    return null
  }
}

/**
 * Streams MongoDB collections to ElasticSearch documents. Useful when the ElasticSearch schema changes.
 */
export const triggerReindex = async (timestamp: string) => {
  const response = await fetch(new URL('reindex', SEARCH_URL), {
    method: 'POST',
    body: JSON.stringify({ timestamp }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error(
      `Problem reindexing ElasticSearch. Response: ${await response.text()}`
    )
  }

  const data = await response.json()
  return data.jobId
}

/**
 * Checks the status of the reindex, as it can take a while
 */
export const checkReindexStatus = async (jobId: string) => {
  const response = await fetch(new URL(`reindex/status/${jobId}`, SEARCH_URL), {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(
      `Problem checking reindex status from ElasticSearch. Response: ${await response.text()}`
    )
  }

  const data = await response.json()
  return data.status === 'completed'
}

export const reindex = async (timestamp: string) => {
  console.info(`Reindexing ${timestamp}...`)
  const jobId = await triggerReindex(timestamp)
  await new Promise<void>((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const isCompleted = await checkReindexStatus(jobId)
        if (isCompleted) {
          clearInterval(intervalId)
          resolve()
        }
      } catch (error) {
        clearInterval(intervalId)
        reject(error)
      }
    }, 1000)
  })
  console.info(`...done reindexing ${timestamp} (job id ${jobId})`)
}
