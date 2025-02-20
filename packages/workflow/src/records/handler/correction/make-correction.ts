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
import { conflict } from '@hapi/boom'
import { getAuthHeader } from '@opencrvs/commons/http'
import {
  BirthRegistration,
  DeathRegistration,
  MarriageRegistration,
  RegisteredRecord,
  changeState,
  updateFHIRBundle
} from '@opencrvs/commons/types'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getEventType } from '@workflow/features/registration/utils'
import {
  getLoggedInPractitionerResource,
  getPractitionerOfficeId
} from '@workflow/features/user/utils'
import { auditEvent, createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle, indexBundleToRoute } from '@workflow/records/search'
import { toCorrected, toUnassigned } from '@workflow/records/state-transitions'
import { CorrectionRequestInput } from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { findActiveCorrectionRequest, updateFullUrl } from './utils'
import { SCOPES } from '@opencrvs/commons/authentication'

export const makeCorrectionRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/make-correction',
  allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
  action: 'MAKE_CORRECTION',
  includeHistoryResources: true,
  allowedScopes: [SCOPES.RECORD_REGISTRATION_CORRECT],
  handler: async (request, record): Promise<RegisteredRecord> => {
    const recordInput = request.payload as
      | BirthRegistration
      | DeathRegistration
      | MarriageRegistration

    const correctionDetails = validateRequest(
      CorrectionRequestInput,
      recordInput.registration?.correction
    )
    /* Fhir builders put the comment value provided in `registration.status.comments`
     * inside `task.note`
     */
    if (
      recordInput.registration?.correction?.note &&
      recordInput.registration?.status?.[0]
    ) {
      if (
        !recordInput.registration.status[0].comments ||
        recordInput.registration.status[0].comments.length == 0
      )
        recordInput.registration.status[0].comments = [
          {
            comment: ''
          }
        ]
      recordInput.registration.status[0].comments.push({
        comment: recordInput.registration?.correction?.note
      })
    }

    const token = getToken(request)

    if (findActiveCorrectionRequest(record)) {
      throw conflict(
        'There is already a pending correction request for this record'
      )
    }
    const practitioner = await getLoggedInPractitionerResource(token)
    const practitionerOfficeId = await getPractitionerOfficeId(practitioner.id)

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
      practitionerOfficeId,
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

    const res = await sendBundleToHearth(recordWithUpdatedValues)

    const recordWithUpdatedFullUrl = updateFullUrl(res, recordWithUpdatedValues)

    await indexBundle(recordWithUpdatedFullUrl, token)

    await createNewAuditEvent(recordWithUpdatedFullUrl, token)

    const correctedRecord = changeState(recordWithUpdatedFullUrl, 'REGISTERED')

    const { unassignedRecord, unassignedRecordWithTaskOnly } =
      await toUnassigned(correctedRecord, token)

    await sendBundleToHearth(unassignedRecordWithTaskOnly)

    await indexBundleToRoute(unassignedRecord, token, '/events/unassigned')
    await auditEvent('unassigned', unassignedRecord, token)

    return unassignedRecord
  }
})
