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
// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
import '@opencrvs/commons/monitoring'
import * as Hapi from '@hapi/hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@metrics/constants'
import getPlugins from '@metrics/config/plugins'
import { getRoutes } from '@metrics/config/routes'
import { readFileSync } from 'fs'
import { influx } from '@metrics/influxdb/client'
import {
  INFLUX_DB,
  INFLUX_HOST,
  INFLUX_PORT
} from '@metrics/influxdb/constants'
import { validateFunc } from '@opencrvs/commons'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      if (request.payload) {
        request.sentryScope.setExtra('payload', request.payload)
      }
      return h.continue
    }
  })

  async function start() {
    influx
      .getDatabaseNames()
      .then((names: any) => {
        if (!names.includes(INFLUX_DB)) {
          return influx.createDatabase(INFLUX_DB)
        }
      })
      .then(async () => {
        server.log('info', `InfluxDB started on ${INFLUX_HOST}:${INFLUX_PORT}`)
        await server.start()
        server.log('info', `Metrics server started on ${HOST}:${PORT}`)
      })
      .catch((err: Error) => {
        server.log('info', `Error creating Influx database! ${err.stack}`)
      })
  }

  async function stop() {
    await server.stop()
    server.log('info', 'Metrics server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
