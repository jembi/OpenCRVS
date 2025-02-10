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
import { IAuthHeader } from '@metrics/features/registration'
import {
  fetchLocation,
  fetchPractitionerRole,
  fetchTaskHistory
} from '@metrics/api'

export const CAUSE_OF_DEATH_CODE = 'ICD10'
export const MANNER_OF_DEATH_CODE = 'uncertified-manner-of-death'
import { NOTIFICATION_TYPES } from '@metrics/features/metrics/constants'
import {
  isURLReference,
  URLReference,
  urlReferenceToResourceIdentifier
} from '@opencrvs/commons/types'

export function getSectionBySectionCode(
  bundle: fhir.Bundle,
  sectionCode: string
): fhir.Patient {
  const composition: fhir.Composition = getResourceByType(
    bundle,
    FHIR_RESOURCE_TYPE.COMPOSITION
  ) as fhir.Composition
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some((coding) => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(`No section found for given code: ${sectionCode}`)
  }
  const sectionRef = personSection.entry[0].reference
  const personEntry =
    bundle.entry &&
    bundle.entry.find((entry: any) => entry.fullUrl?.includes(sectionRef))

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}
function isTaskResource(resource: fhir.Resource): resource is fhir.Task {
  return resource.resourceType === 'Task'
}

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const DOWNLOADED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded`
export const MAKE_CORRECTION_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/makeCorrection`

export const enum GQLRegStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED',
  DECLARED = 'DECLARED',
  DECLARATION_UPDATED = 'DECLARATION_UPDATED',
  WAITING_VALIDATION = 'WAITING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED',
  REQUESTED_CORRECTION = 'REQUESTED_CORRECTION',
  DOWNLOADED = 'DOWNLOADED'
}

export type DECLARATION_STATUS =
  | 'IN_PROGRESS'
  | 'DECLARED'
  | 'REGISTERED'
  | 'VALIDATED'
  | 'WAITING_VALIDATION'
  | 'REJECTED'
  | 'CORRECTION_REQUESTED'
  | 'CERTIFIED'
  | 'ISSUED'

export type USER_ACTION =
  | 'LOGGED_IN'
  | 'LOGGED_OUT'
  | 'PHONE_NUMBER_CHANGED'
  | 'EMAIL_ADDRESS_CHANGED'
  | 'PASSWORD_CHANGED'
  | 'DEACTIVATE'
  | 'REACTIVATE'
  | 'EDIT_USER'
  | 'CREATE_USER'
  | 'PASSWORD_RESET'
  | 'USERNAME_REMINDER'
  | 'USERNAME_REMINDER_BY_ADMIN'
  | 'PASSWORD_RESET_BY_ADMIN'

export type DECLARATION_TYPE = 'BIRTH' | 'DEATH' | 'MARRIAGE'

function findPreviousTask(
  historyResponseBundle: fhir.Bundle,
  allowedPreviousStates: DECLARATION_STATUS[]
) {
  const allTasks = findAllPreviousTasks(historyResponseBundle)

  const task =
    allTasks &&
    allTasks.find((resource) => {
      if (!resource.businessStatus || !resource.businessStatus.coding) {
        return false
      }
      return resource.businessStatus.coding.some((coding) =>
        allowedPreviousStates.includes(coding.code as DECLARATION_STATUS)
      )
    })

  if (!task) {
    return null
  }
  return task as fhir.Task
}

function findAllPreviousTasks(historyResponseBundle: fhir.Bundle) {
  const task =
    historyResponseBundle.entry &&
    historyResponseBundle.entry
      .map((entry) => entry.resource)
      .filter((resource): resource is fhir.Task =>
        Boolean(resource && isTaskResource(resource))
      )

  if (!task) {
    return null
  }
  return task as fhir.Task[]
}

export function getPaymentReconciliation(
  bundle: fhir.Bundle,
  task?: fhir.Task
) {
  if (task) {
    const paymentDetailsReference = task.extension?.find((x) =>
      x.url.includes('paymentDetails')
    )?.valueReference?.reference

    const paymentReconciliation = bundle.entry?.find(
      (x) =>
        x.fullUrl &&
        (isURLReference(x.fullUrl)
          ? urlReferenceToResourceIdentifier(x.fullUrl as URLReference)
          : x.fullUrl) === paymentDetailsReference
    )?.resource

    if (paymentReconciliation)
      return paymentReconciliation as fhir.PaymentReconciliation
  }

  return getResourceByType<fhir.PaymentReconciliation>(
    bundle,
    FHIR_RESOURCE_TYPE.PAYMENT_RECONCILIATION
  )
}

export function getTask(bundle: fhir.Bundle) {
  return getResourceByType<fhir.Task>(bundle, FHIR_RESOURCE_TYPE.TASK)
}
export function getDownloadedExtensionStatus(task: fhir.Task) {
  const extension =
    task.extension && findExtension(DOWNLOADED_EXTENSION_URL, task.extension)
  return extension?.valueString
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension =
    extensions &&
    extensions.find((obj: fhir.Extension) => {
      return obj.url === url
    })
  return extension
}

export function getComposition(bundle: fhir.Bundle) {
  return getResourceByType<fhir.Composition>(
    bundle,
    FHIR_RESOURCE_TYPE.COMPOSITION
  )
}

export function getCompositionIdFromCompositionOrTask(bundle: fhir.Bundle) {
  const composition = getComposition(bundle)

  if (composition) {
    return composition.id
  }

  const task = getTask(bundle)
  return task?.focus?.reference?.split('/')[1]
}

export function hasRequestCorrectionExtension(task: fhir.Task) {
  const extension =
    task.extension &&
    findExtension(MAKE_CORRECTION_EXTENSION_URL, task.extension)
  return extension
}

export async function getPreviousTask(
  task: fhir.Task,
  allowedPreviousStates: DECLARATION_STATUS[],
  authHeader: IAuthHeader
) {
  const taskHistory = await fetchTaskHistory(task.id!, authHeader)
  return findPreviousTask(taskHistory, allowedPreviousStates)
}

export function getPractitionerIdFromBundle(bundle: fhir.Bundle) {
  const task = getTask(bundle)
  if (!task) {
    throw new Error('Task not found in bundle')
  }
  return getPractionerIdFromTask(task)
}

export function getActionFromTask(task: fhir.Task) {
  const businessStatus = getStatusFromTask(task)
  const extensionStatusWhileDownloaded = getDownloadedExtensionStatus(task)
  if (businessStatus === extensionStatusWhileDownloaded) {
    return GQLRegStatus.DOWNLOADED
  } else if (hasRequestCorrectionExtension(task)) {
    return GQLRegStatus.REQUESTED_CORRECTION
  }
  return businessStatus
}

export function getStatusFromTask(task: fhir.Task) {
  const statusType = task.businessStatus?.coding?.find(
    (coding: fhir.Coding) =>
      coding.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
  )
  return statusType && statusType.code
}

export function getPractionerIdFromTask(task: fhir.Task) {
  return task?.extension
    ?.find(
      (ext) => ext.url === 'http://opencrvs.org/specs/extension/regLastUser'
    )
    ?.valueReference?.reference?.split('/')?.[1]
}

export function getDeclarationStatus(
  task: fhir.Task
): DECLARATION_STATUS | null {
  if (!task.businessStatus || !task.businessStatus.coding) {
    return null
  }

  const coding = task.businessStatus.coding.find(
    ({ system }) => system === 'http://opencrvs.org/specs/reg-status'
  )
  if (!coding) {
    return null
  }
  return coding.code as DECLARATION_STATUS
}

export function getTrackingId(task: fhir.Task) {
  const trackingIdentifier = task?.identifier?.find((identifier) => {
    return (
      identifier.system === `http://opencrvs.org/specs/id/birth-tracking-id` ||
      identifier.system === `http://opencrvs.org/specs/id/death-tracking-id` ||
      identifier.system === `http://opencrvs.org/specs/id/marriage-tracking-id`
    )
  })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export function getDeclarationType(task: fhir.Task): DECLARATION_TYPE {
  const coding = task.code?.coding?.find(
    ({ system }) => system === 'http://opencrvs.org/specs/types'
  )
  if (!coding) {
    throw new Error('No declaration type found in task')
  }
  return coding.code as DECLARATION_TYPE
}

export function getRecordInitiator(taskHistory: fhir.Bundle): string {
  const allowedPreviousStates = [
    'DECLARED',
    'VALIDATED',
    'IN_PROGRESS',
    'WAITING_VALIDATION'
  ]
  const previousTasks = findAllPreviousTasks(taskHistory)

  const task =
    previousTasks &&
    previousTasks
      .sort((a, b) => {
        if (!a.meta?.lastUpdated || !b.meta?.lastUpdated) {
          return -1
        }
        if (a.meta.lastUpdated > b.meta.lastUpdated) {
          return 1
        }
        if (a.meta.lastUpdated < b.meta.lastUpdated) {
          return -1
        }
        return 0
      })
      .find((resource) => {
        if (!resource.businessStatus || !resource.businessStatus.coding) {
          return false
        }
        return resource.businessStatus.coding.some((coding) =>
          allowedPreviousStates.includes(coding.code as DECLARATION_STATUS)
        )
      })

  if (!task) {
    throw new Error('Task not found!')
  }

  const regLastUserExtension =
    task &&
    task.extension &&
    task.extension.find(
      (extension) =>
        extension.url === 'http://opencrvs.org/specs/extension/regLastUser'
    )

  const regLastUser =
    regLastUserExtension &&
    regLastUserExtension.valueReference &&
    (regLastUserExtension.valueReference.reference as string)

  return regLastUser?.split('/')?.[1] || ''
}

export function getRegLastOffice(bundle: fhir.Bundle) {
  const task: fhir.Task = getResourceByType(
    bundle,
    FHIR_RESOURCE_TYPE.TASK
  ) as fhir.Task
  if (!task) {
    throw new Error('Task not found!')
  }
  const regLastOffice =
    task.extension &&
    task.extension.find(
      (extension) =>
        extension.url === 'http://opencrvs.org/specs/extension/regLastOffice'
    )

  return (
    regLastOffice &&
    regLastOffice.valueReference &&
    regLastOffice.valueReference.reference
  )
}
export async function getEncounterLocationType(
  bundle: fhir.Bundle,
  authHeader: IAuthHeader
) {
  const encounter = getResourceByType<fhir.Encounter>(
    bundle,
    FHIR_RESOURCE_TYPE.ENCOUNTER
  )

  if (!encounter) {
    throw new Error('Encounter not found!')
  }

  const locationId = encounter.location?.[0].location.reference
  if (!locationId) {
    throw new Error('Encounter location not found!')
  }

  const location = await fetchLocation(locationId, authHeader)
  if (!location || !location.type) {
    throw new Error(
      `Encounter location not found from Hearth with id ${locationId}!`
    )
  }
  const type = location.type.coding?.[0]?.code

  if (!type) {
    throw new Error(
      `Encounter location was found from Hearth with id ${locationId}, but the location did not have a proper type code`
    )
  }
  return type
}

export function getResourceByType<T = fhir.Resource>(
  bundle: fhir.Bundle,
  type: string
): T | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find((entry) => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === type
      }
    })
  return bundleEntry && (bundleEntry.resource as T)
}

export enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task',
  ENCOUNTER = 'Encounter',
  PAYMENT_RECONCILIATION = 'PaymentReconciliation'
}

export function getTimeLoggedFromTask(task: fhir.Task) {
  if (!task.extension) {
    throw new Error(`Task has no extensions defined, task ID: ${task.id}`)
  }

  const timeLoggedExt = task.extension.find(
    (ext) => ext.url === 'http://opencrvs.org/specs/extension/timeLoggedMS'
  )

  if (!timeLoggedExt || timeLoggedExt.valueInteger === undefined) {
    throw new Error(
      `No time logged extension found in task, task ID: ${task.id}`
    )
  }

  return timeLoggedExt.valueInteger
}

export function isNotification(composition: fhir.Composition): boolean {
  const compositionTypeCode =
    composition.type.coding &&
    composition.type.coding.find(
      (code) => code.system === 'http://opencrvs.org/doc-types'
    )
  if (!compositionTypeCode) {
    throw new Error('Composition has no type codings defined')
  }

  return (
    (compositionTypeCode.code &&
      NOTIFICATION_TYPES.includes(compositionTypeCode.code)) ||
    false
  )
}

export function getObservationValueByCode(
  bundle: fhir.Bundle,
  observationCode: string
): string {
  const observationBundle =
    bundle.entry &&
    bundle.entry.filter((item) => {
      return (
        item && item.resource && item.resource.resourceType === 'Observation'
      )
    })
  if (!Array.isArray(observationBundle) || !observationBundle.length) {
    return 'UNKNOWN'
  }
  const selectedObservationEntry = observationBundle.find((entry) => {
    const observationEntry = entry.resource as fhir.Observation
    return (
      (observationEntry.code &&
        observationEntry.code.coding &&
        observationEntry.code.coding[0] &&
        observationEntry.code.coding[0].code === observationCode) ||
      null
    )
  })
  if (!selectedObservationEntry) {
    return 'UNKNOWN'
  }
  const observationResource =
    selectedObservationEntry.resource as fhir.Observation
  const value =
    (observationResource.valueCodeableConcept &&
      observationResource.valueCodeableConcept.coding &&
      observationResource.valueCodeableConcept.coding[0] &&
      observationResource.valueCodeableConcept.coding[0].code) ||
    'UNKNOWN'

  return value
}

export async function fetchDeclarationsBeginnerRole(
  fhirBundle: fhir.Bundle,
  authHeader: IAuthHeader
) {
  let startedByRole = ''
  const currentTask = getTask(fhirBundle)

  if (currentTask) {
    const bundle = await fetchTaskHistory(currentTask.id!, authHeader)
    const length = bundle.entry ? bundle.entry.length : 0
    const task =
      bundle.entry &&
      bundle.entry
        .map((entry) => entry.resource)
        .filter((resource): resource is fhir.Task =>
          Boolean(resource && isTaskResource(resource))
        )

    if (task && length > 0) {
      const startedTask = task[length - 1] //the last task in the entries of history bundle
      const practitionerId = getPractionerIdFromTask(startedTask)
      if (!practitionerId) {
        throw new Error('Practitioner id not found')
      }
      startedByRole = await fetchPractitionerRole(practitionerId, authHeader)
    }
  }
  return startedByRole
}
