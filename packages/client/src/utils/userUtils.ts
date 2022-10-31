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
  GQLSignature
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/client/src/storage'
import { createNamesMap } from './data-formatting'
import { LANG_EN } from './constants'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'

export const USER_DETAILS = 'USER_DETAILS'

export interface IIdentifier {
  system: string
  value: string
}
export interface IGQLLocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  alias?: (string | null)[]
  status?: string
}

export interface IAvatar {
  type: string
  data: string
}

export interface IUserDetails {
  userMgntUserID?: string
  practitionerId?: string
  mobile?: string
  role?: string
  type?: string
  title?: string
  status?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: IGQLLocation[]
  primaryOffice?: IGQLLocation
  supervisoryArea?: string
  localRegistrar?: {
    name: Array<GQLHumanName | null>
    role?: string
    signature?: GQLSignature
  }
  avatar?: IAvatar
}

export function getUserDetails(user: GQLUser): IUserDetails {
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
    title,
    supervisoryArea,
    avatar
  } = user
  const userDetails: IUserDetails = {}
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
  if (title) {
    userDetails.title = title
  }
  if (type) {
    userDetails.type = type
  }
  if (status) {
    userDetails.status = status
  }
  if (supervisoryArea) {
    userDetails.supervisoryArea = supervisoryArea
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
    ) as IGQLLocation[]
    if (potentialCatchmentAreas !== undefined) {
      userDetails.catchmentArea = potentialCatchmentAreas
    }
  }

  if (avatar) {
    userDetails.avatar = avatar
  }

  return userDetails
}

export function getUserLocation(userDetails: IUserDetails) {
  if (!userDetails.primaryOffice) {
    throw Error('The user has no primary office')
  }

  return userDetails.primaryOffice
}

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}

export function getIndividualNameObj(
  individualNameArr: Array<GQLHumanName | null>,
  language: string
) {
  return (
    individualNameArr.find((name: GQLHumanName | null) => {
      return name && name.use === language ? true : false
    }) || individualNameArr[0]
  )
}

export function getUserName(userDetails: IUserDetails | null) {
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
