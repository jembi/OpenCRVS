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

import { css } from 'styled-components'

export const base = ({ fullWidth }: { fullWidth?: boolean }) => css`
  ${({ theme }) => theme.fonts.bold16};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 0;
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  height: 40px;
  padding: 0 12px;
  transition: all 100ms ease-out;
  opacity: 1;
  margin: 0;
  background: transparent;
  gap: 8px;

  ${fullWidth &&
  css`
    width: 100%;
  `}

  svg {
    vertical-align: top;
    pointer-events: none;
  }

  &:focus-visible {
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
  }
`

export const primary = ({ loading }: { loading?: boolean }) => css`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};

  svg {
    color: ${({ theme }) => theme.colors.white};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.primaryDarker};
  }

  ${loading &&
  css`
    background: ${({ theme }) => theme.colors.primaryDark};
  `}
`

export const secondary = css`
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.copy};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    border: 1.5px solid ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }

  &:focus-visible {
    border: 1.5px solid ${({ theme }) => theme.colors.grey600};
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
  }
`
export const secondaryNegative = css`
  border: 1.5px solid ${({ theme }) => theme.colors.negative};
  color: ${({ theme }) => theme.colors.copy};

  svg {
    color: ${({ theme }) => theme.colors.negative};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    border: 1.5px solid ${({ theme }) => theme.colors.negativeDark};
  }

  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }

  &:focus-visible {
    border: 1.5px solid ${({ theme }) => theme.colors.negativeDarker};
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.negativeDarker};
  }
`

export const tertiary = css`
  color: ${({ theme }) => theme.colors.copy};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }

  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

export const positive = css`
  background: ${({ theme }) => theme.colors.positive};
  color: ${({ theme }) => theme.colors.white};

  svg {
    color: ${({ theme }) => theme.colors.positive};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.positiveDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.positiveDarker};
  }
`

export const negative = css`
  background: ${({ theme }) => theme.colors.negative};
  color: ${({ theme }) => theme.colors.white};

  svg {
    color: ${({ theme }) => theme.colors.white};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.negativeDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.negativeDarker};
  }
`

export const icon = css`
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const iconPrimary = css`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    background: ${({ theme }) => theme.colors.primaryDarker};
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const small = ({ loading }: { loading?: boolean }) => css`
  ${({ theme }) => theme.fonts.bold14};
  height: 32px;
  padding: 8px;

  ${loading &&
  css`
    svg {
      margin-left: -1px;
      margin-right: 6px;
    }
  `}
`

export const medium = css`
  ${({ theme }) => theme.fonts.bold16};
  height: 40px;
  padding: 0 12px;
`

export const large = css`
  ${({ theme }) => theme.fonts.reg18};
  height: 54px;
  padding: 0 16px;
`

export const loading = css`
  opacity: 0.8;
  pointer-events: none;
  user-select: none;

  svg {
    margin-left: -2px;
    margin-right: 8px;
  }
`

export const disabled = css`
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
`
