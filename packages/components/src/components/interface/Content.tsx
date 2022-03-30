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
import { ReactElement } from 'react'
import styled, { ThemeConsumer } from 'styled-components'
import { colors } from '../colors'
const Container = styled.div<{ size: string }>`
  z-index: 1;
  position: relative;
  margin: 0 auto;
  max-width: ${({ size }) => (size === 'large' ? '1140px' : '778px')};
  height: 100%;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`
const Header = styled.div`
  display: flex;
  align-items: center;
  height: 72px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  padding-right: 32px;
  padding-left: 32px;
`
const Footer = styled.div`
  display: flex;
  height: 72px;
  padding-top: 20px;
  padding-right: 32px;
  padding-left: 32px;
  margin-bottom: 32px;
`

export const SubHeader = styled.div`
  padding-top: 20px;
  padding-right: 32px;
  padding-left: 32px;
  color: rgb(89, 92, 95);
  ${({ theme }) => theme.fonts.reg18};
`
export const Body = styled.div`
  padding-top: 24px;
  padding-right: 32px;
  padding-left: 32px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
`
const TopActionBar = styled.div`
  display: flex;
  gap: 28px;
  margin-left: auto;
`
const BottomActionBar = styled.div`
  display: flex;
  gap: 28px;
  margin-right: auto;
`
const TitleContainer = styled.div<{ titleColor?: keyof typeof colors }>`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-right: auto;
  color: ${({ theme, titleColor }) => titleColor && theme.colors[titleColor]};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
`
const Icon = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
`

export enum ContentSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

interface IProps {
  icon?: () => React.ReactNode
  title?: string
  topActionButtons?: ReactElement[]
  subtitle?: string
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  size?: ContentSize
  titleColor?: keyof typeof colors
}

export class Content extends React.Component<IProps> {
  render() {
    const {
      icon,
      title,
      titleColor,
      topActionButtons,
      subtitle,
      children,
      bottomActionButtons,
      size
    } = this.props

    return (
      <Container size={size as string}>
        <Header>
          <TitleContainer titleColor={titleColor}>
            {icon && <Icon id={`content-icon`}>{icon()}</Icon>}
            {title && <Title id={`content-name`}>{title}</Title>}
          </TitleContainer>
          {topActionButtons && <TopActionBar>{topActionButtons}</TopActionBar>}
        </Header>
        {subtitle && <SubHeader>{subtitle}</SubHeader>}
        {children && <Body>{children}</Body>}

        {bottomActionButtons && (
          <Footer>
            <BottomActionBar>{bottomActionButtons}</BottomActionBar>
          </Footer>
        )}
      </Container>
    )
  }
}
