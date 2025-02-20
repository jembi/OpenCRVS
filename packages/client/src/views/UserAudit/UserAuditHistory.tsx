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
import { messages } from '@client/i18n/messages/views/userSetup'
import styled, { withTheme } from 'styled-components'
import React, { useState } from 'react'
import Bowser from 'bowser'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { Query } from '@client/components/Query'
import { GET_USER_AUDIT_LOG } from '@client/user/queries'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import type {
  GQLUserAuditLogItemWithComposition,
  GQLUserAuditLogResultItem,
  GQLUserAuditLogResultSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { Table } from '@opencrvs/components/lib/Table'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { ITheme } from '@opencrvs/components/lib/theme'
import { ColumnContentAlignment } from '@opencrvs/components/lib/Workqueue'
import { getUserAuditDescription } from '@client/views/SysAdmin/Team/utils'
import { orderBy } from 'lodash'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import subMonths from 'date-fns/subMonths'
import {
  IOnlineStatusProps,
  withOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import {
  GetUserAuditLogQuery,
  UserAuditLogResultItem
} from '@client/utils/gateway'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import format from '@client/utils/date-formatting'
import { Link } from '@opencrvs/components'
import { Text } from '@opencrvs/components/lib/Text'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { usePermissions } from '@client/hooks/useAuthorization'
import * as routes from '@client/navigation/routes'
import { useNavigate } from 'react-router-dom'
import { formatUrl } from '@client/navigation'

const DEFAULT_LIST_SIZE = 10

const TableDiv = styled.div`
  overflow: auto;
`

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RecentActionsHolder = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey200};
`

const AuditContent = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
`

const BoldContent = styled(Text)``

interface IBaseProp {
  practitionerId: string
  practitionerName: string | null | undefined
}

type Props = WrappedComponentProps &
  IBaseProp &
  IOnlineStatusProps & {
    theme: ITheme
  }

enum SORTED_COLUMN {
  ACTION = 'actionDescriptionString',
  EVENT = 'eventType',
  RECORD = 'trackingIdString',
  DATE = 'auditTimeValue',
  DEVICE = 'deviceIpAddress'
}

const ADMIN_ACTIONS = ['DEACTIVATE', 'REACTIVATE', 'EDIT_USER', 'CREATE_USER']

type State = {
  timeStart: Date
  timeEnd: Date
  viewportWidth: number
  sortOrder: SORT_ORDER
  sortedColumn: SORTED_COLUMN
  currentPageNumber: number
  showModal: boolean
  actionDetailsData: UserAuditLogResultItem | null
}

const isUserAuditItemWithDeclarationDetials = (
  item: GQLUserAuditLogResultItem
): item is GQLUserAuditLogItemWithComposition => {
  return 'data' in item
}

function UserAuditHistoryComponent(props: Props) {
  const navigate = useNavigate()
  window.__localeId__ = props.intl.locale

  const [state, setState] = useState<State>({
    timeStart: subMonths(new Date(Date.now()), 1),
    timeEnd: new Date(Date.now()),
    viewportWidth: useWindowSize().width,
    currentPageNumber: 1,
    sortOrder: SORT_ORDER.DESCENDING,
    sortedColumn: SORTED_COLUMN.DATE,
    showModal: false,
    actionDetailsData: null
  })

  const { canSearchRecords } = usePermissions()

  function setDateRangePickerValues(startDate: Date, endDate: Date) {
    setState((prevState) => ({
      ...prevState,
      timeStart: startDate,
      timeEnd: endDate
    }))
  }

  function toggleSortOrder(columnName: SORTED_COLUMN) {
    setState((prevState) => ({
      ...prevState,
      sortedColumn: columnName,
      sortOrder:
        prevState.sortOrder === SORT_ORDER.DESCENDING
          ? SORT_ORDER.ASCENDING
          : SORT_ORDER.DESCENDING
    }))
  }

  function getAuditColumns() {
    const { intl } = props
    return [
      {
        label: intl.formatMessage(messages.auditActionColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'actionDescription',
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.ACTION)
      },
      {
        label: intl.formatMessage(messages.auditTrackingIDColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'trackingId',
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.RECORD)
      },
      {
        label: intl.formatMessage(messages.auditDeviceIpAddressColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'deviceIpAddress',
        alignment: ColumnContentAlignment.LEFT,
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.DEVICE)
      },
      {
        label: intl.formatMessage(messages.auditDateColumnTitle),
        width: 25,
        key: 'auditTime',
        isSortable: true,
        isSorted: true,
        icon: <ArrowDownBlue />,
        alignment: ColumnContentAlignment.RIGHT,
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.DATE)
      }
    ]
  }

  const toggleActionDetails = (actionItem: UserAuditLogResultItem | null) => {
    setState((prevState) => ({
      ...prevState,
      actionDetailsData: actionItem,
      showModal: !state.showModal
    }))
  }

  function getIpAdress(auditLog: UserAuditLogResultItem) {
    const device = Bowser.getParser(auditLog.userAgent).getResult()

    return (
      [
        device.platform.vendor,
        device.os.name,
        device.browser ? `(${device.browser.name})` : ''
      ]
        .filter(Boolean)
        .join(' ') +
      ' • ' +
      auditLog.ipAddress
    )
  }

  function getActionMessage(auditLog: UserAuditLogResultItem) {
    const actionDescriptor = getUserAuditDescription(auditLog.action)
    return actionDescriptor ? props.intl.formatMessage(actionDescriptor) : ''
  }

  function getAuditData(data: GQLUserAuditLogResultSet) {
    const auditList = data.results.map((userAuditItem) => {
      if (userAuditItem === null) {
        return {}
      }
      const actionMessage = getActionMessage(userAuditItem)

      return {
        actionDescription: !isUserAuditItemWithDeclarationDetials(
          userAuditItem
        ) ? (
          <Link
            font="bold14"
            onClick={() => {
              toggleActionDetails(userAuditItem)
            }}
          >
            {actionMessage}
          </Link>
        ) : canSearchRecords &&
          !ADMIN_ACTIONS.includes(userAuditItem.action) ? (
          <Link
            font="bold14"
            onClick={() => {
              toggleActionDetails(userAuditItem)
            }}
          >
            {actionMessage}
          </Link>
        ) : (
          <BoldContent element="p" variant="h3">
            {actionMessage}
          </BoldContent>
        ),

        actionDescriptionWithAuditTime:
          isUserAuditItemWithDeclarationDetials(userAuditItem) === undefined ? (
            <Link
              onClick={() => {
                toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : canSearchRecords ? (
            <Link
              onClick={() => {
                toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : (
            <BoldContent variant="bold14" color="grey600" element="span">
              {actionMessage}
            </BoldContent>
          ),
        trackingId:
          isUserAuditItemWithDeclarationDetials(userAuditItem) &&
          canSearchRecords ? (
            <Link
              font="bold14"
              onClick={() =>
                navigate(
                  formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                    tab: 'printTab',
                    declarationId: userAuditItem.data.compositionId as string
                  })
                )
              }
            >
              {userAuditItem.data.trackingId}
            </Link>
          ) : isUserAuditItemWithDeclarationDetials(userAuditItem) ? (
            <AuditContent>{userAuditItem.data.trackingId}</AuditContent>
          ) : null,

        deviceIpAddress: getIpAdress(userAuditItem),
        trackingIdString: isUserAuditItemWithDeclarationDetials(userAuditItem)
          ? userAuditItem.data.trackingId
          : null,
        auditTime: format(
          new Date(userAuditItem.time),
          'MMMM dd, yyyy hh:mm a'
        ),
        auditTimeValue: new Date(userAuditItem.time)
      }
    })
    return (
      (auditList &&
        orderBy(auditList, [state.sortedColumn], [state.sortOrder])) ||
      []
    )
  }

  function getLoadingAuditListView(hasError?: boolean) {
    return (
      <>
        <Table
          id="loading-audit-list"
          isLoading={true}
          columns={getAuditColumns()}
          content={[]}
          noResultText={props.intl.formatMessage(messages.noAuditFound)}
          hideTableHeader={
            state.viewportWidth <= props.theme.grid.breakpoints.md
          }
        />
        {hasError && <GenericErrorToast />}
      </>
    )
  }

  const { intl, practitionerId, theme } = props
  const { timeStart, timeEnd, currentPageNumber } = state
  const recordCount = DEFAULT_LIST_SIZE

  return (
    <RecentActionsHolder id="user-audit-list">
      <>
        <>
          <HistoryHeader>
            <Text variant="h3" element="h3" color="copy">
              {intl.formatMessage(messages.auditSectionTitle)}
            </Text>
            <DateRangePicker
              startDate={timeStart}
              endDate={timeEnd}
              onDatesChange={({ startDate, endDate }) => {
                setDateRangePickerValues(startDate, endDate)
              }}
            />
          </HistoryHeader>
          <>
            <Query<GetUserAuditLogQuery>
              query={GET_USER_AUDIT_LOG}
              variables={{
                practitionerId: practitionerId,
                count: recordCount,
                skip: DEFAULT_LIST_SIZE * (currentPageNumber - 1),
                timeStart: timeStart,
                timeEnd: timeEnd
              }}
              fetchPolicy={'no-cache'}
            >
              {({ data, loading, error }) => {
                if (error || !data || !data.getUserAuditLog) {
                  return getLoadingAuditListView(error ? true : false)
                } else {
                  const totalItems = Number(
                    (data &&
                      data.getUserAuditLog &&
                      data.getUserAuditLog.total) ||
                      0
                  )

                  return (
                    <TableDiv>
                      <Table
                        columns={getAuditColumns()}
                        content={getAuditData(data.getUserAuditLog)}
                        noResultText={intl.formatMessage(messages.noAuditFound)}
                        fixedWidth={1088}
                        isLoading={loading}
                        hideTableHeader={
                          state.viewportWidth <= theme.grid.breakpoints.md
                        }
                        pageSize={DEFAULT_LIST_SIZE}
                      />
                      <Pagination
                        currentPage={state.currentPageNumber}
                        totalPages={Math.ceil(totalItems / DEFAULT_LIST_SIZE)}
                        onPageChange={(page: number) =>
                          setState((prevState) => ({
                            ...prevState,
                            currentPageNumber: page
                          }))
                        }
                      />

                      {state.actionDetailsData && (
                        <ResponsiveModal
                          actions={[]}
                          handleClose={() => toggleActionDetails(null)}
                          show={state.showModal}
                          responsive={true}
                          title={getActionMessage(state.actionDetailsData)}
                          width={1024}
                          autoHeight={true}
                        >
                          <>
                            <AuditContent>
                              {props.practitionerName} -{' '}
                              {format(
                                new Date(state.actionDetailsData.time),
                                'MMMM dd, yyyy hh:mm a'
                              )}{' '}
                              {' | '}
                              {getIpAdress(state.actionDetailsData)}
                            </AuditContent>
                          </>
                        </ResponsiveModal>
                      )}
                    </TableDiv>
                  )
                }
              }}
            </Query>
          </>
        </>
      </>
    </RecentActionsHolder>
  )
}

export const UserAuditHistory = withTheme(
  injectIntl(withOnlineStatus(UserAuditHistoryComponent))
)
