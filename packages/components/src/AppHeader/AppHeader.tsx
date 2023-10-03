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
import * as React from 'react'
import { DesktopHeader, IDesktopHeaderProps } from './Desktop/DesktopHeader'
import { grid } from '../grid'
import { MobileHeader, IMobileHeaderProps } from './Mobile/MobileHeader'

export interface IDomProps {
  id?: string
  className?: string
}

type IProps = IMobileHeaderProps & IDesktopHeaderProps & IDomProps

interface IState {
  width: number
}

export class AppHeader extends React.Component<IProps, IState> {
  state = {
    width: window.innerWidth
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  render() {
    const mobileHeaderProps: IMobileHeaderProps = this
      .props as IMobileHeaderProps
    const desktopHeaderProps: IDesktopHeaderProps = this
      .props as IDesktopHeaderProps

    if (this.state.width > grid.breakpoints.lg) {
      return <DesktopHeader {...desktopHeaderProps} />
    } else {
      return <MobileHeader {...mobileHeaderProps} />
    }
  }
}
