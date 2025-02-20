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

import { env } from '@notification/environment'

/*
  For these locales sms content will not be sent as unicoded payload
  In future based on our experience on different countries we can add more locals here
*/
export const NON_UNICODED_LANGUAGES = ['en']
export const DEFAULT_TIMEOUT = 600000

export const HOST = env.HOST
export const PORT = env.PORT
export const CERT_PUBLIC_KEY_PATH = env.CERT_PUBLIC_KEY_PATH
export const SENTRY_DSN = env.SENTRY_DSN
export const COUNTRY_CONFIG_URL = env.COUNTRY_CONFIG_URL
export const USER_MANAGEMENT_URL = env.USER_MANAGEMENT_URL
export const MONGO_URL = env.MONGO_URL
