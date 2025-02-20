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
import { CertifiedRecord } from '@opencrvs/commons/types'
import { createRoute } from '@workflow/states'
import { validateRequest } from '@workflow/utils'
import { getToken } from '@workflow/utils/auth-utils'
import { CertifyRequestSchema } from '@workflow/records/validations'
import { toCertified } from '@workflow/records/state-transitions'
import { uploadCertificateAttachmentsToDocumentsStore } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'
import { indexBundle } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'
import { invokeWebhooks } from '@workflow/records/webhooks'
import { getEventType } from '@workflow/features/registration/utils'
import { SCOPES } from '@opencrvs/commons/authentication'

export const certifyRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/certify-record',
  allowedStartStates: ['REGISTERED'],
  action: 'CERTIFY',
  includeHistoryResources: true,
  allowedScopes: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES],
  handler: async (request, record): Promise<CertifiedRecord> => {
    const token = getToken(request)
    const { certificate: certificateDetailsWithRawAttachments, event } =
      validateRequest(CertifyRequestSchema, request.payload)

    const certificateDetails =
      await uploadCertificateAttachmentsToDocumentsStore(
        certificateDetailsWithRawAttachments,
        getAuthHeader(request)
      )

    const certifiedRecord = await toCertified(
      record,
      token,
      event,
      certificateDetails
    )

    await indexBundle(certifiedRecord, token)
    await auditEvent('certified', certifiedRecord, token)

    await invokeWebhooks({
      bundle: record,
      token,
      event: getEventType(record),
      isNotRegistered: true,
      statusType: 'certified'
    })

    return certifiedRecord
  }
})
