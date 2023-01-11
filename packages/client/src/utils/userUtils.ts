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
import {
  GQLLocation,
  GQLUser,
  GQLHumanName,
  GQLIdentifier,
  GQLSignature,
  GQLBookmarkedSeachItem
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/client/src/storage'
import {
  BookmarkedSeachItem,
  Location,
  HumanName,
  User
} from '@client/utils/gateway'
import { createNamesMap } from './data-formatting'
import { LANG_EN } from './constants'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'

export const USER_DETAILS = 'USER_DETAILS'

export function getUserDetails(user: User): User {
  const {
    catchmentArea,
    primaryOffice,
    name,
    mobile,
    role,
    type,
    status,
    userMgntUserID,
    practitionerId,
    localRegistrar,
    avatar,
    searches
  } = user
  const userDetails: User = {}
  if (localRegistrar) {
    userDetails.localRegistrar = localRegistrar
  }
  if (userMgntUserID) {
    userDetails.userMgntUserID = userMgntUserID
  }
  if (practitionerId) {
    userDetails.practitionerId = practitionerId
  }
  if (name) {
    userDetails.name = name
  }
  if (mobile) {
    userDetails.mobile = mobile
  }
  if (role) {
    userDetails.role = role
  }
  if (type) {
    userDetails.type = type
  }
  if (status) {
    userDetails.status = status
  }
  if (primaryOffice) {
    userDetails.primaryOffice = {
      id: primaryOffice.id,
      name: primaryOffice.name,
      alias: primaryOffice.alias,
      status: primaryOffice.status
    }
  }

  if (catchmentArea) {
    const areaWithLocations: GQLLocation[] = catchmentArea as GQLLocation[]
    const potentialCatchmentAreas = areaWithLocations.map(
      (cArea: GQLLocation) => {
        if (cArea.identifier) {
          const identifiers: GQLIdentifier[] =
            cArea.identifier as GQLIdentifier[]
          return {
            id: cArea.id,
            name: cArea.name,
            alias: cArea.alias,
            status: cArea.status,
            identifier: identifiers.map((identifier: GQLIdentifier) => {
              return {
                system: identifier.system,
                value: identifier.value
              }
            })
          }
        }
        return {}
      }
    ) as Location[]
    if (potentialCatchmentAreas !== undefined) {
      userDetails.catchmentArea = potentialCatchmentAreas
    }
  }

  if (avatar) {
    userDetails.avatar = avatar
  }

  if (searches) {
    userDetails.searches = searches as BookmarkedSeachItem[]
  }

  return userDetails
}

export function getUserLocation(userDetails: User) {
  if (!userDetails.primaryOffice) {
    throw Error('The user has no primary office')
  }

  return userDetails.primaryOffice
}

export async function storeUserDetails(userDetails: User) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}

export function getIndividualNameObj(
  individualNameArr: Array<HumanName | null>,
  language: string
) {
  return (
    individualNameArr.find((name: HumanName | null) => {
      return name && name.use === language ? true : false
    }) || individualNameArr[0]
  )
}

export function getUserName(userDetails: User | null) {
  return (
    (userDetails &&
      userDetails.name &&
      createNamesMap(
        userDetails.name.filter((name): name is GQLHumanName => !!name)
      )[LANG_EN]) ||
    ''
  )
}

export function useUserName() {
  return useSelector<IStoreState, string>((state) => {
    const { userDetails } = state.profile
    return getUserName(userDetails)
  })
}
