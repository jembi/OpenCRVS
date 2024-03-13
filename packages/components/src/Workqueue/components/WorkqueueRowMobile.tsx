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
import {
  IWorkqueueRow,
  IconWrapper,
  Error,
  ContentWrapper
} from './WorkqueueRowDesktop'
import { IActionObject, IAction } from '../types'

const StyledBox = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  box-sizing: border-box;
  border-radius: 4px;
  height: 80px;
  max-width: 520px;
  background-color: ${({ theme }) => theme.colors.white};
  margin: auto;
  margin-bottom: 8px;
`

const RowWrapper = styled.div<{
  clickable?: boolean
}>`
  width: 100%;
  padding: 16px 8px 16px 16px;
  display: flex;
  align-items: flex-start;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`

export const WorkqueueRowMobile = (props: IWorkqueueRow) => {
  return (
    <>
      {props.displayItems.map((item, index) => {
        const clickable = props.clickable || Boolean(item.rowClickable)
        return (
          <StyledBox key={index} id="styledBox">
            <RowWrapper
              id={'row_' + index}
              clickable={clickable}
              onClick={() =>
                clickable &&
                props.getRowClickHandler(
                  item.rowClickHandler as IActionObject[]
                )()
              }
            >
              {props.columns.map((preference, indx) => {
                if (preference.isActionColumn) {
                  return props.renderActionBlock(
                    item.id as string,
                    item[preference.key] as IAction[],
                    preference.width,
                    index,
                    indx,
                    preference.alignment
                  )
                } else if (preference.isIconColumn) {
                  return (
                    <IconWrapper
                      key={indx}
                      width={preference.width}
                      alignment={preference.alignment}
                      color={preference.color}
                    >
                      {(item.icon as JSX.Element) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </IconWrapper>
                  )
                } else {
                  return (
                    <ContentWrapper
                      key={indx}
                      width={preference.width}
                      alignment={preference.alignment}
                      color={preference.color}
                    >
                      {(item[preference.key] as string) || (
                        <Error>{preference.errorValue}</Error>
                      )}
                    </ContentWrapper>
                  )
                }
              })}
            </RowWrapper>
          </StyledBox>
        )
      })}
    </>
  )
}
