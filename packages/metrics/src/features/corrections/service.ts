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

import { query } from '@metrics/influxdb/client'

interface ICorrectionTotalGroup {
  total: number
  reason: string
}

export async function getTotalCorrections(
  timeFrom: string,
  timeTo: string,
  locationId: string | undefined,
  event: EVENT_TYPE
) {
  const q = `SELECT COUNT(compositionId) AS total
      FROM correction
    WHERE time > $timeFrom
      AND time <= $timeTo
      AND eventType = $event
      ${
        locationId
          ? `AND ( locationLevel1 = $locationId
      OR locationLevel2 = $locationId
      OR locationLevel3 = $locationId
      OR locationLevel4 = $locationId
      OR locationLevel5 = $locationId
      OR officeLocation = $locationId)`
          : ``
      }
    GROUP BY reason`

  const totalCorrections: ICorrectionTotalGroup[] = await query(q, {
    placeholders: {
      timeFrom,
      timeTo,
      locationId,
      event
    }
  })

  return totalCorrections
}
