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
import { badRequest, conflict } from '@hapi/boom'
import { Request } from '@hapi/hapi'
import { getAuthHeader } from '@opencrvs/commons/http'
import {
  BirthRegistration,
  Bundle,
  CertifiedRecord,
  CorrectionRequestedRecord,
  DeathRegistration,
  IssuedRecord,
  MarriageRegistration,
  OpenCRVSPractitionerName,
  RegisteredRecord,
  ValidRecord,
  addTaskToRecord,
  changeState,
  getPractitioner,
  getPractitionerContactDetails,
  getRecordWithoutTasks,
  getTaskFromSavedBundle,
  getTasksInAscendingOrder,
  getTrackingId,
  isCorrectionRequestedTask,
  isTask,
  updateFHIRBundle,
  withOnlyLatestTask
} from '@opencrvs/commons/types'
import { NOTIFICATION_SERVICE_URL } from '@workflow/constants'
import {
  uploadBase64AttachmentsToDocumentsStore,
  uploadBase64ToMinio
} from '@workflow/documents'
import { getEventType } from '@workflow/features/registration/utils'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { getRecordById } from '@workflow/records'
import { createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import {
  toCorrected,
  toCorrectionApproved,
  toCorrectionRejected,
  toCorrectionRequested
} from '@workflow/records/state-transitions'
import {
  ApproveRequestInput,
  CorrectionRejectionInput,
  CorrectionRequestInput
} from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import fetch from 'node-fetch'
import { z } from 'zod'

export function validateRequest<T extends z.ZodType>(
  validator: T,
  payload: unknown
): z.infer<T> {
  try {
    return validator.parse(payload)
  } catch (error) {
    throw badRequest(error.message)
  }
}

export const routes = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/request-correction',
    allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
    action: 'REQUEST_CORRECTION',
    handler: async (request, record): Promise<CorrectionRequestedRecord> => {
      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        request.payload
      )

      const token = getToken(request)

      if (findActiveCorrectionRequest(record)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(token)

      const paymentAttachmentUrl =
        correctionDetails.payment?.attachmentData &&
        (await uploadBase64ToMinio(
          correctionDetails.payment.attachmentData,
          getAuthHeader(request)
        ))

      const proofOfLegalCorrectionAttachments = await Promise.all(
        correctionDetails.attachments.map(async (attachment) => ({
          type: attachment.type,
          url: await uploadBase64ToMinio(
            attachment.data,
            getAuthHeader(request)
          )
        }))
      )

      const recordInCorrectionRequestedState = await toCorrectionRequested(
        record,
        practitioner,
        correctionDetails,
        proofOfLegalCorrectionAttachments,
        paymentAttachmentUrl
      )

      await sendBundleToHearth(recordInCorrectionRequestedState)
      await createNewAuditEvent(recordInCorrectionRequestedState, token)
      await indexBundle(recordInCorrectionRequestedState, token)

      return recordInCorrectionRequestedState
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/reject-correction',
    allowedStartStates: ['CORRECTION_REQUESTED'],
    action: 'REJECT_CORRECTION',
    handler: async (
      request,
      record
    ): Promise<RegisteredRecord | CertifiedRecord | IssuedRecord> => {
      const rejectionDetails = validateRequest(
        CorrectionRejectionInput,
        request.payload
      )

      const correctionRequest = findActiveCorrectionRequest(record)
      if (!correctionRequest) {
        throw conflict(
          'There is no a pending correction request for this record'
        )
      }

      const recordInPreviousStateWithCorrectionRejection =
        await toCorrectionRejected(
          record,
          await getLoggedInPractitionerResource(getToken(request)),
          rejectionDetails
        )

      // Mark previous CORRECTION_REQUESTED task as rejected
      // Reinstate previous REGISTERED / CERTIFIED / ISSUED task
      await sendBundleToHearth(recordInPreviousStateWithCorrectionRejection)

      // This is just for backwards compatibility reasons as a lot of existing code assimes there
      // is only one task in the bundle
      const recordWithOnlyTheNewTask = withOnlyLatestTask(
        recordInPreviousStateWithCorrectionRejection
      )

      await createNewAuditEvent(recordWithOnlyTheNewTask, getToken(request))
      await indexBundle(recordWithOnlyTheNewTask, getToken(request))

      /*
       * Notify the requesting practitioner that the correction request has been approved
       */

      const requestingPractitioner = getPractitioner(
        correctionRequest.requester.agent.reference.split('/')[1],
        record
      )

      const practitionerContacts = getPractitionerContactDetails(
        requestingPractitioner
      )

      await sendNotification(
        'rejectCorrectionRequest',
        practitionerContacts,
        getAuthHeader(request),
        {
          event: 'BIRTH',
          trackingId: getTrackingId(recordWithOnlyTheNewTask)!,
          userFullName: requestingPractitioner.name,
          reason: rejectionDetails.reason
        }
      )

      return recordWithOnlyTheNewTask
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/make-correction',
    allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
    action: 'MAKE_CORRECTION',
    handler: async (request, record): Promise<RegisteredRecord> => {
      const recordInput = request.payload as
        | BirthRegistration
        | DeathRegistration
        | MarriageRegistration

      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        recordInput.registration?.correction
      )
      const token = getToken(request)

      if (findActiveCorrectionRequest(record)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(token)

      const recordInputWithUploadedAttachments =
        await uploadBase64AttachmentsToDocumentsStore(
          recordInput,
          getAuthHeader(request)
        )

      const paymentAttachmentUrl =
        recordInputWithUploadedAttachments?.registration?.correction?.payment
          ?.attachmentData

      const proofOfLegalCorrectionAttachments =
        recordInputWithUploadedAttachments?.registration?.correction
          ?.attachments ?? []

      const recordInCorrectedState = await toCorrected(
        record,
        practitioner,
        correctionDetails,
        proofOfLegalCorrectionAttachments,
        paymentAttachmentUrl
      )

      const { correction, ...registration } =
        recordInputWithUploadedAttachments.registration!

      const recordWithUpdatedValues = updateFHIRBundle(
        recordInCorrectedState,
        { ...recordInputWithUploadedAttachments, registration },
        getEventType(record)
      )

      await indexBundle(recordWithUpdatedValues, token)
      await sendBundleToHearth(recordWithUpdatedValues)
      await createNewAuditEvent(recordWithUpdatedValues, token)

      return changeState(recordWithUpdatedValues, 'REGISTERED')
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/approve-correction',
    allowedStartStates: ['CORRECTION_REQUESTED'],
    action: 'APPROVE_CORRECTION',
    handler: async (request, record): Promise<RegisteredRecord> => {
      const recordInput = request.payload as
        | BirthRegistration
        | DeathRegistration
        | MarriageRegistration

      const correctionDetails = validateRequest(
        ApproveRequestInput,
        recordInput.registration?.correction
      )

      const recordInputWithUploadedAttachments =
        await uploadBase64AttachmentsToDocumentsStore(
          recordInput,
          getAuthHeader(request)
        )

      const token = getToken(request)
      const correctionRequest = findActiveCorrectionRequest(record)

      if (!correctionRequest) {
        throw conflict(
          'There is no pending correction requests for this record'
        )
      }

      const recordInCorrectedState = await toCorrectionApproved(
        record,
        getToken(request),
        correctionDetails
      )
      const { correction, ...registration } =
        recordInputWithUploadedAttachments.registration!

      /*
       * Separate tasks from the record
       */
      const [correctionRequestApprovedTask, correctedTask] =
        getTasksInAscendingOrder(recordInCorrectedState)
      const recordWithoutTasks = getRecordWithoutTasks(recordInCorrectedState)

      /*
       * Create and update the valid record that only has one task (the corrected task)
       */
      const newRecord = addTaskToRecord(recordWithoutTasks, correctedTask)

      newRecord satisfies ValidRecord

      const recordWithUpdatedValues = updateFHIRBundle(
        newRecord,
        { ...recordInputWithUploadedAttachments, registration },
        getEventType(record)
      )

      /*
       * Saves the previous task in the "approved" state and the new task (record put to Registered state)
       * Note that because we are storing the task "twice", the approved task needs to be first in the list!
       */

      const updatedCorrectedTask = getTaskFromSavedBundle(
        recordWithUpdatedValues
      )
      const recordWithNoTasks = getRecordWithoutTasks(recordWithUpdatedValues)

      // First add the approved task to the record
      const recordWithApprovedTask = addTaskToRecord(
        recordWithNoTasks,
        correctionRequestApprovedTask
      )

      // Then add the corrected task to the record
      const fullBundleToBeSaved = addTaskToRecord(
        recordWithApprovedTask,
        updatedCorrectedTask
      )

      await sendBundleToHearth(fullBundleToBeSaved)

      /*
       * Create metrics events & reindex the bundle in elasticsearch
       */

      await createNewAuditEvent(recordWithUpdatedValues, token)
      await indexBundle(recordWithUpdatedValues, token)

      /*
       * Notify the requesting practitioner that the correction request has been approved
       */

      const requestingPractitioner = getPractitioner(
        correctionRequest.requester.agent.reference.split('/')[1],
        record
      )

      const practitionerContacts = getPractitionerContactDetails(
        requestingPractitioner
      )

      await sendNotification(
        'approveCorrectionRequest',
        practitionerContacts,
        getAuthHeader(request),
        {
          event: 'BIRTH',
          trackingId: getTrackingId(recordWithUpdatedValues)!,
          userFullName: requestingPractitioner.name
        }
      )

      return recordWithUpdatedValues
    }
  })
]

if (process.env.NODE_ENV !== 'production') {
  routes.push({
    method: 'GET',
    path: '/records/{recordId}',
    options: {
      auth: false
    },
    handler: async (request: Request): Promise<Bundle | void> => {
      const record = await getRecordById(
        request.params.recordId,
        request.headers.authorization,
        ['REGISTERED', 'CERTIFIED', 'ISSUED', 'CORRECTION_REQUESTED']
      )
      return record
    }
  })
}

function findActiveCorrectionRequest(bundle: Bundle) {
  return bundle.entry
    .map(({ resource }) => resource)
    .filter(isTask)
    .filter(isCorrectionRequestedTask)
    .find((task) => {
      return task.status === 'requested'
    })
}

type ApprovePayload = {
  event: string
  trackingId: string
  userFullName: OpenCRVSPractitionerName[]
}

type RejectPayload = ApprovePayload & { reason: string }

type Contacts =
  | { email: string }
  | { msisdn: string }
  | { email: string; msisdn: string }

type PayloadMap = {
  approveCorrectionRequest: ApprovePayload
  rejectCorrectionRequest: RejectPayload
}

async function sendNotification<T extends keyof PayloadMap>(
  smsType: T,
  recipient: Contacts,
  authHeader: { Authorization: string },
  notificationPayload: PayloadMap[T]
) {
  const res = await fetch(`${NOTIFICATION_SERVICE_URL}${smsType}`, {
    method: 'POST',
    body: JSON.stringify({
      ...recipient,
      ...notificationPayload
    }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to send notification ${res.statusText}`)
  }

  return res
}
