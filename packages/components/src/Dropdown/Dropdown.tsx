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

import React, { ReactNode, useEffect } from 'react'
import { disabled } from '../Button/Button.styles'
import styled from 'styled-components'
import { DropdownProvider, useDropdown } from './DropdownContext'

const StyledWrapper = styled.nav`
  position: relative;
  display: flex;
`

const StyledTrigger = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    ['popovertarget'].includes(prop) || defaultValidatorFn(prop)
  // Forward popovertarget prop directly
})<{ popovertarget: string; dropdownName: string }>`
  anchor-name: ${({ dropdownName }) => `--Dropdown-Anchor-${dropdownName}`};
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
`

type StyledContentProp = {
  position: string
  offsetX: number
  offsetY: number
  popover: string
  dropdownName: string
}
const StyledContent = styled.ul.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    ['popover'].includes(prop) || defaultValidatorFn(prop)
  // Forward popover prop directly
})<StyledContentProp>`
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.light};
  text-align: left;
  min-width: 256px;
  width: auto;
  white-space: nowrap;
  padding: 4px;
  position-anchor: ${({ dropdownName }) => `--Dropdown-Anchor-${dropdownName}`};
  inset-area: ${({ position }) => position};
  position-area: ${({ position }) => position};
  margin: 0;
  margin: ${({ offsetX, offsetY }) => `${offsetY}px ${offsetX}px`};
  list-style: none;
`

const Label = styled.li`
  ${({ theme }) => theme.fonts.reg14};
  padding: 6px 12px;
  white-space: normal;
  max-width: 250px;
`

const Separator = styled.div<{ weight: number }>`
  border-bottom: ${({ weight }) => `${weight}px solid `}
    ${({ theme }) => theme.colors.grey300};
  margin: 4px 0;
`

const MenuItem = styled.li<{ disabled?: boolean }>`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey600};
  display: flex;
  align-items: center;
  gap: 12px;
  outline: none;
  cursor: pointer;
  border-radius: 2px;
  padding: 8px 12px;
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:focus-visible {
    background-color: ${({ theme }) => theme.colors.yellow};
  }
  ${(props) => props.disabled && disabled}
`

export type IDropdownPosition =
  | 'none'
  | 'top left'
  | 'start end'
  | 'block-start center'
  | 'inline-start block-end'
  | 'x-start y-end'
  | 'center y-self-end'
  | 'top span-left'
  | 'center span-start'
  | 'inline-start span-block-end'
  | 'y-start span-x-end'
  | 'top span-all'
  | 'block-end span-all'
  | 'x-self-start span-all'
  | 'top'
  | 'inline-start'
  | 'center'
  | 'span-all'
  | 'end'

export const DropdownMenu = ({
  children,
  id
}: {
  children: ReactNode
  id: string
}) => {
  return (
    <DropdownProvider id={id}>
      <StyledWrapper id={id + '-dropdownMenu'}>{children}</StyledWrapper>
    </DropdownProvider>
  )
}

const Trigger: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { dropdownName } = useDropdown()
  return (
    <StyledTrigger
      popovertarget={`${dropdownName}-Dropdown-Content`}
      dropdownName={dropdownName}
    >
      {children}
    </StyledTrigger>
  )
}
DropdownMenu.Trigger = Trigger

const Content: React.FC<{
  position?: string
  offsetX?: number
  offsetY?: number
  children: ReactNode
}> = ({
  position = 'bottom span-left',
  offsetX = 0,
  offsetY = 10,
  children
}) => {
  const { dropdownName, setFocusedIndex } = useDropdown()

  useEffect(() => {
    const popover = document.getElementById(dropdownName + '-Dropdown-Content')
    const onTogglePopover = (event: Event & { newState: string }) => {
      if (event.newState === 'open') {
        setFocusedIndex(0)
      } else {
        setFocusedIndex(-1)
      }
    }

    popover?.addEventListener('toggle', onTogglePopover)

    return () => {
      popover?.removeEventListener('toggle', onTogglePopover)
    }
  }, [setFocusedIndex, dropdownName])

  return (
    <StyledContent
      position={position}
      offsetX={offsetX}
      offsetY={offsetY}
      popover="auto"
      id={`${dropdownName}-Dropdown-Content`}
      dropdownName={dropdownName}
    >
      {children}
    </StyledContent>
  )
}

DropdownMenu.Content = Content

DropdownMenu.Label = ({ children }: { children: string | JSX.Element }) => (
  <Label>{children}</Label>
)

const Item = ({
  onClick: onClickHandler = () => {},
  children,
  disabled = false
}: {
  onClick?: () => void
  children: ReactNode
  disabled?: boolean
}) => {
  const { addItemRef, handleKeyDown, closeDropdown } = useDropdown()

  const keyDownhandler = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClickHandler()
      closeDropdown()
    } else if (e.key === 'Escape') {
      closeDropdown()
    } else handleKeyDown(e)
  }

  return (
    <MenuItem
      onClick={() => {
        onClickHandler()
        closeDropdown()
      }}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      ref={(item) => addItemRef(item)}
      onKeyDown={keyDownhandler}
    >
      {children}
    </MenuItem>
  )
}
DropdownMenu.Item = Item

DropdownMenu.Separator = ({ weight = 1 }: { weight?: number }) => (
  <Separator weight={weight} />
)
