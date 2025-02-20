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
import { Text } from '@opencrvs/components/src/Text'

export interface ILeftNavigationProps {
  applicationName: string
  children?: React.ReactNode
  navigationWidth?: number
  avatar?: () => void
  name?: string | null
  role?: string | null
  warning?: JSX.Element | null
  className?: string
  applicationVersion: string
}

const LeftNavigationContainer = styled.div<{
  navigationWidth?: number
}>`
  top: 0;
  display: flex;
  flex-direction: column;
  width: ${({ navigationWidth }) =>
    navigationWidth ? navigationWidth : 282}px;
  height: 100vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ navigationWidth }) => !navigationWidth && `display: none;`}
  }
`
const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 32px 24px;
  text-align: justify;
  border: 0px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const UserName = styled(Text)`
  margin: 25px 0px 5px;
`

const Role = styled(Text)`
  margin: 0px;
`

const ApplicationNameContainer = styled.div`
  padding: 16px 20px;
  height: 56px;
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  box-sizing: border-box;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const ApplicationName = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Version = styled.div`
  color: ${({ theme }) => theme.colors.grey400};
  ${({ theme }) => theme.fonts.reg14};
  height: auto;
  padding: 16px;
`

const Container = styled.div`
  flex: 0 0 auto;
`

const MenuItem = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
`

export const LeftNavigation = (props: ILeftNavigationProps) => {
  return (
    <LeftNavigationContainer
      navigationWidth={props.navigationWidth}
      className={props.className}
    >
      <Container>
        <ApplicationNameContainer>
          <ApplicationName variant="h4" element="h4">
            {props.applicationName}
          </ApplicationName>
        </ApplicationNameContainer>
        <UserInfo>
          <>
            {props.avatar && props.avatar()}
            <UserName variant="h4" element="h4">
              {props.name && props.name}
            </UserName>
            <Role variant="reg12" element="span">
              {props.role && props.role}
            </Role>
          </>
        </UserInfo>
      </Container>
      <MenuItem>{props.children && props.children}</MenuItem>
      <Container>
        <Version>
          {props.warning}
          <span>OpenCRVS v{props.applicationVersion}</span>
        </Version>
      </Container>
    </LeftNavigationContainer>
  )
}
