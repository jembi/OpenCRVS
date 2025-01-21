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
import {
  ILocation,
  LocationType,
  IOfflineData,
  Facility,
  CRVSOffice,
  AdminStructure
} from '@client/offline/reducer'
import { Address } from '@client/utils/gateway'
import { ISearchLocation } from '@opencrvs/components/lib/LocationSearch'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { locationMessages, countryMessages } from '@client/i18n/messages'
import { countries } from '@client/utils/countries'
import { lookup } from 'country-data'
import { getDefaultLanguage } from '@client/i18n/utils'
import { camelCase } from 'lodash'

export const countryAlpha3toAlpha2 = (isoCode: string): string | undefined => {
  const alpha2 =
    isoCode === 'FAR'
      ? 'FA'
      : lookup.countries({ alpha3: isoCode.toUpperCase() })[0]?.alpha2

  return alpha2
}

export function filterLocations(
  locations: { [key: string]: ILocation },
  allowedType: 'HEALTH_FACILITY',
  match?: {
    locationLevel: keyof ILocation
    locationId?: string
  }
): { [key: string]: Facility }
export function filterLocations(
  locations: { [key: string]: ILocation },
  allowedType: 'CRVS_OFFICE',
  match?: {
    locationLevel: keyof ILocation
    locationId?: string
  }
): { [key: string]: CRVSOffice }
export function filterLocations(
  locations: { [key: string]: ILocation },
  allowedType: 'ADMIN_STRUCTURE',
  match?: {
    locationLevel: keyof ILocation
    locationId?: string
  }
): { [key: string]: AdminStructure }
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

export function generateLocationName(
  location: ILocation | undefined,
  intl: IntlShape
) {
  // when health institution in place of delivery is set null in birth registration form
  if (!location) {
    return ''
  }
  let name = getLocalizedLocationName(intl, location)
  location.jurisdictionType &&
    (name += ` ${
      intl.formatMessage(locationMessages(location.jurisdictionType)) || ''
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

export function generateSearchableLocations(
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
      searchableText: getLocalizedLocationName(intl, location),
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

export function getLocationNameMapOfFacility(
  facilityLocation: ILocation,
  offlineLocations: Record<string, ILocation>,
  countryAsString?: boolean
): Record<string, LocationName> {
  let location: ILocation = facilityLocation
  let continueLoop = true
  const map: Record<string, LocationName> = { facility: location.name }
  while (location.partOf && continueLoop) {
    const parent = location.partOf.split('/')[1]
    if (parent === '0') {
      continueLoop = false
      map.country = countryAsString
        ? (countries.find(({ value }) => value === window.config.COUNTRY)?.label
            .defaultMessage as string)
        : (countries.find(({ value }) => value === window.config.COUNTRY)
            ?.label as MessageDescriptor)
    } else {
      location = offlineLocations[parent]
      map[location.jurisdictionType?.toLowerCase() as string] = location.name
    }
  }
  return map
}

export function getLocalizedLocationName(intl: IntlShape, location: ILocation) {
  if (intl.locale === getDefaultLanguage()) {
    return location.name
  } else {
    return location.alias?.toString()
  }
}

type LocationHierarchy = {
  state?: string
  district?: string
  country?: string
  [key: `locationLevel${number}`]: string | undefined
}

const camelCasedJurisdictionType = (
  jurisdictionType: AdminStructure['jurisdictionType']
) => camelCase(jurisdictionType) as keyof LocationHierarchy

export function getLocationHierarchy(
  locationId: string,
  locations: Record<string, AdminStructure | undefined>,
  hierarchy: LocationHierarchy = {
    country: countries.find(({ value }) => value === window.config.COUNTRY)
      ?.label.defaultMessage as string
  }
): LocationHierarchy {
  const parentLocation = locations[locationId]
  if (!parentLocation) {
    return hierarchy
  }
  const { id, jurisdictionType, partOf } = parentLocation

  return getLocationHierarchy(partOf.split('/').at(1)!, locations, {
    ...hierarchy,
    [camelCasedJurisdictionType(jurisdictionType)]: id
  })
}

export function generateFullAddress(
  address: Address,
  offlineData: IOfflineData
): string[] {
  const locationLevels = []

  if (!address?.line) {
    return []
  }
  for (let i = address.line.length - 1; i >= 3; i--) {
    const fhirIndex = i + 7
    locationLevels.push(
      address.line[fhirIndex] &&
        offlineData.locations[address.line[fhirIndex]]?.name
    )
  }
  const district =
    address.district && offlineData.locations[address.district].name

  const state = address.state && offlineData.locations[address.state].name

  return [...locationLevels, district, state].filter(
    (maybeLocation): maybeLocation is string => Boolean(maybeLocation)
  )
}
