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
import { ApiResponse } from '@elastic/elasticsearch'
import {
  postSearch,
  getSupervisoryArea,
  getFHIRLocation,
  getAllLocationIdsInDistrict
} from '@gateway/features/fhir/utils'
import { ISearchCriteria } from '@gateway/features/search/type-resolvers'
import { hasScope, inScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'

// Complete definition of the Search response
interface IShardsResponse {
  total: number
  successful: number
  failed: number
  skipped: number
}

interface IExplanation {
  value: number
  description: string
  details: IExplanation[]
}

export interface ISearchResponse<T> {
  took: number
  timed_out: boolean
  _scroll_id?: string
  _shards: IShardsResponse
  hits: {
    total: { value: number; eq: string }
    max_score: number
    hits: Array<{
      _index: string
      _type: string
      _id: string
      _score: number
      _source: T
      _version?: number
      _explanation?: IExplanation
      fields?: any
      highlight?: any
      inner_hits?: any
      matched_queries?: string[]
      sort?: string[]
    }>
  }
  aggregations?: any
}

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        userId,
        locationIds,
        status,
        type,
        trackingId,
        registrationNumber,
        contactNumber,
        name,
        count,
        skip,
        sortColumn,
        sort = 'desc'
      },
      authHeader
    ) {
      const searchCriteria: ISearchCriteria = {
        sort
      }
      if (locationIds) {
        if (locationIds.length <= 0 || locationIds.includes('')) {
          return await Promise.reject(new Error('Invalid location id'))
        }
        if (locationIds.length === 1) {
          const locationFHIRObject = await getFHIRLocation(
            locationIds[0],
            authHeader
          )
          const supervisesThisArea = getSupervisoryArea(locationFHIRObject)
          if (supervisesThisArea) {
            locationIds = await getAllLocationIdsInDistrict(
              supervisesThisArea,
              authHeader
            )

            searchCriteria.declarationLocationId = locationIds
          } else {
            searchCriteria.declarationLocationId = locationIds[0]
          }
        } else {
          searchCriteria.declarationLocationId = locationIds
        }
      } else if (authHeader && !hasScope(authHeader, 'register')) {
        // Only register scope user can search without locationIds
        return await Promise.reject(new Error('User does not have permission'))
      }
      if (trackingId) {
        searchCriteria.trackingId = trackingId
      }
      if (registrationNumber) {
        searchCriteria.registrationNumber = registrationNumber
      }
      if (contactNumber) {
        searchCriteria.contactNumber = contactNumber
      }
      if (name) {
        searchCriteria.name = name
      }
      if (count) {
        searchCriteria.size = count
      }
      if (skip) {
        searchCriteria.from = skip
      }
      if (status) {
        searchCriteria.status = status as string[]
      }
      if (type) {
        searchCriteria.type = type as string[]
      }
      if (userId) {
        searchCriteria.createdBy = userId
      }
      if (sortColumn) {
        searchCriteria.sortColumn = sortColumn
      }

      const searchResult: ApiResponse<ISearchResponse<any>> = await postSearch(
        authHeader,
        searchCriteria
      )
      return {
        totalItems:
          (searchResult &&
            searchResult.body.hits &&
            searchResult.body.hits.total.value) ||
          0,
        results:
          (searchResult &&
            searchResult.body.hits &&
            searchResult.body.hits.hits) ||
          []
      }
    },
    async getEventsWithProgress(
      _,
      { locationId, count, skip, sort = 'desc', status, type },
      authHeader
    ) {
      if (!inScope(authHeader, ['sysadmin', 'register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'User does not have a sysadmin or register or validate scope'
          )
        )
      }

      const searchCriteria: ISearchCriteria = {
        declarationLocationHirarchyId: locationId,
        sort
      }

      if (count) {
        searchCriteria.size = count
      }
      if (skip) {
        searchCriteria.from = skip
      }

      if (type) {
        searchCriteria.type = type as string[]
      }

      if (status) {
        searchCriteria.status = status as string[]
      }

      const searchResult: ApiResponse<ISearchResponse<any>> = await postSearch(
        authHeader,
        searchCriteria
      )
      return {
        totalItems:
          (searchResult &&
            searchResult.body &&
            searchResult.body.hits &&
            searchResult.body.hits.total.value) ||
          0,
        results:
          (searchResult &&
            searchResult.body &&
            searchResult.body.hits &&
            searchResult.body.hits.hits) ||
          []
      }
    }
  }
}
