/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client } from '@search/elasticsearch/client'
import { logger } from '@search/logger'

export async function deleteOCRVSIndexHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let response: any
  try {
    response = await client.indices.delete({
      index: OPENCRVS_INDEX_NAME
    })
    logger.info(`Successfully deleted ${OPENCRVS_INDEX_NAME} index`)
    return h.response(response).code(200)
  } catch (err) {
    logger.error(`Failed to delete ${OPENCRVS_INDEX_NAME} index: error: ${err}`)
    return internal(err)
  }
}
