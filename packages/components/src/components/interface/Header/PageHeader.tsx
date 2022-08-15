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
import { grid } from '../../grid'
import styled from 'styled-components'
import { IDomProps } from './AppHeader'
import { CircleButton } from '../../buttons'
import { BackArrowDeepBlue, Cross } from '../../icons'

const PageHeaderWrapper = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const Left = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 0;
  flex: 1;
`
const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const Title = styled.div`
  ${({ theme }) => theme.fonts.h4};
  color: ${({ theme }) => theme.colors.grey800};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 100px; */
  height: 27px;
  /* left: 71px; */
  /* top: 14px; */
`

const BackButtonContainer = styled.div`
  margin-right: 16px;
  cursor: pointer;
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  text-transform: capitalize;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

interface IProps {
  mobileLeft?: React.ReactElement[]
  mobileTitle?: string
  mobileRight?: React.ReactElement[]
  desktopLeft?: React.ReactElement[]
  desktopTitle?: string
  desktopRight?: React.ReactElement[]

  /** If `goBack` is defined, only a back button will be shown on the left-hand side of the header */
  goBack?: () => void
  /** Label for the back button shown on the left side of header */
  goBackLabel?: string
  /** If `goHome` is defined, only a home button will be shown on the right-hand side of the header */
  goHome?: () => void
}

export type IPageHeaderProps = IProps & IDomProps

interface IState {
  width: number
}
export class PageHeader extends React.Component<IPageHeaderProps, IState> {
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

  renderBackButton = () => (
    <BackButtonContainer
      id="action_page_back_button"
      onClick={this.props.goBack}
      key="action_page_back_button"
    >
      <CircleButton>
        <BackArrowDeepBlue />
      </CircleButton>
      <BackButtonText>{this.props.goBackLabel}</BackButtonText>
    </BackButtonContainer>
  )

  renderHomeButton = () => (
    <Actions>
      <CircleButton id="crcl-btn" onClick={this.props.goHome} key="crcl-btn">
        <Cross color="currentColor" />
      </CircleButton>
    </Actions>
  )

  render() {
    const props: IPageHeaderProps = this.props

    if (this.state.width > grid.breakpoints.lg) {
      return (
        <PageHeaderWrapper id={this.props.id} className={this.props.className}>
          <Left>
            {props.goBack && <Actions>{this.renderBackButton()}</Actions>}
            {props.desktopLeft && !this.props.goBack && (
              <Actions>{props.desktopLeft.map((el) => el)}</Actions>
            )}
            {props.desktopTitle && <Title>{props.desktopTitle}</Title>}
          </Left>

          {props.goHome && this.renderHomeButton()}
          {props.desktopRight && (
            <Actions>{props.desktopRight?.map((el) => el)}</Actions>
          )}
        </PageHeaderWrapper>
      )
    } else {
      return (
        <PageHeaderWrapper id={this.props.id} className={this.props.className}>
          <Left>
            {props.goBack && <Actions>{this.renderBackButton()}</Actions>}
            {props.mobileLeft && !props.goBack && (
              <Actions>{props.mobileLeft.map((el) => el)}</Actions>
            )}
            {props.mobileTitle && <Title>{props.mobileTitle}</Title>}
          </Left>

          {props.goHome && this.renderHomeButton()}
          {props.mobileRight && !props.goHome && (
            <Actions>{props.mobileRight?.map((el) => el)}</Actions>
          )}
        </PageHeaderWrapper>
      )
    }
  }
}
