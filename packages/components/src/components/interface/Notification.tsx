import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Button } from '../buttons'
import { classNames } from 'react-select/lib/utils'
export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: ((event: React.MouseEvent<HTMLDivElement>) => void)
  className?: string
}

const styledNotification = styled.div.attrs({})
const easeIn = keyframes`
  from { bottom: -100px; }
  to { bottom: 0; }
`
const NotificationContainer = styledNotification`
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  position: fixed;
  left: 0;
  right: 0;
  bottom: -100px;
  height:100px;
  width: 100%;
  display:flex;
  background: ${({ theme }: any) => theme.colors.accent};
  z-index: 1;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  &.show {
    animation: ${easeIn} 500ms;
    bottom:0;
  }

  &.success, &.error, &.warning {
    background: ${({ theme }: any) => theme.colors.placeholder};
    border-top: 10px solid;
  }

  &.success {
    border-color: ${({ theme }: any) => theme.colors.success};
  }

  &.error {
    border-color: ${({ theme }: any) => theme.colors.error};
  }
  &.warning {
    border-color: ${({ theme }: any) => theme.colors.warning};
  }
  &.clickable {
    cursor:pointer;
  }
`

const NotificationMessage = styled.div`
  background: ${({ theme }: any) => theme.colors.copyAlpha80};
  border-radius: 21px;
  padding: 5px 10px;
  margin: 5px;
  color: ${({ theme }: any) => theme.colors.white};
  font-weight: bold;
`

export class Notification extends React.Component<IProps> {
  render() {
    const { id, type, show, children, callback, className } = this.props

    return (
      <NotificationContainer
        id={id}
        onClick={callback}
        className={
          (type ? type : '') +
          (show ? ' show' : '') +
          ' ' +
          className +
          (callback ? ' clickable' : '')
        }
      >
        <NotificationMessage>{children}</NotificationMessage>
      </NotificationContainer>
    )
  }
}
