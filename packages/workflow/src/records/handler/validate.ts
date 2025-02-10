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
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { toValidated } from '@workflow/records/state-transitions'
import { auditEvent } from '@workflow/records/audit'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'
import { invokeWebhooks } from '@workflow/records/webhooks'
import { getEventType } from '@workflow/features/registration/utils'
import { SCOPES } from '@opencrvs/commons/authentication'

export const validateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/validate',
  allowedStartStates: ['IN_PROGRESS', 'READY_FOR_REVIEW'],
  action: 'VALIDATE',
  allowedScopes: [SCOPES.RECORD_SUBMIT_FOR_APPROVAL],
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)
    const payload = validateRequest(
      z.object({
        comments: z.string().optional(),
        timeLoggedMS: z.number().optional()
      }),
      request.payload
    )

    const validatedRecord = await toValidated(
      record,
      token,
      payload.comments,
      payload.timeLoggedMS
    )

    await indexBundle(validatedRecord, token)
    await auditEvent('sent-for-approval', validatedRecord, token)

    await invokeWebhooks({
      bundle: record,
      token,
      event: getEventType(record),
      isNotRegistered: true,
      statusType: 'validated'
    })

    return validatedRecord
  }
})
