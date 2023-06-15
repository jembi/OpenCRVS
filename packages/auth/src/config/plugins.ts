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
import * as Pino from 'hapi-pino'
import * as Sentry from 'hapi-sentry'
import { SENTRY_DSN } from '@auth/constants'
import { logger } from '@auth/logger'

interface IHapiPlugin {
  plugin: typeof Sentry | typeof Pino
  options: Record<string, unknown>
}

export default function getPlugins() {
  const plugins: IHapiPlugin[] = [
    {
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false,
        instance: logger
      }
    }
  ]

  if (SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          environment: process.env.DOMAIN,
          dsn: SENTRY_DSN
        },
        catchLogErrors: true
      }
    })
  }
  return plugins
}
