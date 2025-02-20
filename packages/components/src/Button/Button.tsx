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

import React from 'react'
import styled from 'styled-components'
import { Spinner } from '../Spinner'
import * as styles from './Button.styles'

type ButtonSize = 'small' | 'medium' | 'large'
type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'positive'
  | 'negative'
  | 'secondaryNegative'
  | 'icon'
  | 'iconPrimary'

type ButtonModifier = 'disabled' | 'loading'

interface ButtonCustomization extends React.HTMLAttributes<HTMLButtonElement> {
  /** Size of the button */
  size?: ButtonSize
  /** Size of the button */
  fullWidth?: boolean
  /** Element the button renders as */
  element?: 'a' | 'button'
  /** Button type */
  type: ButtonType
}

export type ButtonProps = ButtonCustomization & {
  [modifier in ButtonModifier]?: boolean
}

type StyledButtonProps = Omit<ButtonProps, 'type'> & {
  variant: ButtonType
}
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    // https://styled-components.com/docs/api#shouldforwardprop
    // Leave some props unpassed to DOM
    !['loading'].includes(prop) && defaultValidatorFn(prop)
})<StyledButtonProps>`
  ${styles.base}

  ${(props) => props.size === 'small' && styles.small(props)}
  ${(props) => props.size === 'medium' && styles.medium}
  ${(props) => props.size === 'large' && styles.large}

  ${(props) => props.variant === 'primary' && styles.primary(props)}
  ${(props) => props.variant === 'secondary' && styles.secondary}
  ${(props) =>
    props.variant === 'secondaryNegative' && styles.secondaryNegative}

  ${(props) => props.variant === 'tertiary' && styles.tertiary}
  ${(props) => props.variant === 'positive' && styles.positive}
  ${(props) => props.variant === 'negative' && styles.negative}
  ${(props) => props.variant === 'icon' && styles.icon}
  ${(props) => props.variant === 'iconPrimary' && styles.iconPrimary}

  ${(props) => props.loading && styles.loading}
  ${(props) => props.disabled && styles.disabled}
`

export const Button = ({
  size = 'medium',
  fullWidth,
  element = 'button',
  type,
  loading,
  children,
  ...props
}: ButtonProps) => {
  return (
    <StyledButton
      size={size}
      fullWidth={fullWidth}
      variant={type}
      loading={loading}
      as={element}
      {...props}
    >
      {loading && (
        <Spinner
          id="button-loading"
          size={24}
          baseColor="currentColor"
          style={{ marginRight: '-6px' }}
        />
      )}
      {children}
    </StyledButton>
  )
}
