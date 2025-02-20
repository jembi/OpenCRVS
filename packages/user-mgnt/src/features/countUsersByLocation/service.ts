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
import { UUID, fetchJSON, joinURL, Roles, SCOPES } from '@opencrvs/commons'
import { env } from '@user-mgnt/environment'
import User from '@user-mgnt/model/user'
import { resolveLocationChildren } from '@user-mgnt/utils/location'

export async function countUsersByLocation(locationId: UUID | undefined) {
  // For the whole country
  const roles = await fetchJSON<Roles>(
    joinURL(env.COUNTRY_CONFIG_URL, '/roles')
  )
  const registrarRoles = roles
    .filter((role) => role.scopes.includes(SCOPES.RECORD_REGISTER))
    .map((role) => role.id)
  if (!locationId) {
    const resArray = await User.aggregate([
      {
        $match: {
          role: { $in: registrarRoles }
        }
      },
      { $count: 'registrars' }
    ])
    return resArray[0] ?? { registrars: 0 }
  }

  const locationChildren = await resolveLocationChildren(locationId)

  const resArray = await User.aggregate([
    {
      $match: {
        primaryOfficeId: { $in: locationChildren },
        role: { $in: registrarRoles }
      }
    },
    {
      $group: { _id: '$primaryOfficeId', registrars: { $addToSet: '$_id' } }
    },
    {
      $project: {
        _id: 0,
        registrars: { $size: '$registrars' } // Count the number of unique user ids collected in registrars
      }
    }
  ])

  return resArray[0] ?? { registrars: 0 }
}
