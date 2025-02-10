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
import * as z from 'zod'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { toArchived } from '@workflow/records/state-transitions'
import { indexBundle } from '@workflow/records/search'
import { createRoute } from '@workflow/states'
import { auditEvent } from '@workflow/records/audit'
import { invokeWebhooks } from '@workflow/records/webhooks'
import { getEventType } from '@workflow/features/registration/utils'
import { SCOPES } from '@opencrvs/commons/authentication'

const requestSchema = z.object({
  reason: z.string().optional(),
  comment: z.string().optional(),
  duplicateTrackingId: z.string().optional()
})

export const archiveRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/archive',
  allowedStartStates: ['READY_FOR_REVIEW', 'VALIDATED'],
  action: 'ARCHIVE',
  allowedScopes: [SCOPES.RECORD_DECLARATION_ARCHIVE],
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(requestSchema, request.payload)

    const { reason, comment, duplicateTrackingId } = payload

    const archivedRecord = await toArchived(
      record,
      token,
      reason,
      comment,
      duplicateTrackingId
    )

    await indexBundle(archivedRecord, token)
    await auditEvent('archived', archivedRecord, token)

    await invokeWebhooks({
      bundle: record,
      token,
      event: getEventType(record),
      isNotRegistered: true,
      statusType: 'archived'
    })

    return archivedRecord
  }
})
