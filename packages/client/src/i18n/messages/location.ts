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

interface ILocationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  DISTRICT: MessageDescriptor
  CITY: MessageDescriptor
  STATE: MessageDescriptor
  [key: `LOCATION_LEVEL_${number}`]: MessageDescriptor
}

const messagesToDefine: ILocationMessages = {
  DISTRICT: {
    id: 'form.field.label.district',
    defaultMessage: 'District',
    description: 'Label for District'
  },
  CITY: {
    id: 'form.field.label.cityUrbanOption',
    defaultMessage: 'City',
    description: 'Label for City'
  },
  STATE: {
    id: 'form.field.label.state',
    defaultMessage: 'State',
    description: 'Label for State'
  }
}

const getLocationLevelMessage = (level: string): MessageDescriptor => {
  return {
    id: `form.field.label.locationLevel${level}`,
    defaultMessage: `Location Level ${level}`,
    description: `Label for locationLevel${level}`
  }
}

export const locationMessages = (location: string): MessageDescriptor => {
  const match = String(location).match(/^LOCATION_LEVEL_(\d+)$/)
  if (location && match) {
    const levelNumber = match[1]
    messagesToDefine[location] = getLocationLevelMessage(levelNumber)
  }

  return defineMessages(messagesToDefine)[location]
}
