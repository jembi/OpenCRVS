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
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
`
const ComponentWrapper = styled.span``
const InputDescription = styled.p`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
`

export interface IInputFieldProps {
  id: string
  label?: string
  className?: string
  helperText?: string
  tooltip?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  unit?: string | JSX.Element
  optionalLabel?: string
  children: React.ReactNode
  hideAsterisk?: boolean
  hideErrorLabel?: boolean
  hideInputHeader?: boolean
}

export const InputField = (props: IInputFieldProps) => {
  const {
    id,
    label,
    helperText,
    tooltip,
    required = true,
    description,
    error,
    touched,
    hideAsterisk,
    hideErrorLabel,
    hideInputHeader = false,
    prefix
  } = props

  const postfix = props.postfix as React.ReactNode | string
  const unit = props.unit as React.ReactNode | string

  const isDomElement = (
    nodeType: string | React.JSXElementConstructor<any>
  ) => {
    return typeof nodeType === 'string'
  }

  const children = React.Children.map(
    props.children,
    (node: React.ReactElement) => {
      if (!node) return
      return isDomElement(node.type)
        ? node
        : React.cloneElement(node, { prefix, postfix, unit })
    }
  )

  return (
    <div id={`${id}-form-input`} className={props.className}>
      {!hideInputHeader && (
        <InputHeader>
          {label && (
            <InputLabel
              id={`${id}_label`}
              inputDescriptor={helperText}
              disabled={props.disabled}
              required={required}
              hideAsterisk={hideAsterisk}
              tooltip={tooltip}
            >
              {label}
            </InputLabel>
          )}
        </InputHeader>
      )}

      <ComponentWrapper>{children}</ComponentWrapper>

      {error && touched && !hideErrorLabel && (
        <InputError id={props.id + '_error'}>{error}</InputError>
      )}

      {description && <InputDescription>{description}</InputDescription>}
    </div>
  )
}
