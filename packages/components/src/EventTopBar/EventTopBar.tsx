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
import styled from 'styled-components'
import { TertiaryButton, CircleButton } from '../buttons'
import { DeclarationIcon, Cross } from '../icons'
import { Icon } from '../Icon'
import { ToggleMenu } from '../ToggleMenu'

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  width: 100%;
  position: sticky;
  z-index: 1;
`
const TopBarTitle = styled.h4`
  ${({ theme }) => theme.fonts.h4};
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.copy};
`

const Item = styled.span`
  display: flex;
  align-items: center;
`
const TopBarActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export interface IEventTopBarProps {
  id?: string
  title: string
  pageIcon?: JSX.Element
  goHome?: () => void
  saveAction?: IEventTopBarMenuAction
  exitAction?: IEventTopBarMenuAction
  menuItems?: IToggleMenuItem[]
  iconColor?: string
  topBarActions?: React.ReactNode[]
  className?: string
}

export interface IEventTopBarMenuAction {
  handler: () => void
  label: string
}
interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

export const EventTopBar = (props: IEventTopBarProps) => {
  const {
    goHome,
    title,
    saveAction,
    exitAction,
    menuItems,
    iconColor = 'purple',
    topBarActions,
    pageIcon,
    className
  } = props
  return (
    <TopBar className={className}>
      <Item>
        {pageIcon || <DeclarationIcon color={iconColor} />}
        <TopBarTitle>{title}</TopBarTitle>
      </Item>
      <Item>
        {topBarActions && (
          <TopBarActionsContainer>{topBarActions}</TopBarActionsContainer>
        )}
        {goHome && (
          <CircleButton id="crcl-btn" onClick={goHome}>
            <Cross color="currentColor" />
          </CircleButton>
        )}
        {saveAction && (
          <TertiaryButton onClick={saveAction.handler} id="save_draft">
            {saveAction.label}
          </TertiaryButton>
        )}

        {exitAction && (
          <CircleButton id="crcl-btn" onClick={exitAction.handler}>
            <Cross color="currentColor" />
          </CircleButton>
        )}
        {menuItems && (
          <ToggleMenu
            id="eventToggleMenu"
            toggleButton={
              <Icon name="DotsThreeVertical" color="primary" size="large" />
            }
            menuItems={menuItems}
          />
        )}
      </Item>
    </TopBar>
  )
}

/** @deprecated since the introduction of `<Frame>` */
export const FixedEventTopBar = styled(EventTopBar)`
  position: fixed;
`
