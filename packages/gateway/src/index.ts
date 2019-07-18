// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import * as DotEnv from 'dotenv'
import { getPlugins } from '@gateway/config/plugins'
import { getServer } from '@gateway/config/server'
import { getRoutes } from '@gateway/config/routes'
import {
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  PORT
} from '@gateway/constants'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'

DotEnv.config({
  path: `${process.cwd()}/.env`
})

const graphQLSchemaPath = `${__dirname}/graphql/index.graphql`

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = getServer()
  const plugins = getPlugins(process.env.NODE_ENV, graphQLSchemaPath)

  await server.register(plugins)

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  async function start() {
    await server.start()
    server.log('info', `server started on port ${PORT}`)
  }

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
