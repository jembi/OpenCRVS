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
import * as Hapi from '@hapi/hapi'
import { logger } from '@notification/logger'
import * as Joi from 'joi'
import { sendAllUserEmails } from './service.'

export async function allUsersEmailHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  logger.info(`Notifying from allUsersEmailHandler`)
  return sendAllUserEmails(request)
}

export const allUsersEmailPayloadSchema = Joi.object({
  subject: Joi.string().required(),
  body: Joi.string().required(),
  bcc: Joi.array().items(Joi.string().required()).required(),
  locale: Joi.string().required(),
  requestId: Joi.string().required()
})
