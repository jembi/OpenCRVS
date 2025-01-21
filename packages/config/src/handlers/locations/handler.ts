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
import * as Hapi from '@hapi/hapi'
import { badRequest, conflict } from '@hapi/boom'
import * as Joi from 'joi'
import {
  composeFhirLocation,
  generateStatisticalExtensions,
  getLocationsByIdentifier,
  updateStatisticalExtensions
} from './utils'
import { v4 as uuid } from 'uuid'
import {
  Bundle,
  BundleEntry,
  Saved,
  URLReference,
  Location as FhirLocation
} from '@opencrvs/commons/types'
import { fetchFromHearth, sendToFhir } from '@config/services/hearth'

export enum Code {
  CRVS_OFFICE = 'CRVS_OFFICE',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE',
  HEALTH_FACILITY = 'HEALTH_FACILITY'
}

export enum JurisdictionType {
  STATE = 'STATE',
  DISTRICT = 'DISTRICT',
  LOCATION_LEVEL_1 = 'LOCATION_LEVEL_1',
  LOCATION_LEVEL_2 = 'LOCATION_LEVEL_2'
}

enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum ExtensionUrl {
  MALE_POPULATION = 'http://opencrvs.org/specs/id/statistics-male-populations',
  FEMALE_POPULATION = 'http://opencrvs.org/specs/id/statistics-female-populations',
  TOTAL_POPULATION = 'http://opencrvs.org/specs/id/statistics-total-populations',
  CRUDE_BIRTH_RATE = 'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
}

export type Statistics = Array<Record<number, number>>

export type LocationStatistic = {
  year: number
  male_population: number
  female_population: number
  population: number
  crude_birth_rate: number
}

export type Location = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  alias?: string
  jurisdictionType: string
  statistics?: LocationStatistic[]
}

export type Facility = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  alias?: string
  jurisdictionType?: string
}

type UpdateLocation = {
  name?: string
  alias?: string
  status?: string
  statistics?: LocationStatistic
}

const locationStatisticSchema = Joi.object({
  year: Joi.number().required(),
  male_population: Joi.number().required(),
  female_population: Joi.number().required(),
  population: Joi.number().required(),
  crude_birth_rate: Joi.number().required()
}).label('YearStatistics')

function instanceOfJurisdiction(object: any): object is Location {
  return 'statistics' in object
}

const locationRequestSchema = Joi.object({
  statisticalID: Joi.string().required(),
  name: Joi.string().required(),
  alias: Joi.string().optional(),
  partOf: Joi.string().required(),
  code: Joi.string()
    .valid(Code.ADMIN_STRUCTURE, Code.CRVS_OFFICE, Code.HEALTH_FACILITY)
    .required(),
  jurisdictionType: Joi.string()
    .valid(JurisdictionType.DISTRICT, JurisdictionType.STATE)
    .regex(/^LOCATION_LEVEL_\d+$/)
    .optional(),
  statistics: Joi.array()
    .items(locationStatisticSchema)
    .optional()
    .label('Statistics')
}).label('LocationPayload')

export const requestSchema = Joi.alternatives().try(
  locationRequestSchema,
  Joi.array().items(locationRequestSchema)
)

export const locationQuerySchema = Joi.object({
  type: Joi.string().valid(
    Code.ADMIN_STRUCTURE,
    Code.CRVS_OFFICE,
    Code.HEALTH_FACILITY
  ),
  identifier: Joi.string().regex(/^[a-zA-Z0-9_]+$/),
  name: Joi.string().regex(/^[a-zA-Z0-9_,.\s]+$/),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE),
  _count: Joi.number()
}).or('type', 'identifier')

export const updateSchema = Joi.object({
  name: Joi.string().optional(),
  alias: Joi.string().optional(),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE).optional(),
  statistics: locationStatisticSchema.optional()
}).label('UpdateLocationPayload')

export const requestParamsSchema = Joi.object({
  locationId: Joi.string().uuid()
})

const LOCATION_CHUNK_SIZE = 400

export async function fetchLocationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const searchParam = request.url.search
  const response = await fetchFromHearth<Saved<Bundle>>(
    `Location${searchParam}`
  )

  response.link = response.link?.map((link) => ({
    ...link,
    url: link.url
      .replace(link.url.split('/Location')[0], `${request.url.origin}`)
      .replace('Location', 'location')
  }))

  response.entry = response.entry?.map((entry) => ({
    ...entry,
    fullUrl: entry.fullUrl
      ?.replace(entry.fullUrl.split('/Location')[0], `${request.url.origin}`)
      .replace('Location', 'location') as URLReference
  }))

  return response
}

function createChunks<T>(array: T[], limit: number): T[][] {
  const result = []
  for (let i = 0; i < array.length; i += limit) {
    result.push(array.slice(i, i + limit))
  }
  return result
}

function createLocationSegments(locations: Location[]): Location[][] {
  const segments = []
  for (const jurisdictionType of Object.keys(JurisdictionType)) {
    const jurisdictionLocations = locations.filter(
      (loc) => loc.jurisdictionType === jurisdictionType
    )
    if (jurisdictionLocations.length) {
      segments.push(...createChunks(jurisdictionLocations, LOCATION_CHUNK_SIZE))
    }
  }
  const facilitiesOrOffices = locations.filter((loc) => !loc.jurisdictionType)
  if (facilitiesOrOffices.length) {
    segments.push(...createChunks(facilitiesOrOffices, LOCATION_CHUNK_SIZE))
  }
  return segments
}

async function batchLocationsHandler(
  locations: Location[]
): Promise<fhir3.Bundle> {
  let statisticalToFhirIDMapOfParentLocations: Map<string, string> = new Map()
  const locationSegments = createLocationSegments(locations)
  const cumulativeResponse = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [] as fhir3.BundleEntry[]
  } satisfies fhir3.Bundle
  for (const each of locationSegments) {
    const locationsBundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: each
        .map((location) => ({
          ...location,
          // partOf is either Location/{fhirID} of another location or 'Location/0'
          partOf:
            statisticalToFhirIDMapOfParentLocations?.get(
              location.partOf.split('/')[1]
            ) ?? location.partOf
        }))
        .map(
          (location): BundleEntry<FhirLocation> => ({
            fullUrl: `urn:uuid:${uuid()}`,
            resource: {
              ...composeFhirLocation(location),
              ...(location.statistics && {
                extension: generateStatisticalExtensions(location.statistics)
              })
            }
          })
        )
    }
    const res = await fetchFromHearth(
      '',
      'POST',
      JSON.stringify(locationsBundle)
    )
    statisticalToFhirIDMapOfParentLocations = new Map(
      Array.from(statisticalToFhirIDMapOfParentLocations.entries()).concat(
        each.map((loc, i) => [
          loc.statisticalID,
          'Location/' + res?.entry?.[i]?.response?.location?.split('/')?.[3]
        ])
      )
    )
    cumulativeResponse.entry = cumulativeResponse.entry.concat(res.entry)
  }
  return cumulativeResponse
}

export async function createLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  if (Array.isArray(request.payload)) {
    return batchLocationsHandler(request.payload as Location[])
  }
  const payload = request.payload as Location | Facility
  const newLocation = composeFhirLocation(payload)
  const partOfLocation = payload.partOf.split('/')[1]

  const locations = [
    ...(await Promise.all([
      getLocationsByIdentifier(
        `${Code.ADMIN_STRUCTURE}_${String(payload.statisticalID)}`
      ),
      getLocationsByIdentifier(
        `${Code.CRVS_OFFICE}_${String(payload.statisticalID)}`
      ),
      getLocationsByIdentifier(
        `${Code.HEALTH_FACILITY}_${String(payload.statisticalID)}`
      )
    ]).then((results) => results.flat()))
  ]

  if (locations.length !== 0) {
    throw conflict(`statisticalID ${payload.statisticalID} already exists`)
  }

  if (partOfLocation !== '0' && Boolean(partOfLocation)) {
    const response = await fetchFromHearth(`Location?_id=${partOfLocation}`)

    if (response.total === 0) {
      throw badRequest(
        `${partOfLocation} is not a valid location for partOfLocation`
      )
    }
  }

  if (instanceOfJurisdiction(payload) && payload.statistics) {
    const statisticalExtensions = generateStatisticalExtensions(
      payload.statistics
    )
    newLocation.extension = statisticalExtensions
  }

  const response = await sendToFhir(
    JSON.stringify(newLocation),
    '/Location',
    'POST',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot create location to FHIR')
  })

  return h.response(response.statusText)
}

export async function updateLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const locationId = request.params.locationId
  const location = request.payload as UpdateLocation
  const existingLocation = await fetchFromHearth(`Location?_id=${locationId}`)
  const newLocation = existingLocation.entry[0].resource

  if (existingLocation.total === 0) {
    throw badRequest(`${locationId} is not a valid location`)
  }

  if (location.name) {
    newLocation.name = location.name
  }
  if (location.alias) {
    newLocation.alias = [location.alias]
  }
  if (location.status) {
    newLocation.status = location.status
  }
  if (location.statistics) {
    const statisticalExtensions = updateStatisticalExtensions(
      location.statistics,
      newLocation.extension
    )
    newLocation.extension = statisticalExtensions
  }

  const response = await sendToFhir(
    JSON.stringify(newLocation),
    `/Location/${locationId}`,
    'PUT',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot update location to FHIR')
  })

  return h.response(response.statusText)
}
