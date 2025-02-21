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
import { cleanEnv, str, port, url, bool } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ devDefault: 'localhost' }),
  DOMAIN: str({ devDefault: '*' }),
  LOGIN_URL: url({ devDefault: 'http://localhost:3020/' }),
  CLIENT_APP_URL: url({ devDefault: 'http://localhost:3000/' }),
  PORT: port({ default: 2021 }),
  QA_ENV: bool({ default: false }),
  CHECK_INVALID_TOKEN: bool({
    devDefault: false,
    desc: `Check if the token has been invalided in the auth service before it has expired`
  }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  SENTRY_DSN: str({ default: undefined }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040/' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040/' }),
  MONGO_URL: url({ devDefault: 'mongodb://localhost/application-config' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  HEARTH_MONGO_URL: str({ default: 'mongodb://localhost/hearth-dev' })
})
