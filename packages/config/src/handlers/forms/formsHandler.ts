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
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import FormVersions, {
  IFormVersionModel,
  Status
} from '@config/models/formVersions'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { logger } from '@config/config/logger'

interface IFormsPayload {
  version: string
  birth: string
  death: string
  marriage: string
}

export default async function getForm(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers.authorization
  const response = await fetch(`${COUNTRY_CONFIG_URL}/forms`, {
    headers: {
      Authorization: token
    }
  })

  if (response.status !== 200) {
    logger.error('Country config did not return 200 on forms endpoint')
    return h.response().code(400)
  }

  const forms: IFormsPayload = await response.json()
  const formVersion: IFormVersionModel | null = await FormVersions.findOne({
    version: forms.version
  })
  if (!formVersion) {
    try {
      await FormVersions.create({
        birthForm: JSON.stringify(forms.birth),
        deathForm: JSON.stringify(forms.death),
        marriageForm: JSON.stringify(forms.marriage),
        version: forms.version,
        status: Status.ACTIVE
      } as IFormVersionModel)
    } catch (err) {
      logger.error(err)
      // return 400 if there is a validation error when saving to mongo
      return h.response().code(400)
    }
  }
  return h.response(forms).code(201)
}
