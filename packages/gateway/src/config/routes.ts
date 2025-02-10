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
import healthCheckHandler from '@gateway/features/healthCheck/handler'
import {
  eventNotificationHandler,
  fhirBundleSchema,
  validationFailedAction
} from '@gateway/features/eventNotification/eventNotificationHandler'
import { ServerRoute } from '@hapi/hapi'
import { authProxy, catchAllProxy, rateLimitedAuthProxy } from './proxies'
import { SCOPES } from '@opencrvs/commons/authentication'
import sendVerifyCodeHandler, {
  requestSchema,
  responseSchema
} from '@gateway/routes/verifyCode/handler'
import { trpcProxy } from '@gateway/v2-events/event-config/routes'
import { DOCUMENTS_URL, MINIO_BUCKET } from '@gateway/constants'

export const getRoutes = () => {
  const routes: ServerRoute[] = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: () => {
        return 'success'
      }
    },
    // health check endpoint for all services
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      options: {
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a query param: service'
      }
    },
    // create event notification
    {
      method: 'POST',
      path: '/notification',
      handler: eventNotificationHandler,
      options: {
        tags: ['api'],
        description: 'Create a health notification',
        auth: {
          scope: [
            SCOPES.RECORD_DECLARE_BIRTH,
            SCOPES.RECORD_DECLARE_DEATH,
            SCOPES.RECORD_DECLARE_MARRIAGE,
            SCOPES.NOTIFICATION_API
          ]
        },
        validate: {
          payload: fhirBundleSchema,
          failAction: validationFailedAction
        }
      }
    },
    {
      method: 'POST',
      path: '/sendVerifyCode',
      handler: sendVerifyCodeHandler,
      options: {
        description: 'Send verify code to user contact',
        notes:
          'Generate a 6 digit verification code.' +
          'Sends an SMS/email to the user with verification code.',
        validate: {
          payload: requestSchema
        },
        response: {
          schema: responseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/upload',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/files`,
          passThrough: true
        })
      },
      options: {
        payload: {
          output: 'data',
          parse: false
        }
      }
    },
    {
      method: 'GET',
      path: '/presigned-url/{fileUri*}',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/presigned-url/${MINIO_BUCKET}/${req.params.fileUri}`,
          passThrough: true
        })
      }
    },
    {
      method: 'DELETE',
      path: '/files/{filename}',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/files/${req.params.filename}`,
          passThrough: true
        })
      },
      options: {
        payload: {
          output: 'data',
          parse: false
        }
      }
    },
    catchAllProxy.locations,
    catchAllProxy.locationsSuffix,

    catchAllProxy.location,
    catchAllProxy.locationId,

    catchAllProxy.auth,
    authProxy.token,
    rateLimitedAuthProxy.authenticate,
    rateLimitedAuthProxy.authenticateSuperUser,
    rateLimitedAuthProxy.verifyUser,
    ...trpcProxy
  ]

  return routes
}
