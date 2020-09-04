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
import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from '@client/views/SecureAccount/SecureAccountView'
import { Unlock } from '@client/views/Unlock/Unlock'
import { storage } from '@client/storage'
import { withRouter, RouteComponentProps } from 'react-router'
import { isMobileDevice } from '@client/utils/commonUtils'
import IdleTimer from 'react-idle-timer'
import { USER_DETAILS, IUserDetails } from '@client/utils/userUtils'
import { ProtectedAccount } from '@client/components/ProtectedAccount'
import { getCurrentUserID, IUserData } from '@client/applications'
import * as LogRocket from 'logrocket'
import { refreshToken } from '@client/utils/authUtils'
import { REFRESH_TOKEN_CHECK_MILLIS } from '@client/utils/constants'
import { connect } from 'react-redux'
import { refreshOfflineData } from '@client/offline/actions'
import { PropsWithChildren } from 'react'
export const SCREEN_LOCK = 'screenLock'

type OwnProps = PropsWithChildren<{
  unprotectedRouteElements: string[]
}>

type DispatchProps = {
  onNumPadVisible: () => void
}
interface IProtectPageState {
  secured: boolean
  pinExists: boolean
  pendingUser: boolean
}

type Props = OwnProps & DispatchProps & RouteComponentProps<{}>

class ProtectedPageComponent extends React.Component<Props, IProtectPageState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      secured: true,
      pinExists: true,
      pendingUser: false
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.markAsSecured = this.markAsSecured.bind(this)
    this.onIdle = this.onIdle.bind(this)
  }

  async componentDidMount() {
    const newState = { ...this.state }

    if (await storage.getItem(SCREEN_LOCK)) {
      newState.secured = false
    } else {
      newState.secured = true
    }
    if (await this.getPIN()) {
      newState.pinExists = true
    } else {
      newState.pinExists = false
    }
    const userDetails: IUserDetails = JSON.parse(
      (await storage.getItem(USER_DETAILS)) || '{}'
    )
    if (userDetails && userDetails.status && userDetails.status === 'pending') {
      newState.pendingUser = true
    }
    if (userDetails && userDetails.practitionerId) {
      LogRocket.identify(userDetails.practitionerId)
    }
    this.setState(newState)

    setInterval(() => {
      refreshToken()
    }, REFRESH_TOKEN_CHECK_MILLIS)
  }

  async handleVisibilityChange(isVisible: boolean) {
    const alreadyLocked = isVisible || (await storage.getItem(SCREEN_LOCK))

    const onUnprotectedPage = this.props.unprotectedRouteElements.some(route =>
      this.props.location.pathname.includes(route)
    )

    const newState = { ...this.state }

    if (!alreadyLocked && !onUnprotectedPage) {
      newState.secured = false
      if (await this.getPIN()) {
        newState.pinExists = true
      } else {
        newState.pinExists = false
      }
      this.setState(newState)
      storage.setItem(SCREEN_LOCK, 'true')
    }

    // App was in the background and now we need to make sure
    // both global configuration and resources data is up-to-date
    if (isVisible) {
      this.props.onNumPadVisible()
    }
  }

  markAsSecured() {
    this.setState({ secured: true, pinExists: true })
    storage.removeItem(SCREEN_LOCK)
  }

  async getPIN(): Promise<string> {
    const currentUserID = await getCurrentUserID()
    const userData = await storage.getItem('USER_DATA')

    if (!userData) {
      return ''
    }
    const allUserData = JSON.parse(userData) as IUserData[]
    if (!allUserData || !allUserData.length) {
      return ''
    }
    const currentUserData = allUserData.find(
      user => user.userID === currentUserID
    )
    return (currentUserData && currentUserData.userPIN) || ''
  }

  onIdle() {
    storage.setItem(SCREEN_LOCK, 'true')
    this.setState({ secured: false })
  }

  render() {
    const { pendingUser, secured, pinExists } = this.state

    if (pendingUser) {
      return <ProtectedAccount />
    }

    if (!pinExists) {
      return <SecureAccount onComplete={this.markAsSecured} />
    }

    if (isMobileDevice()) {
      return (
        <PageVisibility onChange={this.handleVisibilityChange}>
          {(secured && this.props.children) ||
            (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
        </PageVisibility>
      )
    }
    return (
      <IdleTimer
        onIdle={this.onIdle}
        timeout={window.config.DESKTOP_TIME_OUT_MILLISECONDS}
      >
        {(secured && this.props.children) ||
          (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
      </IdleTimer>
    )
  }
}
export const ProtectedPage = connect<{}, DispatchProps, OwnProps>(null, {
  onNumPadVisible: refreshOfflineData
})(withRouter(ProtectedPageComponent))
