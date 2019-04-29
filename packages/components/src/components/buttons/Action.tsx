import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

import { ITheme } from '../theme'
import { Button, IButtonProps } from './Button'
import { ArrowWithGradient } from '../icons'
import { DisabledArrow } from '../icons'

const ActionContainer = styled(Button)`
  width: 100%;
  min-height: 120px;
  padding: 0 ${({ theme }: any) => theme.grid.margin}px;
  background: ${({ theme }: any) => theme.colors.white};
  color: ${({ theme }: any) => theme.colors.white};
  text-align: left;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`

const ActionTitle = styled.h3.attrs<{ disabled?: boolean }>({})`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  font-family: ${({ theme }: any) => theme.fonts.lightFont};
  font-size: 24px;
  margin: 0;
`

const ActionDescription = styled.p.attrs<{ disabled?: boolean }>({})`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.secondary};
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 16px;
  margin: 0;
  margin-top: 3px;
  strong {
    font-family: ${({ theme }: any) => theme.fonts.boldFont};
  }
`

export interface IActionProps extends IButtonProps {
  title: string
  description?: string
  disabled?: boolean
}

export function Action({
  title,
  description,
  disabled,
  ...props
}: IActionProps) {
  return (
    <ActionContainer
      icon={() => (disabled ? <DisabledArrow /> : <ArrowWithGradient />)}
      {...props}
    >
      <div>
        <ActionTitle disabled={disabled}>{title}</ActionTitle>
        {description && (
          <ActionDescription
            disabled={disabled}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
    </ActionContainer>
  )
}

export const ActionList = styled.div`
  z-index: 1;
  position: relative;
  padding: 0 ${({ theme }: any) => theme.grid.margin}px;
`
