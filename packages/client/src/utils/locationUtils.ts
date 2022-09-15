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
import { ILocation, LocationType, IOfflineData } from '@client/offline/reducer'
import { IUserDetails, IGQLLocation, IIdentifier } from './userUtils'
import { ISearchLocation } from '@opencrvs/components/lib/interface/LocationSearch/LocationSearch'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { locationMessages, countryMessages } from '@client/i18n/messages'
import { countries } from '@client/forms/countries'

export function filterLocations(
  locations: { [key: string]: ILocation },
  allowedType: LocationType,
  match?: {
    locationLevel: keyof ILocation // ex: 'partOf' or 'id'
    locationId?: string
  }
): { [key: string]: ILocation } {
  const filteredLocations: { [key: string]: ILocation } = {}
  Object.values(locations).forEach((location: ILocation) => {
    if (
      location.type === allowedType.toString() &&
      (!match ||
        !match.locationId ||
        location[match.locationLevel] === match.locationId)
    ) {
      filteredLocations[location.id] = location
    }
  })

  return filteredLocations
}

export function getLocation(userDetails: IUserDetails, locationKey: string) {
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

export function generateLocationName(
  location: ILocation | undefined,
  intl: IntlShape
) {
  // when health institution in place of delivery is set null in birth registration form
  if (!location) {
    return ''
  }
  let name = location.name
  location.jurisdictionType &&
    (name += ` ${
      intl.formatMessage(locationMessages[location.jurisdictionType]) || ''
    }`.trimEnd())
  return name
}

export function generateFullLocation(
  districtId: string,
  stateId: string,
  countryCode: string,
  resources: IOfflineData,
  intl: IntlShape
) {
  const district = districtId && resources.locations[districtId]
  const state = stateId && resources.locations[stateId]
  const country =
    countryCode && intl.formatMessage(countryMessages[countryCode])
  let location = ''
  if (district) location = district.name + ', '
  if (state) location = location + state.name + ', '
  location = location + country
  return location
}

function generateSearchableLocations(
  locations: ILocation[],
  offlineLocations: { [key: string]: ILocation },
  intl: IntlShape
) {
  const generated: ISearchLocation[] = locations.map((location: ILocation) => {
    let locationName = generateLocationName(location, intl)

    if (
      location.partOf &&
      location.partOf !== 'Location/0' &&
      location.type !== 'CRVS_OFFICE'
    ) {
      const locRef = location.partOf.split('/')[1]
      let parent
      if (
        (parent =
          offlineLocations[locRef] &&
          generateLocationName(offlineLocations[locRef], intl))
      ) {
        locationName += `, ${parent}`
      }
    }

    return {
      id: location.id,
      searchableText: location.name,
      displayLabel: locationName
    }
  })
  return generated
}

export function generateLocations(
  locations: { [key: string]: ILocation },
  intl: IntlShape,
  filterByJurisdictionTypes?: string[],
  filterByLocationTypes?: LocationType[]
) {
  let locationArray = Object.values(locations)

  if (filterByLocationTypes) {
    locationArray = locationArray.filter(
      (location) =>
        location.type &&
        filterByLocationTypes.includes(location.type as LocationType)
    )
  }

  if (filterByJurisdictionTypes) {
    locationArray = locationArray.filter(
      (location) =>
        location.jurisdictionType &&
        filterByJurisdictionTypes.includes(location.jurisdictionType)
    )
  }

  return generateSearchableLocations(locationArray, locations, intl)
}

export function generatePilotLocations(
  pilotLocations: { [key: string]: ILocation },
  offlineLocations: { [key: string]: ILocation },
  intl: IntlShape
) {
  return generateSearchableLocations(
    Object.values(pilotLocations),
    offlineLocations,
    intl
  )
}

export function getJurisidictionType(
  locations: { [key: string]: ILocation },
  locationId: string
): string {
  const relevantLocation = locations[locationId]

  if (!relevantLocation) {
    throw new Error(`Location ${locationId} not found`)
  }

  return relevantLocation.jurisdictionType as string
}

export type LocationName = string | MessageDescriptor

export function getFullLocationNameOfFacility(
  facilityLocation: ILocation,
  offlineLocations: Record<string, ILocation>
) {
  let location: ILocation = facilityLocation
  const names: LocationName[] = [location.name]
  let continueLoop = true
  while (location.partOf && continueLoop) {
    const parent = location.partOf.split('/')[1]
    if (parent === '0') {
      continueLoop = false
      names.push(
        countries.find(({ value }) => value === window.config.COUNTRY)
          ?.label as MessageDescriptor
      )
    } else {
      location = offlineLocations[parent]
      names.push(location.name)
    }
  }
  return names
}
