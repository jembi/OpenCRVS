import * as React from 'react'
import styled from 'styled-components'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { colors } from '../../colors'
const InputHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const Required = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.danger};
  flex-grow: 0;
`

const ComponentWrapper = styled.span`
  display: flex;
`

const Padding = styled.span`
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }: any) => theme.colors.accent};
`

const InputDescription = styled.p<{
  ignoreMediaQuery?: boolean
}>`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ theme }: any) => theme.colors.copy};

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export interface IInputFieldProps {
  id: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  touched: boolean
  error?: string
  prefix?: string | JSX.Element
  postfix?: string | JSX.Element
  optionalLabel: string
  children: React.ReactNode
  ignoreMediaQuery?: boolean
  hideAsterisk?: boolean
  mode?: THEME_MODE
}

export enum THEME_MODE {
  DARK = 'dark'
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const {
      id,
      label,
      required = true,
      description,
      error,
      touched,
      ignoreMediaQuery,
      hideAsterisk,
      mode
    } = this.props

    const postfix = this.props.postfix as React.ComponentClass<any> | string

    const { prefix } = this.props

    let color: string | undefined
    let hideBorder: boolean
    if (mode && mode === THEME_MODE.DARK) {
      color = colors.white
      hideBorder = true
    }
    const children = React.Children.map(
      this.props.children,
      (node: React.ReactElement<any>) => {
        return React.cloneElement(node, { hideBorder })
      }
    )
    return (
      <div>
        <InputHeader>
          {label && (
            <InputLabel
              id={`${id}_label`}
              disabled={this.props.disabled}
              ignoreMediaQuery={ignoreMediaQuery}
              color={color}
            >
              {label}
              {required && !hideAsterisk && (
                <Required disabled={this.props.disabled}>&nbsp;*</Required>
              )}
            </InputLabel>
          )}
        </InputHeader>

        <ComponentWrapper>
          {prefix && <Padding>{prefix}</Padding>}
          {children}
          {postfix && <Padding>{postfix}</Padding>}
        </ComponentWrapper>

        {error && touched && (
          <InputError
            id={this.props.id + '_error'}
            ignoreMediaQuery={ignoreMediaQuery}
            color={color}
          >
            {error}
          </InputError>
        )}

        {description && (
          <InputDescription ignoreMediaQuery={ignoreMediaQuery} color={color}>
            {description}
          </InputDescription>
        )}
      </div>
    )
  }
}
