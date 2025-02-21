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
  findExtension,
  findResourceFromBundleById,
  getTaskFromSavedBundle,
  KnownExtensionType,
  OPENCRVS_SPECIFICATION_URL,
  ResourceIdentifier,
  resourceIdentifierToUUID,
  SavedBundle,
  WithStrictExtensions
} from '.'
import { UUID } from '..'

export type Address = Omit<fhir3.Address, 'type' | 'extension'> & {
  type?: fhir3.Address['type'] | 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
  extension?: Array<
    KnownExtensionType['http://opencrvs.org/specs/extension/part-of']
  >
}

export type Location = WithStrictExtensions<
  Omit<fhir3.Location, 'address' | 'partOf'> & {
    address?: Address
    partOf?: {
      reference: ResourceIdentifier
    }
  }
>
export type SavedLocation = Omit<Location, 'partOf' | 'id'> & {
  id: UUID
  address?: Address
  partOf?: {
    reference: ResourceIdentifier
  }
}
export type Office = Omit<Location, 'partOf' | 'type'> & {
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type'
        code: 'CRVS_OFFICE'
      }
    ]
  }
  partOf: {
    reference: ResourceIdentifier
  }
}

export type HealthFacility = Omit<Location, 'partOf' | 'type'> & {
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type'
        code: 'HEALTH_FACILITY'
      }
    ]
  }
  partOf: {
    reference: ResourceIdentifier
  }
}

export type SavedOffice = Omit<Office, 'id'> & {
  id: UUID
}

export function findLastOfficeFromSavedBundle<T extends SavedBundle>(
  bundle: T
) {
  const task = getTaskFromSavedBundle(bundle)
  const regLastOfficeExtension = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
    task.extension
  )
  if (!regLastOfficeExtension) {
    throw new Error(
      `regLastOffice extension wasn't found in task in bundle ${bundle.id}`
    )
  }
  const officeId = resourceIdentifierToUUID(
    regLastOfficeExtension.valueReference.reference
  )
  const office = findResourceFromBundleById<SavedOffice>(bundle, officeId)
  if (!office) {
    throw new Error(`Office wasn't found in a saved bundle ${bundle.id}`)
  }
  return office
}

export function findLastOfficeLocationFromSavedBundle<T extends SavedBundle>(
  bundle: T
) {
  const office = findLastOfficeFromSavedBundle(bundle)
  const locationId = resourceIdentifierToUUID(office.partOf.reference)
  const officeLocation = findResourceFromBundleById<SavedOffice>(
    bundle,
    locationId
  )
  if (!officeLocation) {
    throw new Error(
      `Office's location (parent location) wasn't found in a saved bundle ${bundle.id}`
    )
  }
  return officeLocation
}

export function isHealthFacility(
  location: Location
): location is HealthFacility {
  return location.type?.coding?.[0].code === 'HEALTH_FACILITY'
}

export function isOffice(location: Location): location is Office {
  return location.type?.coding?.[0].code === 'CRVS_OFFICE'
}

export function getLocationType(location: Location): string | undefined {
  return location.type?.coding?.[0].code
}
