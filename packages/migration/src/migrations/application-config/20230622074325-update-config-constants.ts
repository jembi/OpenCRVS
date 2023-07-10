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

import { Db } from 'mongodb'

export const up = async (db: Db) => {
  await db.collection('configs').updateMany(
    {},
    {
      $unset: { HIDE_EVENT_REGISTER_INFORMATION: '' },
      $set: {
        HIDE_BIRTH_EVENT_REGISTER_INFORMATION: false,
        HIDE_DEATH_EVENT_REGISTER_INFORMATION: false,
        HIDE_MARRIAGE_EVENT_REGISTER_INFORMATION: false
      }
    }
  )
}

export const down = async (db: Db) => {
  await db.collection('configs').updateMany(
    {},
    {
      $set: { HIDE_EVENT_REGISTER_INFORMATION: false },
      $unset: {
        HIDE_BIRTH_EVENT_REGISTER_INFORMATION: '',
        HIDE_DEATH_EVENT_REGISTER_INFORMATION: '',
        HIDE_MARRIAGE_EVENT_REGISTER_INFORMATION: ''
      }
    }
  )
}
