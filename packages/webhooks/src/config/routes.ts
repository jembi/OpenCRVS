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
  subscribeWebhooksHandler,
  reqSubscribeWebhookSchema,
  listWebhooksHandler,
  deleteWebhookHandler,
  deleteWebhookByClientIdHandler
} from '@webhooks/features/manage/handler'
import {
  approveRejectHandler,
  birthRegisteredHandler,
  deathRegisteredHandler,
  marriageRegisteredHandler
} from '@webhooks/features/event/handler'

export const getRoutes = () => {
  const routes = [
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
      path: '/webhooks',
      handler: subscribeWebhooksHandler,
      config: {
        tags: ['api'],
        description: 'Subscribe to a webhook',
        validate: {
          payload: reqSubscribeWebhookSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/webhooks',
      handler: listWebhooksHandler,
      config: {
        tags: ['api'],
        description: 'List webhooks'
      }
    },
    {
      method: 'DELETE',
      path: '/webhooks/{webhookId}',
      handler: deleteWebhookHandler,
      config: {
        tags: ['api'],
        description: 'Delete webhooks'
      }
    },
    {
      method: 'POST',
      path: '/deleteWebhooksByClientId', // Used when deleting a system through the admin UI
      handler: deleteWebhookByClientIdHandler,
      config: {
        tags: ['api'],
        description: 'Delete webhooks by client id'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/mark-registered',
      handler: birthRegisteredHandler,
      config: {
        tags: ['api'],
        description: 'Dispatches a webhook for the birth registration event'
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-registered',
      handler: deathRegisteredHandler,
      config: {
        tags: ['api'],
        description: 'Dispatches a webhook for the death registration event'
      }
    },
    {
      method: 'POST',
      path: '/events/marriage/mark-registered',
      handler: marriageRegisteredHandler,
      config: {
        tags: ['api'],
        description: 'Dispatches a webhook for the marriage registration event'
      }
    },
    {
      method: 'POST',
      path: '/events/{eventType}/status/{statusType}',
      handler: approveRejectHandler,
      config: {
        tags: ['api'],
        description: 'Dispatches a webhook for the event'
      }
    }
  ]
  return routes
}
