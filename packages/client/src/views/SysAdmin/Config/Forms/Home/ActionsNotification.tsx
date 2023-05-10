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
import { selectFormDraft } from '@client/forms/configuration/formConfig/selectors'
import { constantsMessages } from '@client/i18n/messages'
import { statusChangeActionMessages } from '@client/i18n/messages/views/formConfig'
import { IStoreState } from '@client/store'
import {
  ActionStatus,
  isNotifiable,
  NOTIFICATION_TYPE_MAP
} from '@client/views/SysAdmin/Config/Forms/utils'
import { Toast } from '@opencrvs/components/lib/Toast'
import { noop } from 'lodash'
import React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { ActionContext } from './ActionsModal'

export function ActionsNotification() {
  const {
    actionState: { action, event, status },
    setAction
  } = React.useContext(ActionContext)
  const intl = useIntl()
  const { version } = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )

  return (
    <>
      {isNotifiable(status) && (
        <Toast
          type={NOTIFICATION_TYPE_MAP[status]}
          onClose={
            status !== ActionStatus.PROCESSING
              ? () => setAction({ status: ActionStatus.IDLE })
              : noop // Toast isn't closable when status is "loading"
          }
        >
          {intl.formatMessage(statusChangeActionMessages(action)[status], {
            event: intl.formatMessage(constantsMessages[event]),
            version
          })}
        </Toast>
      )}
    </>
  )
}
