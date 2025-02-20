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

export interface ISpinner extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  baseColor?: string
  className?: string
  size?: number
}

const StyledSpinner = styled.div<ISpinner>`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  display: flex;
  justify-content: center;
  & svg {
    animation: rotate 2s linear infinite;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;

    & circle {
      stroke: ${({ baseColor }) =>
        baseColor ? baseColor : ({ theme }) => theme.colors.primary};
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

export const Spinner = ({
  id,
  className,
  baseColor,
  size,
  ...rest
}: ISpinner) => (
  <StyledSpinner
    id={id}
    className={className}
    baseColor={baseColor}
    size={size ? size : 48}
    data-testid="spinner"
    {...rest}
  >
    <svg viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
    </svg>
  </StyledSpinner>
)
