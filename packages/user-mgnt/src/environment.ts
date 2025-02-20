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

import { cleanEnv, str, port, url, bool, num } from 'envalid'

export const env = cleanEnv(process.env, {
  HOST: str({ devDefault: 'localhost' }),
  PORT: port({ default: 3030 }),
  MONGO_URL: url({ devDefault: 'mongodb://localhost/user-mgnt' }),
  NOTIFICATION_SERVICE_URL: url({ devDefault: 'http://localhost:2020/' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  DOCUMENTS_URL: url({ devDefault: 'http://localhost:9050' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040/' }),
  CERT_PUBLIC_KEY_PATH: str({ devDefault: '../../.secrets/public-key.pem' }),
  SENTRY_DSN: str({ default: undefined }),
  QA_ENV: bool({ default: false }),
  RECORD_SEARCH_QUOTA: num({ default: 2000 }),

  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  METRICS_URL: url({ devDefault: 'http://localhost:1050' })
})
