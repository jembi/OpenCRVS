import {
  GQLLocation,
  GQLUser,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '/storage'

export const USER_DETAILS = 'USER_DETAILS'

export interface IIdentifier {
  system: string
  value: string
}
export interface IGQLLocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  status?: string
}

export interface IUserDetails {
  userMgntUserID?: string
  role?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: IGQLLocation[]
  primaryOffice?: IGQLLocation
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const { catchmentArea, primaryOffice, name, role, userMgntUserID } = user
  const userDetails: IUserDetails = {}
  if (userMgntUserID) {
    userDetails.userMgntUserID = userMgntUserID
  }
  if (name) {
    userDetails.name = name
  }
  if (role) {
    userDetails.role = role
  }
  if (primaryOffice) {
    userDetails.primaryOffice = {
      id: primaryOffice.id,
      name: primaryOffice.name,
      status: primaryOffice.status
    }
  }
  userDetails.catchmentArea =
    catchmentArea &&
    catchmentArea.map((cArea: GQLLocation) => {
      return {
        id: cArea.id,
        name: cArea.name,
        status: cArea.status,
        identifier:
          cArea.identifier &&
          cArea.identifier.map((identifier: IIdentifier) => {
            return {
              system: identifier.system,
              value: identifier.value
            }
          })
      }
    })
  return userDetails
}

export function getUserLocation(
  userDetails: IUserDetails,
  locationKey: string
): string {
  if (!userDetails.catchmentArea) {
    throw Error('The user has no catchment area')
  }

  const filteredArea: IGQLLocation[] = userDetails.catchmentArea.filter(
    (area: IGQLLocation) => {
      if (area.identifier) {
        const relevantIdentifier: IIdentifier[] = area.identifier.filter(
          (identifier: IIdentifier) => {
            return identifier.value === locationKey
          }
        )
        return relevantIdentifier[0] ? area : false
      } else {
        throw Error('The catchment area has no identifier')
      }
    }
  )
  return filteredArea[0] ? filteredArea[0].id : ''
}

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}
