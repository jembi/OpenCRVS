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
import styled from 'styled-components'
import React from 'react'

type IButtonSize = 'small' | 'medium' | 'large'

const dimensionMap = {
  small: '24px',
  medium: '32px',
  large: '40px'
}

const Button = styled.button<ICircleButtonProps & { size: IButtonSize }>`
  color: ${({ theme }) => theme.colors.primary};
  transition: background 0.4s ease;
  border: none;
  background: none;
  height: ${({ size }) => dimensionMap[size]};
  width: ${({ size }) => dimensionMap[size]};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  &:hover:not([disabled]) {
    ${({ theme, dark }) =>
      dark
        ? theme.colors.primaryDark
        : 'background-color: ' + theme.colors.grey200};
  }
  &:not([data-focus-visible-added]):not([disabled]):hover {
    ${({ theme, dark }) =>
      dark
        ? theme.colors.primaryDark
        : 'background-color: ' + theme.colors.grey200};
  }
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]):not([disabled]) {
    background: none;
    outline: none;
    color: ${({ color = '#4C68C1' }) => color};
  }
  &:active:not([data-focus-visible-added]):not([disabled]) {
    outline: none;
    background: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:disabled {
    cursor: default;
    path {
      stroke: ${({ theme }) => theme.colors.grey200};
    }
  }
`
interface ICircleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IButtonSize
  dark?: boolean
}

export function CircleButton({
  size = 'large',
  children,
  ...props
}: ICircleButtonProps) {
  return (
    <Button size={size} {...props}>
      {children}
    </Button>
  )
}
