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
import React from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { LocationSearch as LocationSearchComponent } from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons/client'
// eslint-disable-next-line no-restricted-imports
import { getOfflineData } from '@client/offline/selectors'
import { getListOfLocations } from '@client/utils/validate'
import { generateLocations } from '@client/utils/locationUtils'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

function useAdminLocations(
  searchableResource: ('locations' | 'facilities' | 'offices')[]
) {
  const offlineCountryConfig = useSelector(getOfflineData)
  const intl = useIntl()
  const locationList = generateLocations(
    searchableResource.reduce((locations, resource) => {
      return {
        ...locations,
        ...getListOfLocations(offlineCountryConfig, resource)
      }
    }, {}),
    intl
  )

  return locationList
}

function LocationSearchInput({
  setFieldValue,
  value,
  searchableResource,
  ...props
}: FieldProps<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  setFieldValue: (name: string, val: string | undefined) => void
  searchableResource: ('locations' | 'facilities' | 'offices')[]
  value?: string
}) {
  const locationList = useAdminLocations(searchableResource)
  const selectedLocation = locationList.find(
    (location) => location.id === value
  )

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      locationList={locationList}
      searchHandler={(location: SearchLocation) =>
        setFieldValue(props.id, location.id)
      }
      selectedLocation={selectedLocation}
      {...props}
    />
  )
}

export const LocationSearch = {
  Input: LocationSearchInput,
  Output: null
}
