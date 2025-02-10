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
import { cleanEnv, str, port, url } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ devDefault: 'localhost' }),
  PORT: port({ default: 2020 }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  SENTRY_DSN: str({ default: undefined }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  USER_MANAGEMENT_URL: url({ devDefault: 'http://localhost:3030/' }),
  MONGO_URL: str({ devDefault: 'mongodb://localhost/notification' })
})
