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
import { archiveRoute } from '@workflow/records/handler/archive'
import { certifyRoute } from '@workflow/records/handler/certify'
import { confirmRegistrationHandler } from '@workflow/records/handler/confirm'
import { approveCorrectionRoute } from '@workflow/records/handler/correction/approve'
import { makeCorrectionRoute } from '@workflow/records/handler/correction/make-correction'
import { rejectCorrectionRoute } from '@workflow/records/handler/correction/reject'
import { requestCorrectionRoute } from '@workflow/records/handler/correction/request'
import { downloadRecordHandler } from '@workflow/records/handler/download'
import { duplicateRecordHandler } from '@workflow/records/handler/duplicate'
import { eventNotificationHandler } from '@workflow/records/handler/eventNotificationHandler'
import { issueRoute } from '@workflow/records/handler/issue'
import { markAsNotDuplicateHandler } from '@workflow/records/handler/not-duplicate'
import { registerRoute } from '@workflow/records/handler/register'
import { reinstateRoute } from '@workflow/records/handler/reinstate'
import { rejectRoute } from '@workflow/records/handler/reject'
import { unassignRecordHandler } from '@workflow/records/handler/unassign'
import { updateRoute } from '@workflow/records/handler/update'
import { validateRoute } from '@workflow/records/handler/validate'
import { verifyRecordHandler } from '@workflow/records/handler/verify'
import { viewRecordHandler } from '@workflow/records/handler/view'

export const getRoutes = () => {
  const routes = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/confirm',
      handler: confirmRegistrationHandler,
      config: {
        tags: ['api'],
        description: 'Confirm registration after external validation'
      }
    },
    {
      method: 'POST',
      path: '/download-record',
      handler: downloadRecordHandler,
      config: {
        tags: ['api'],
        description: 'Download record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/unassign-record',
      handler: unassignRecordHandler,
      config: {
        tags: ['api'],
        description: 'Unassign record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/view',
      handler: viewRecordHandler,
      config: {
        tags: ['api'],
        description: 'View record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/duplicate',
      handler: duplicateRecordHandler,
      config: {
        tags: ['api'],
        description: 'Unassign record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/verify',
      handler: verifyRecordHandler,
      config: {
        tags: ['api'],
        description: 'Verify record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/not-duplicate',
      handler: markAsNotDuplicateHandler,
      config: {
        tags: ['api'],
        description: 'Mark as not-duplicate record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/event-notification',
      handler: eventNotificationHandler,
      config: {
        tags: ['api'],
        description: 'Saves full fhir bundle to search and hearth'
      }
    },
    validateRoute,
    updateRoute,
    registerRoute,
    certifyRoute,
    issueRoute,
    archiveRoute,
    rejectRoute,
    reinstateRoute,
    approveCorrectionRoute,
    rejectCorrectionRoute,
    requestCorrectionRoute,
    makeCorrectionRoute
  ]

  return routes
}
