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
import styled from 'styled-components'
import { BackArrowDeepBlue, Cross } from '../icons'
import { CircleButton } from '../buttons'
import { AppBar, IAppBarProps } from '../AppBar'
import { Text } from '../Text'
const ActionContainer = styled.div`
  width: 100%;
`
const BackButtonContainer = styled.div`
  margin-right: 16px;
  cursor: pointer;
`

const BackButtonText = styled(Text)`
  text-transform: capitalize;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const Container = styled.div<{ hideBackground: boolean | undefined }>`
  ${({ theme }) => theme.fonts.reg16};
  ${({ theme, hideBackground }) => (hideBackground ? '' : theme.shadows.light)};
  color: ${({ theme }) => theme.colors.copy};
  padding: 24px 32px 32px;
  margin: 0 auto;
  max-width: 940px;
  background: ${({ theme, hideBackground }) =>
    hideBackground ? '' : theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 24px 32px;
    min-height: 100vh;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin: 0;
    ${({ hideBackground }) => hideBackground && `padding 0;`}
    min-height: 100vh;
  }
`
interface IProps {
  title?: string
  hideBackground?: boolean
  backLabel?: string
  icon?: () => React.ReactNode
  id?: string
  goHome?: () => void
  children?: React.ReactNode
  goBack: () => void
}

export const ActionPageLight = ({
  id,
  title,
  hideBackground,
  icon,
  backLabel,
  goBack,
  goHome,
  children
}: IProps) => {
  const getHeaderLeft = () => {
    return (
      <BackButtonContainer
        id="action_page_back_button"
        onClick={goBack}
        key="action_page_back_button"
      >
        <CircleButton>{(icon && icon()) || <BackArrowDeepBlue />}</CircleButton>
        <BackButtonText variant="bold16" element="span">
          {backLabel ? backLabel : ''}
        </BackButtonText>
      </BackButtonContainer>
    )
  }

  const getHeaderRight = () => {
    return (
      goHome && (
        <CircleButton id="crcl-btn" onClick={goHome} key="crcl-btn">
          <Cross color="currentColor" />
        </CircleButton>
      )
    )
  }

  const appBarProps: IAppBarProps = {
    id: 'appBar',
    mobileTitle: title,
    mobileLeft: getHeaderLeft(),
    mobileRight: getHeaderRight(),
    desktopTitle: title,
    desktopLeft: getHeaderLeft(),
    desktopRight: getHeaderRight()
  }

  return (
    <ActionContainer id={id}>
      <AppBar {...appBarProps} />
      <Container hideBackground={hideBackground}>{children}</Container>
    </ActionContainer>
  )
}
