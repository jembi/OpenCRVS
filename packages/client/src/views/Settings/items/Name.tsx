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
import { buttonMessages, userMessages } from '@client/i18n/messages'
import { useUserName } from '@client/utils/userUtils'
import {
  DynamicHeightLinkButton,
  LabelContainer,
  ValueContainer
} from '@client/views/Settings/items/components'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import * as React from 'react'
import { useIntl } from 'react-intl'

export function Name() {
  const intl = useIntl()
  const englishName = useUserName()

  return (
    <ListViewItemSimplified
      label={
        <LabelContainer>
          {intl.formatMessage(userMessages.labelEnglishName)}
        </LabelContainer>
      }
      value={<ValueContainer>{englishName}</ValueContainer>}
      actions={
        <DynamicHeightLinkButton disabled>
          {intl.formatMessage(buttonMessages.change)}
        </DynamicHeightLinkButton>
      }
    />
  )
}
