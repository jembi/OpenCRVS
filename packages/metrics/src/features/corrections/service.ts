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
import { EVENT_TYPE } from '@metrics/features/metrics/utils'
import { ResourceIdentifier, Location } from '@opencrvs/commons/types'
import { query } from '@metrics/influxdb/client'
import { fetchLocationChildrenIds } from '@metrics/configApi'
import { helpers } from '@metrics/utils/queryHelper'

interface ICorrectionTotalGroup {
  total: number
  reason: string
}

export async function getTotalCorrections(
  timeFrom: string,
  timeTo: string,
  event: EVENT_TYPE
) {
  const q = `SELECT COUNT(compositionId) AS total
      FROM correction
    WHERE time > $timeFrom
      AND time <= $timeTo
      AND eventType = $event
    GROUP BY reason`

  const totalCorrections: ICorrectionTotalGroup[] = await query(q, {
    placeholders: {
      timeFrom,
      timeTo,
      event
    }
  })

  return totalCorrections
}

export async function getTotalCorrectionsByLocation(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>,
  event: EVENT_TYPE
) {
  const locationIds = await fetchLocationChildrenIds(locationId)
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )

  const q = `SELECT COUNT(compositionId) AS total
      FROM correction
    WHERE time > $timeFrom
      AND time <= $timeTo
      AND eventType = $event
      AND (${officeLocationInChildren})
    GROUP BY reason`

  const totalCorrections: ICorrectionTotalGroup[] = await query(q, {
    placeholders: {
      timeFrom,
      timeTo,
      event,
      ...locationPlaceholders
    }
  })

  return totalCorrections
}
