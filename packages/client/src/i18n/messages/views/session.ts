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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISessionMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  sessionExpireTxt: MessageDescriptor
}

const messagesToDefine: ISessionMessages = {
  sessionExpireTxt: {
    id: 'misc.session.expired',
    defaultMessage: 'Your session has expired. Please login again.',
    description: 'SessionExpire modal confirmation text'
  }
}

export const messages: ISessionMessages = defineMessages(messagesToDefine)
