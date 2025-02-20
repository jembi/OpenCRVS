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
import { bool, cleanEnv, port, str, url } from 'envalid'

export const env = cleanEnv(process.env, {
  MONGO_URL: str({ devDefault: 'mongodb://localhost/webhooks' }),
  HOST: str({ devDefault: '0.0.0.0' }),
  PORT: port({ default: 2525 }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  SENTRY_DSN: str({ default: undefined }),
  NODE_ENV: str({ devDefault: 'development' }),
  QA_ENV: bool({ default: false }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  CHECK_INVALID_TOKEN: bool({
    devDefault: false,
    desc: 'Check if the token has been invalidated in the auth service before it has expired'
  }),
  REDIS_HOST: str({ devDefault: 'localhost' })
})
