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
import styled, { withTheme } from 'styled-components'
import { grid } from '../grid'
import { IColumn, IActionObject } from './types'
import { WorkqueueRowDesktop } from './components/WorkqueueRowDesktop'
import { WorkqueueRowMobile } from './components/WorkqueueRowMobile'
import { ITheme } from '../theme'
import { SortIcon } from '../icons/SortIcon'
import { IAction } from '../common-types'
import { ListItemAction } from './components/ListItemAction'
import { useWindowSize } from '../hooks'
import { Text } from '@opencrvs/components/src/Text'

const Wrapper = styled.div`
  width: 100%;
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  background-color: ${({ theme }) => theme.colors.grey100};
  ${({ theme }) => theme.fonts.bold14};
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

export const NoResultText = styled(Text)`
  text-align: left;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    text-align: center;
  }
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  color?: string
  paddingRight?: number | null
}>`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: ${({ paddingRight }) => (paddingRight ? paddingRight : 10)}px;
  ${({ color }) => color && `color: ${color};`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ColumnContainer = styled.div<{
  width: number
  clickable: boolean
}>`
  width: ${({ width }) => width}%;
  display: flex;
  ${({ clickable }) => clickable && `cursor: pointer;`}
`

const ColumnTitleWrapper = styled.div<{ alignment?: string }>`
  align-self: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`

const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
`

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export enum COLUMNS {
  ICON_WITH_NAME = 'iconWithName',
  ICON_WITH_NAME_EVENT = 'iconWithNameEvent',
  EVENT = 'event',
  DATE_OF_EVENT = 'dateOfEvent',
  SENT_FOR_REVIEW = 'sentForReview',
  SENT_FOR_UPDATES = 'sentForUpdates',
  SENT_FOR_APPROVAL = 'sentForApproval',
  SENT_FOR_VALIDATION = 'sentForValidation',
  REGISTERED = 'registered',
  LAST_UPDATED = 'lastUpdated',
  ACTIONS = 'actions',
  NOTIFICATION_SENT = 'notificationSent',
  NAME = 'name',
  TRACKING_ID = 'trackingId',
  REGISTRATION_NO = 'registrationNumber',
  NONE = 'none'
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

interface IComponentWithTheme {
  theme: ITheme
}

interface IWorkqueueProps extends IComponentWithTheme {
  /** Workqueue data */
  content: Array<Record<string, unknown>>
  /** Data columns */
  columns: IColumn[]
  /** Text if there are now content on the table */
  noResultText?: string
  /** Hides `noResultText` if true */
  loading?: boolean
  /** Hides Workqueue header */
  hideTableHeader?: boolean
  /** Globally enables or disables clickable headers */
  clickable?: boolean
  /** Sets the direction of the sort icon */
  sortOrder?: SORT_ORDER
  /** Adds `border-bottom: 0` on desktop */
  hideLastBorder?: boolean
}

const WorkqueueComp = ({
  content,
  columns,
  noResultText,
  loading,
  hideTableHeader,
  clickable,
  sortOrder,
  hideLastBorder,
  theme
}: IWorkqueueProps) => {
  const { width } = useWindowSize()

  const renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    idKey: number,
    alignment?: ColumnContentAlignment
  ) => {
    return (
      <ActionWrapper key={idKey} width={width} alignment={alignment}>
        <ListItemAction id={`ListItemAction-${key}`} actions={actions} />
      </ActionWrapper>
    )
  }

  const getRowClickHandler = (itemRowClickHandler: IActionObject[]) => {
    return itemRowClickHandler[0].handler
  }

  const isMobileView = width < theme.grid.breakpoints.lg
  return (
    <Wrapper>
      {content.length > 0 &&
        width > grid.breakpoints.lg &&
        !hideTableHeader && (
          <TableHeader>
            {columns.map((preference, index) => (
              <ColumnContainer
                key={index}
                width={preference.width}
                onClick={
                  preference.sortFunction
                    ? () => preference.sortFunction?.(preference.key)
                    : undefined
                }
                clickable={Boolean(preference.sortFunction)}
              >
                <ColumnTitleWrapper>
                  {preference.label && preference.label}
                  {preference.sortFunction && (
                    <SortIcon
                      isSorted={Boolean(preference.isSorted)}
                      isDescending={sortOrder === SORT_ORDER.DESCENDING}
                    />
                  )}
                </ColumnTitleWrapper>
              </ColumnContainer>
            ))}
          </TableHeader>
        )}
      {!isMobileView ? (
        <WorkqueueRowDesktop
          columns={columns}
          displayItems={content}
          clickable={clickable}
          getRowClickHandler={getRowClickHandler}
          renderActionBlock={renderActionBlock}
          hideLastBorder={hideLastBorder}
        />
      ) : (
        <WorkqueueRowMobile
          columns={columns}
          displayItems={content}
          clickable={clickable}
          getRowClickHandler={getRowClickHandler}
          renderActionBlock={renderActionBlock}
        />
      )}
      {!loading && noResultText && content.length <= 0 && (
        <NoResultText
          id="no-record"
          variant="bold16"
          color="grey600"
          element="span"
        >
          {noResultText}
        </NoResultText>
      )}
    </Wrapper>
  )
}

export const Workqueue = withTheme(WorkqueueComp)
