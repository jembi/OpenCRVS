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
  CompositionSectionCode,
  Encounter,
  Extension,
  findCompositionSection,
  findResourceFromBundleById,
  getComposition,
  getFromBundleById,
  KnownExtensionType,
  Location,
  OpenCRVSPatientName,
  Resource,
  resourceIdentifierToUUID,
  SavedBundle,
  SavedComposition,
  SavedLocation,
  SavedTask,
  TaskHistory,
  SearchDocument
} from '@opencrvs/commons/types'
import { FHIR_URL } from '@search/constants'
import { logger } from '@opencrvs/commons'
import fetch from 'node-fetch'

export function findTaskExtension<
  T extends keyof KnownExtensionType,
  Task extends TaskHistory | SavedTask
>(task: Task, extensionUrl: T) {
  return task.extension.find(
    (ext): ext is KnownExtensionType[T] => ext.url === extensionUrl
  )
}

export function findExtension<T extends keyof KnownExtensionType>(
  url: T,
  extensions: Extension[] | undefined
) {
  const extension =
    extensions &&
    extensions.find((obj): obj is KnownExtensionType[T] => {
      return obj.url === url
    })
  return extension
}

export function findTaskIdentifier(task?: SavedTask, identiferSystem?: string) {
  return (
    task &&
    task.identifier &&
    task.identifier.find((identifier) => identifier.system === identiferSystem)
  )
}

export function findEntry<T extends Resource = Resource>(
  code: CompositionSectionCode,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return undefined
  }
  const reference = patientSection.entry[0].reference
  return getFromBundleById<T>(bundle, reference!.split('/')[1]).resource
}

export function addEventLocation(
  bundle: SavedBundle,
  body: SearchDocument,
  code: Extract<
    CompositionSectionCode,
    'birth-encounter' | 'death-encounter' | 'marriage-encounter'
  >
) {
  const composition = getComposition(bundle)

  const encounterSection = findCompositionSection(code, composition)

  if (!encounterSection) {
    return
  }

  const encounter = findResourceFromBundleById<Encounter>(
    bundle,
    resourceIdentifierToUUID(encounterSection.entry[0].reference)
  )

  if (!encounter || !encounter.location) {
    return
  }

  const location = findResourceFromBundleById<Location>(
    bundle,
    resourceIdentifierToUUID(encounter.location[0].location.reference)
  )

  if (!location) {
    return
  }

  const isLocationHealthFacility = location.type?.coding?.some(
    (obCode) => obCode.code === 'HEALTH_FACILITY'
  )

  if (isLocationHealthFacility) {
    body.eventLocationId = location.id
    return
  }

  if (location.address?.country) {
    body.eventCountry = location.address.country
  }

  body.eventJurisdictionIds = [
    location.address?.state, //eventLocationLevel1
    location.address?.district, //eventLocationLevel2
    ...(location.address?.line?.slice(10) || []) //eventLocationLevel3+
  ].filter((maybeString): maybeString is string => Boolean(maybeString))
}

export function findEntryResourceByUrl<T extends fhir.Resource = fhir.Resource>(
  url?: string,
  bundleEntries?: fhir.BundleEntry[]
): T | undefined {
  const bundleEntry =
    bundleEntries &&
    bundleEntries.find((obj: fhir.BundleEntry) => obj.fullUrl === url)
  return bundleEntry && (bundleEntry.resource as T)
}
export function findName(
  code: string,
  names: fhir.HumanName[] | undefined
): fhir.HumanName | undefined
export function findName(
  code: string,
  names: OpenCRVSPatientName[] | undefined
): OpenCRVSPatientName | undefined
export function findName(
  code: string,
  names: (OpenCRVSPatientName | fhir.HumanName)[] | undefined
) {
  return names && names.find((name) => name.use === code)
}

export function findNameLocale(
  names: fhir.HumanName[] | undefined
): fhir.HumanName | undefined
export function findNameLocale(
  names: OpenCRVSPatientName[] | undefined
): OpenCRVSPatientName | undefined
export function findNameLocale(
  names: (OpenCRVSPatientName | fhir.HumanName)[] | undefined
) {
  return names && names.find((name) => name.use !== 'en')
}

async function getFromFhir<T>(suffix: string): Promise<T> {
  const response = await fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!response.ok) {
    throw new Error(
      `FHIR request failed: code [${
        response.status
      }] body: ${await response.text()}`
    )
  }
  return await response.json()
}

export async function fetchParentLocationByLocationID(locationID: string) {
  const location = await getFromFhir<SavedLocation>(`/${locationID}`)
  return location.partOf?.reference
}

export function updateCompositionBodyWithDuplicateIds(
  composition: SavedComposition,
  body: SearchDocument
) {
  const duplicates =
    composition.relatesTo?.filter((rel) => rel.code === 'duplicate') || []
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Search/service:birth: ${duplicates.length} duplicate composition(s) found`
  )
  body.relatesTo = duplicates.map((rel) =>
    resourceIdentifierToUUID(rel.targetReference.reference)
  )
}
