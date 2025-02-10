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
import { Cross } from '../icons'
import { Text } from '@opencrvs/components/src/Text'

interface IProps {
  title?: string
  actions: JSX.Element[]
  show: boolean
  handleClose?: () => void
  className?: string
  children: React.ReactNode
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(53, 73, 93, 0.78);
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  width: 70%;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 50px;
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  ${({ theme }) => theme.fonts.reg18};
  position: relative;
`

const Heading = styled(Text)`
  text-align: center;
  margin-bottom: 24px;
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  align-items: center;
`

const ActionItems = styled.div`
  margin: 12px 0;

  &:first-of-type {
    margin-top: 0;
  }
  &:last-of-type {
    margin-bottom: 0;
  }
`

const TopRight = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
`

export const Modal = ({
  title,
  actions,
  show,
  handleClose,
  className,
  children
}: IProps) => {
  if (!show) {
    return null
  }

  return (
    <Backdrop className={className}>
      <ModalContent>
        {title && (
          <Heading variant="h4" color="copy" element="h4">
            {title}
          </Heading>
        )}
        {handleClose && (
          <TopRight onClick={handleClose}>
            <Cross />
          </TopRight>
        )}
        {children}
        <Actions>
          {actions.map((action, i) => (
            <ActionItems key={i}>{action}</ActionItems>
          ))}
        </Actions>
      </ModalContent>
    </Backdrop>
  )
}
