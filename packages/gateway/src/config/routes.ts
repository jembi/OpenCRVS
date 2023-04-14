/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as glob from 'glob'
import { join, resolve } from 'path'
import healthCheckHandler, {
  querySchema as healthCheckQuerySchema,
  responseSchema as healthCheckResponseSchema
} from '@gateway/features/healthCheck/handler'
import {
  createLocationHandler,
  requestSchema,
  updateLocationHandler,
  updateSchema,
  fetchLocationHandler
} from '@gateway/features/restLocation/locationHandler'
import {
  eventNotificationHandler,
  fhirBundleSchema,
  validationFailedAction
} from '@gateway/features/eventNotification/eventNotificationHandler'

export const getRoutes = () => {
  const routes = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      }
    },
    // health check endpoint for all services
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      config: {
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a query param: service',
        validate: {
          query: healthCheckQuerySchema
        },
        response: {
          schema: healthCheckResponseSchema
        }
      }
    },
    // get all locations
    {
      method: 'GET',
      path: '/location',
      handler: fetchLocationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description: 'Get all locations'
      }
    },
    {
      method: 'GET',
      path: '/location/{locationId}',
      handler: fetchLocationHandler,
      config: {
        tags: ['api'],
        auth: false,
        description: 'Get a single location'
      }
    },
    // create Location/Facility
    {
      method: 'POST',
      path: '/location',
      handler: createLocationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: ['natlsysadmin']
        },
        description: 'Create a location',
        validate: {
          payload: requestSchema
        }
      }
    },
    // update Location/Facility
    {
      method: 'PUT',
      path: '/location/{locationId}',
      handler: updateLocationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: ['natlsysadmin']
        },
        description: 'Update a location or facility',
        validate: {
          payload: updateSchema
        }
      }
    },
    // create event notification
    {
      method: 'POST',
      path: '/notification',
      handler: eventNotificationHandler,
      config: {
        tags: ['api'],
        description: 'Create a health notification',
        auth: {
          scope: ['declare', 'notification-api']
        },
        validate: {
          payload: fhirBundleSchema,
          failAction: validationFailedAction
        }
      }
    }
  ]
  // add all routes from all modules to the routes array manually or write your routes inside a folder inside the server folder
  // with suffix as -routes.ts
  glob.sync(join(__dirname, '../routes/**/*-route.[t|j]s')).forEach((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const otherRoutes = require(resolve(file)).default
    if (Array.isArray(otherRoutes)) {
      routes.push(...otherRoutes)
    } else {
      routes.push(otherRoutes)
    }
  })
  return routes
}
