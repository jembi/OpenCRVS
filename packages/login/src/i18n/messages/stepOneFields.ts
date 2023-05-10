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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IStepOneFieldsMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  username: MessageDescriptor
  passwordLabel: MessageDescriptor
}

const messagesToDefine = {
  username: {
    id: 'login.username',
    defaultMessage: 'Username',
    description: 'The label that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  }
}

export const messages: IStepOneFieldsMessages = defineMessages(messagesToDefine)
