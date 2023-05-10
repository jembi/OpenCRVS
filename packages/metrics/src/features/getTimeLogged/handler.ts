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
import * as Hapi from '@hapi/hapi'
import {
  COMPOSITION_ID,
  PRACTITIONER_ID,
  STATUS
} from '@metrics/features/getTimeLogged/constants'
import {
  countTimeLoggedForPractitioner,
  getTimeLogged,
  getTimeLoggedByStatus,
  getTimeLoggedForPractitioner
} from '@metrics/features/getTimeLogged/utils'
import {
  COUNT,
  LOCATION_ID,
  TIME_FROM,
  TIME_TO
} from '@metrics/features/metrics/constants'

export async function getTimeLoggedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const practitionerId = request.query[PRACTITIONER_ID]
  const compositionId = request.query[COMPOSITION_ID]
  const status = request.query[STATUS]

  if (practitionerId) {
    const timeStart = request.query[TIME_FROM]
    const timeEnd = request.query[TIME_TO]
    const locationId = request.query[LOCATION_ID]
    const count = request.query[COUNT]

    return {
      results: await getTimeLoggedForPractitioner(
        timeStart,
        timeEnd,
        practitionerId,
        `Location/${locationId}`,
        count
      ),
      totalItems: await countTimeLoggedForPractitioner(
        timeStart,
        timeEnd,
        practitionerId,
        `Location/${locationId}`
      )
    }
  } else if (status) {
    return await getTimeLoggedByStatus(compositionId, status.toUpperCase())
  } else {
    return await getTimeLogged(compositionId)
  }
}
