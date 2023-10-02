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
import { IAuthHeader } from '@gateway/common-types'
import {
  EVENT_TYPE,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  ASSIGNED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  REQUEST_CORRECTION_EXTENSION_URL,
  VIEWED_EXTENSION_URL,
  OPENCRVS_SPECIFICATION_URL,
  MARKED_AS_NOT_DUPLICATE,
  MARKED_AS_DUPLICATE,
  DUPLICATE_TRACKING_ID,
  VERIFIED_EXTENSION_URL,
  FLAGGED_AS_POTENTIAL_DUPLICATE
} from '@gateway/features/fhir/constants'
import {
  fetchFHIR,
  getDeclarationIdsFromResponse,
  getIDFromResponse,
  getCompositionIdFromResponse,
  removeDuplicatesFromComposition,
  getDeclarationIds,
  getStatusFromTask,
  setCertificateCollector
} from '@gateway/features/fhir/utils'
import {
  buildFHIRBundle,
  updateFHIRTaskBundle,
  ITaskBundle,
  checkUserAssignment,
  taskBundleWithExtension
} from '@gateway/features/registration/fhir-builders'
import { hasScope, inScope } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput,
  GQLRegStatus,
  GQLResolver,
  GQLStatusWiseRegistrationCount
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { AUTH_URL, COUNTRY_CONFIG_URL, SEARCH_URL } from '@gateway/constants'
import { UnassignError } from '@gateway/utils/unassignError'
import { UserInputError } from 'apollo-server-hapi'
import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments,
  validateMarriageDeclarationAttachments
} from '@gateway/utils/validators'

async function getAnonymousToken() {
  const res = await fetch(new URL('/anonymous-token', AUTH_URL).toString())
  const { token } = await res.json()
  return token
}

export const resolvers: GQLResolver = {
  RecordDetails: {
    __resolveType(obj): any {
      if (!obj?.type?.text) return 'BirthRegistration'
      if (obj.type.text == 'Birth Declaration') return 'BirthRegistration'
      if (obj.type.text == 'Death Declaration') return 'DeathRegistration'
    }
  },
  Query: {
    async searchBirthRegistrations(
      _,
      { fromDate, toDate },
      { headers: authHeader }
    ) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'birth-declaration')
      )
    },
    async searchDeathRegistrations(
      _,
      { fromDate, toDate },
      { headers: authHeader }
    ) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'death-declaration')
      )
    },
    async fetchBirthRegistration(_, { id }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedOrAssigned(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchDeathRegistration(_, { id }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedOrAssigned(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchMarriageRegistration(_, { id }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedOrAssigned(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async queryRegistrationByIdentifier(
      _,
      { identifier },
      { headers: authHeader }
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = await fetchFHIR(
          `/Task?identifier=${identifier}`,
          authHeader
        )

        if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
          throw new Error(`Task does not exist for identifer ${identifier}`)
        }
        const task = taskBundle.entry[0].resource as fhir.Task

        if (!task.focus || !task.focus.reference) {
          throw new Error(`Composition reference not found`)
        }

        return await fetchFHIR(`/${task.focus.reference}`, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchRegistration(_, { id }, { headers: authHeader }) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async fetchRegistrationForViewing(_, { id }, { headers: authHeader }) {
      const taskEntry = await getTaskEntry(id, authHeader)
      const extension = { url: VIEWED_EXTENSION_URL }
      const taskBundle = taskBundleWithExtension(taskEntry, extension)

      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))
      return fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async queryPersonByIdentifier(_, { identifier }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const personBundle = await fetchFHIR(
          `/Patient?identifier=${identifier}`,
          authHeader
        )
        if (!personBundle || !personBundle.entry || !personBundle.entry[0]) {
          throw new Error(`Person does not exist for identifer ${identifier}`)
        }
        const person = personBundle.entry[0].resource as fhir.Person

        return person
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async queryPersonByNidIdentifier(
      _,
      { dob, nid, country },
      { headers: authHeader }
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const response = await fetch(
          `${COUNTRY_CONFIG_URL}/verify/nid/${country}`,
          {
            method: 'POST',
            body: JSON.stringify({ dob, nid }),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        if (!response.operationResult.success) {
          throw new Error(response.operationResult.error.errorMessage)
        } else {
          return response.data
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRegistrationCountByStatus(
      _,
      { locationId, status, event },
      { headers: authHeader }
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare') ||
        hasScope(authHeader, 'sysadmin') ||
        hasScope(authHeader, 'performance')
      ) {
        const payload: {
          declarationJurisdictionId?: string
          status: string[]
          event?: string
        } = {
          declarationJurisdictionId: locationId,
          status: status as string[],
          event
        }

        const results: GQLStatusWiseRegistrationCount[] = await fetch(
          `${SEARCH_URL}statusWiseRegistrationCount`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        let total = 0
        if (results && results.length > 0) {
          total = results.reduce(
            (totalCount, statusCount) => ({
              count: totalCount.count + statusCount.count
            }),
            {
              count: total
            }
          ).count
        }
        return {
          results,
          total
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRecordDetailsForVerification(_, { id }, { headers }) {
      try {
        const token = await getAnonymousToken()
        headers.Authorization = `Bearer ${token}`
        const authHeader = {
          Authorization: headers.Authorization
        }
        const taskEntry = await getTaskEntry(id, authHeader)

        const taskBundle = taskBundleWithExtension(taskEntry, {
          url: VERIFIED_EXTENSION_URL,
          valueString: headers['x-real-ip']
        })
        await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))

        const record = await fetchFHIR(`/Composition/${id}`, authHeader)
        if (!record) {
          await Promise.reject(new Error('Invalid QrCode'))
        }
        return record
      } catch (e) {
        await Promise.reject(new Error(e))
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateBirthDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.BIRTH)
    },
    async createDeathRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateDeathDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.DEATH)
    },
    async createMarriageRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateMarriageDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.MARRIAGE)
    },
    async updateBirthRegistration(_, { details }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH, authHeader)

        const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
        // return composition-id
        return getIDFromResponse(res)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.BIRTH,
          details
        )
      }
    },
    async markDeathAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      }
      return await markEventAsValidated(
        id,
        authHeader,
        EVENT_TYPE.DEATH,
        details
      )
    },
    async markMarriageAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.MARRIAGE,
          details
        )
      }
    },
    async markBirthAsRegistered(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.BIRTH, details)
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markDeathAsRegistered(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return await markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.DEATH,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markMarriageAsRegistered(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.MARRIAGE,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsVoided(
      _,
      { id, reason, comment },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        GQLRegStatus.REJECTED,
        reason,
        comment
      )

      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))

      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsArchived(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        GQLRegStatus.ARCHIVED,
        reason,
        comment,
        duplicateTrackingId
      )
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsReinstated(_, { id }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)

      const taskId = taskEntry.resource.id

      const prevRegStatus =
        taskId && (await getPreviousRegStatus(taskId, authHeader))
      if (!prevRegStatus) {
        return await Promise.reject(new Error('Task has no reg-status code'))
      }

      taskEntry.resource.extension = [
        ...(taskEntry.resource.extension ?? []),
        { url: REINSTATED_EXTENSION_URL }
      ]

      const newTaskBundle = await updateFHIRTaskBundle(taskEntry, prevRegStatus)

      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))

      return {
        taskEntryResourceID: taskId,
        registrationStatus: prevRegStatus
      }
    },
    async markBirthAsCertified(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.BIRTH)
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markBirthAsIssued(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsIssued(details, authHeader, EVENT_TYPE.BIRTH)
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markDeathAsCertified(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.DEATH)
      } else {
        return await Promise.reject(
          new Error('User does not have a certify scope')
        )
      }
    },
    async markDeathAsIssued(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsIssued(details, authHeader, EVENT_TYPE.DEATH)
      } else {
        return await Promise.reject(
          new Error('User does not have a certify scope')
        )
      }
    },
    async markMarriageAsCertified(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(
          details,
          authHeader,
          EVENT_TYPE.MARRIAGE
        )
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markMarriageAsIssued(_, { id, details }, { headers: authHeader }) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsIssued(details, authHeader, EVENT_TYPE.MARRIAGE)
      } else {
        return await Promise.reject(
          new Error('User does not have a certify scope')
        )
      }
    },
    async markEventAsNotDuplicate(_, { id }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const composition: fhir.Composition = await fetchFHIR(
          `/Composition/${id}`,
          authHeader,
          'GET'
        )
        await removeDuplicatesFromComposition(composition, id)
        const compositionEntry: fhir.BundleEntry = {
          resource: composition
        }

        const taskEntry = await getTaskEntry(id, authHeader)

        const extension: fhir.Extension = { url: MARKED_AS_NOT_DUPLICATE }
        const taskBundle = taskBundleWithExtension(taskEntry, extension)
        const payloadBundle: fhir.Bundle = {
          ...taskBundle,
          entry: [compositionEntry, ...taskBundle.entry]
        }
        await fetchFHIR(
          '/Task',
          authHeader,
          'PUT',
          JSON.stringify(payloadBundle)
        )
        return composition.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsUnassigned(_, { id }, { headers: authHeader }) {
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const taskBundle = taskBundleWithExtension(taskEntry, {
        url: UNASSIGNED_EXTENSION_URL
      })
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsDuplicate(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }

      const taskEntry = await getTaskEntry(id, authHeader)
      const extension: fhir.Extension = { url: MARKED_AS_DUPLICATE }

      if (comment || reason) {
        if (!taskEntry.resource.reason) {
          taskEntry.resource.reason = {
            text: ''
          }
        }

        taskEntry.resource.reason.text = reason || ''
        const statusReason: fhir.CodeableConcept = {
          text: comment
        }
        taskEntry.resource.statusReason = statusReason
      }

      if (duplicateTrackingId) {
        extension.valueString = duplicateTrackingId
      }

      const taskBundle = taskBundleWithExtension(taskEntry, extension)
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))
      return taskEntry.resource.id
    }
  }
}

async function createEventRegistration(
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)
  const draftId =
    details && details.registration && details.registration.draftId

  const existingComposition =
    draftId && (await lookForComposition(draftId, authHeader))

  if (existingComposition) {
    if (hasScope(authHeader, 'register')) {
      return { compositionId: existingComposition }
    } else {
      // return tracking-id
      return await getDeclarationIds(existingComposition, authHeader)
    }
  }
  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  /*
   * Some custom logic added here. If you are a registar and
   * we flagged the declaration as a duplicate, we push the declaration into
   * "Ready for review" queue and not ready to print.
   */
  const hasDuplicates = Boolean(
    doc.entry
      .find((entry) => entry.resource.resourceType === 'Composition')
      ?.resource?.extension?.find(
        (ext) =>
          ext.url === `${OPENCRVS_SPECIFICATION_URL}duplicate` &&
          ext.valueBoolean
      )
  )

  if (hasScope(authHeader, 'register') && !hasDuplicates) {
    // return the registrationNumber
    return await getCompositionIdFromResponse(res, event, authHeader)
  } else {
    // return tracking-id and potential duplicates
    const ids = await getDeclarationIdsFromResponse(res, authHeader)
    return {
      ...ids,
      isPotentiallyDuplicate: hasDuplicates
    }
  }
}

export async function lookForComposition(
  identifier: string,
  authHeader: IAuthHeader
) {
  const taskBundle = await fetchFHIR<fhir.Bundle>(
    `/Task?identifier=${identifier}`,
    authHeader
  )

  const task =
    taskBundle &&
    taskBundle.entry &&
    taskBundle.entry[0] &&
    (taskBundle.entry[0].resource as fhir.Task)

  return (
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]
  )
}

async function markEventAsValidated(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?: any
) {
  let doc
  if (!details) {
    const taskEntry = await getTaskEntry(id, authHeader)

    doc = {
      resourceType: 'Bundle',
      type: 'document',
      entry: taskEntry
    }
  } else {
    doc = await buildFHIRBundle(details, event, authHeader)
  }

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
}

async function markEventAsRegistered(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput
) {
  const doc = await buildFHIRBundle(details, event, authHeader)
  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  // return the full composition
  const composition = await fetchFHIR(`/Composition/${id}`, authHeader, 'GET')

  return composition
}

async function markEventAsCertified(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  await setCertificateCollector(details, authHeader)
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return composition-id
  return getIDFromResponse(res)
}

async function markEventAsIssued(
  details: GQLBirthRegistrationInput | GQLDeathRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)
  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  return getIDFromResponse(res)
}

const ACTION_EXTENSIONS = [
  ASSIGNED_EXTENSION_URL,
  VERIFIED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  REQUEST_CORRECTION_EXTENSION_URL,
  VIEWED_EXTENSION_URL,
  MARKED_AS_NOT_DUPLICATE,
  MARKED_AS_DUPLICATE,
  DUPLICATE_TRACKING_ID,
  FLAGGED_AS_POTENTIAL_DUPLICATE
]

async function getTaskEntry(compositionId: string, authHeader: IAuthHeader) {
  const systemIdentifierUrl = `${OPENCRVS_SPECIFICATION_URL}id/system_identifier`
  const taskBundle: ITaskBundle = await fetchFHIR(
    `/Task?focus=Composition/${compositionId}`,
    authHeader
  )
  const taskEntry = taskBundle.entry[0]
  if (!taskEntry) {
    throw new Error('Task does not exist')
  }
  taskEntry.resource.extension = taskEntry.resource.extension?.filter(
    ({ url }) => !ACTION_EXTENSIONS.includes(url)
  )
  taskEntry.resource.identifier = taskEntry.resource.identifier?.filter(
    ({ system }) => system != systemIdentifierUrl
  )
  return taskEntry
}

function getDownloadedOrAssignedExtension(
  authHeader: IAuthHeader,
  status: string
): fhir.Extension {
  if (
    inScope(authHeader, ['declare', 'recordsearch']) ||
    (hasScope(authHeader, 'validate') && status === GQLRegStatus.VALIDATED)
  ) {
    return {
      url: DOWNLOADED_EXTENSION_URL
    }
  }
  return {
    url: ASSIGNED_EXTENSION_URL
  }
}

async function getPreviousRegStatus(taskId: string, authHeader: IAuthHeader) {
  const taskHistoryBundle: fhir.Bundle = await fetchFHIR(
    `/Task/${taskId}/_history`,
    authHeader
  )

  const taskHistory = taskHistoryBundle.entry?.map((taskEntry) => {
    return taskEntry.resource as fhir.Task
  })

  if (!taskHistory) {
    throw new Error('Task has no history')
  }

  const filteredTaskHistory = taskHistory.filter((task) => {
    return (
      task.businessStatus?.coding &&
      task.businessStatus?.coding[0].code !== 'ARCHIVED'
    )
  })
  return filteredTaskHistory[0] && getStatusFromTask(filteredTaskHistory[0])
}

export async function markRecordAsDownloadedOrAssigned(
  id: string,
  authHeader: IAuthHeader
) {
  const taskEntry = await getTaskEntry(id, authHeader)

  const businessStatus = getStatusFromTask(taskEntry.resource) as GQLRegStatus

  const extension = getDownloadedOrAssignedExtension(authHeader, businessStatus)

  const taskBundle = taskBundleWithExtension(taskEntry, extension)

  await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))
  // return the full composition
  return fetchFHIR(`/Composition/${id}`, authHeader)
}
