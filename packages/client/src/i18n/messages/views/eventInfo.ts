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
import { map } from 'lodash'

const birthBulletListItemsToDefine = [
  {
    id: 'register.eventInfo.birth.listItem0',
    defaultMessage:
      'I am here to complete the birth registration application for you.',
    description: 'Event info bullet list item for birth'
  },
  {
    id: 'register.eventInfo.birth.listItem1',
    defaultMessage:
      'Once I complete the application, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for birth'
  },
  {
    id: 'register.eventInfo.birth.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for birth'
  },
  {
    id: 'register.eventInfo.birth.listItem3',
    defaultMessage:
      'Make sure you go and collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
    description: 'Event info bullet list item for birth'
  }
]

const deathBulletListItemsToDefine = [
  {
    id: 'register.eventInfo.death.listItem0',
    defaultMessage:
      'I am here to complete the death registration application for you. ',
    description: 'Event info bullet list item for death'
  },
  {
    id: 'register.eventInfo.death.listItem1',
    defaultMessage:
      'Once I complete the application, it will be sent to the registration office for review.',
    description: 'Event info bullet list item for death'
  },
  {
    id: 'register.eventInfo.death.listItem2',
    defaultMessage:
      'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
    description: 'Event info bullet list item for death'
  },
  {
    id: 'register.eventInfo.death.listItem3',
    defaultMessage:
      'Make sure you go and collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and settling loans.',
    description: 'Event info bullet list item for death'
  }
]

type IEventInfoTitleMessages = {
  title: MessageDescriptor
}

type IEventInfoMessages = {
  title: MessageDescriptor
  birthBulletListItems: MessageDescriptor[]
  deathBulletListItems: MessageDescriptor[]
}

const messagesToDefine: IEventInfoTitleMessages = {
  title: {
    id: 'register.eventInfo.event.title',
    defaultMessage:
      'Introduce the {eventType, select, birth{birth} death{death} other{birth}} registration process to the applicant'
  }
}

function defineMessagesFromArray(messages: MessageDescriptor[]) {
  return map(messages, message =>
    defineMessages(
      message as Record<string | number | symbol, MessageDescriptor>
    )
  )
}

export const messages: IEventInfoMessages = {
  ...defineMessages(messagesToDefine),
  birthBulletListItems: defineMessagesFromArray(birthBulletListItemsToDefine),
  deathBulletListItems: defineMessagesFromArray(deathBulletListItemsToDefine)
}
