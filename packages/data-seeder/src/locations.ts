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
import fetch from 'node-fetch'
import {
  COUNTRY_CONFIG_URL,
  GATEWAY_URL,
  OPENCRVS_SPECIFICATION_URL
} from './constants'
import { TypeOf, z } from 'zod'
import { raise } from './utils'
import { inspect } from 'util'

const LocationSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    alias: z.string(),
    partOf: z.string(),
    locationType: z.enum(['ADMIN_STRUCTURE', 'HEALTH_FACILITY', 'CRVS_OFFICE']),
    jurisdictionType: z
      .enum([
        'STATE',
        'DISTRICT',
        'LOCATION_LEVEL_3',
        'LOCATION_LEVEL_4',
        'LOCATION_LEVEL_5'
      ])
      .optional(),
    statistics: z
      .array(
        z.object({
          year: z.number(),
          male_population: z.number(),
          female_population: z.number(),
          population: z.number(),
          crude_birth_rate: z.number()
        })
      )
      .optional()
  })
)

function validateAdminStructure(locations: TypeOf<typeof LocationSchema>) {
  const statisticsErrors = new Array<Error>()
  const locationsMap = new Map(
    locations.map(({ statistics, ...loc }) => {
      if (!statistics) {
        statisticsErrors.push(
          new Error(`No statistics data given for location: ${loc.name}`)
        )
      }
      return [
        loc.id,
        {
          ...loc,
          statistics: new Map(
            (statistics ?? []).map(({ year, ...stats }) => [year, stats])
          )
        }
      ]
    })
  )
  const locationNodeMap = new Map(
    locations.map((loc) => [
      loc.id,
      { id: loc.id, children: new Array<string>() }
    ])
  )
  // this is the root location
  locationNodeMap.set('0', { id: '0', children: [] })
  locations.forEach((loc) => {
    const parent = locationNodeMap.get(loc.partOf.split('/')[1])
    if (!parent) {
      raise(`Parent location "${loc.partOf}" not found for ${loc.name}`)
    }
    parent.children.push(loc.id)
  })

  function validateTree(root: string) {
    const node = locationNodeMap.get(root)!
    const location = locationsMap.get(node.id)!
    const childLocations = node.children.map(
      (child) => locationsMap.get(child)!
    )
    const accumulatedStatistics = new Map<
      number,
      { male_population: number; female_population: number; population: number }
    >()
    for (const [year, parentStats] of location.statistics.entries()) {
      if (
        parentStats.population <
        parentStats.male_population + parentStats.female_population
      ) {
        statisticsErrors.push(
          new Error(
            `Location: ${
              location.name
            }, year: ${year} -> Sum of male population and female population ${
              parentStats.male_population + parentStats.female_population
            } is higher than the total population ${parentStats.population}`
          )
        )
      }
      childLocations.forEach((childLocation) => {
        if (!childLocation.statistics.get(year)) {
          statisticsErrors.push(
            new Error(
              `Couldn't find child location data: ${childLocation.name}, year: ${year} -> but that year's data exists for parent: ${location.name}`
            )
          )
        }
        const currentStats = accumulatedStatistics.get(year) ?? {
          male_population: 0,
          female_population: 0,
          population: 0
        }
        const childStats = childLocation.statistics.get(year) ?? {
          male_population: 0,
          female_population: 0,
          population: 0
        }

        accumulatedStatistics.set(year, {
          male_population:
            currentStats.male_population + childStats.male_population,
          female_population:
            currentStats.female_population + childStats.female_population,
          population: currentStats.population + childStats.population
        })
      })
      if (childLocations.length > 0) {
        const sumPopulation = accumulatedStatistics.get(year)!.population
        if (sumPopulation > parentStats.population) {
          statisticsErrors.push(
            new Error(
              `Location: ${location.name}, year: ${year} -> Sum of child locations' population ${sumPopulation} is greater than the total population ${parentStats.population}, The total population should be >= ${sumPopulation}`
            )
          )
        }
      }
    }
  }
  locationNodeMap.get('0')!.children.forEach((childId) => validateTree(childId))
  if (statisticsErrors.length > 0) {
    raise(statisticsErrors.map((error) => error.message).join('\n'))
  }
  return locationsMap
}

async function getLocations() {
  const url = new URL('locations', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    raise(`Expected to get the locations from ${url}`)
  }
  const parsedLocations = LocationSchema.safeParse(await res.json())
  if (!parsedLocations.success) {
    raise(
      `Error when getting locations from country-config: ${inspect(
        parsedLocations.error.issues
      )}`
    )
  }
  const adminStructureMap = validateAdminStructure(
    parsedLocations.data.filter(
      ({ locationType }) => locationType === 'ADMIN_STRUCTURE'
    )
  )
  parsedLocations.data
    .filter(({ locationType }) => locationType !== 'ADMIN_STRUCTURE')
    .forEach((facilityOrOffice) => {
      if (!adminStructureMap.get(facilityOrOffice.partOf.split('/')[1])) {
        raise(
          `Parent location "${facilityOrOffice.partOf}" not found for ${facilityOrOffice.name}`
        )
      }
    })
  return parsedLocations.data
}

export async function seedLocations(token: string) {
  const savedLocations = await fetch(`${GATEWAY_URL}/location?_count=0`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
    .then((res) => res.json())
    .then((bundle: fhir3.Bundle<fhir3.Location>) => {
      return (
        bundle.entry
          ?.map((bundleEntry) => bundleEntry.resource)
          .filter((maybeLocation): maybeLocation is fhir3.Location =>
            Boolean(maybeLocation)
          )
          .map((location) =>
            location.identifier
              ?.find(
                ({ system }) =>
                  system ===
                    `${OPENCRVS_SPECIFICATION_URL}id/statistical-code` ||
                  system === `${OPENCRVS_SPECIFICATION_URL}id/internal-id`
              )
              ?.value?.split('_')
              .pop()
          )
          .filter((maybeId): maybeId is string => Boolean(maybeId)) ?? []
      )
    })
  const savedLocationsSet = new Set(savedLocations)
  const locations = (await getLocations()).filter((location) => {
    if (savedLocationsSet.has(location.id)) {
      console.log(`Location with id "${location.id}" already exists. Skipping`)
    }
    return !savedLocationsSet.has(location.id)
  })
  const res = await fetch(`${GATEWAY_URL}/location?`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(
      locations
        // statisticalID & code are legacy properties
        .map(({ id, locationType, ...loc }) => ({
          statisticalID: id,
          code: locationType,
          ...loc
        }))
    )
  })
  if (!res.ok) {
    raise(await res.json())
  }
  const response: fhir3.Bundle<fhir3.BundleEntryResponse> = await res.json()
  response.entry?.forEach((res, index) => {
    if (res.response?.status !== '201') {
      console.log(
        `Failed to create location resource for: "${locations[index].name}"`
      )
    }
  })
}
