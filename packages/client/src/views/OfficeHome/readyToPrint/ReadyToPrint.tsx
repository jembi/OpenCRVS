/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  goToDeclarationRecordAudit,
  goToPrintCertificate
} from '@client/navigation'
import { transformData } from '@client/search/transformer'
import { ITheme } from '@client/styledComponents'
import {
  ColumnContentAlignment,
  GridTable,
  IAction,
  SORT_ORDER,
  COLUMNS
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { IStoreState } from '@client/store'
import { IDeclaration, DOWNLOAD_STATUS } from '@client/declarations'
import { Action } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { useState } from 'react'

interface IBasePrintTabProps {
  theme: ITheme
  goToPrintCertificate: typeof goToPrintCertificate
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  pageSize: number
  viewPortWidth: number
}

type IPrintTabProps = IntlShapeProps & IBasePrintTabProps

const ReadyToPrintComponent = (props: IPrintTabProps) => {
  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.REGISTERED)
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.DESCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortOrder(newSortOrder)
    setSortedCol(newSortedCol)
  }

  const getColumns = () => {
    if (props.viewPortWidth > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: props.intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: sortedCol === COLUMNS.EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.registered),
          width: 18,
          key: COLUMNS.REGISTERED,
          isSorted: sortedCol === COLUMNS.REGISTERED,
          sortFunction: onColumnClick
        },
        {
          width: 18,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    } else {
      return [
        {
          label: props.intl.formatMessage(constantsMessages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  const transformRegisteredContent = (data: GQLEventSearchResultSet) => {
    const { intl } = props
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, props.intl)
    const items = transformedData.map((reg, index) => {
      const foundDeclaration = props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const actions: IAction[] = []
      const downloadStatus = foundDeclaration?.downloadStatus

      if (props.viewPortWidth > props.theme.grid.breakpoints.lg) {
        actions.push({
          label: props.intl.formatMessage(buttonMessages.print),
          disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              props.goToPrintCertificate(
                reg.id,
                reg.event.toLocaleLowerCase() || ''
              )
            }
          }
        })
      }
      actions.push({
        actionComponent: (
          <DownloadButton
            downloadConfigs={{
              event: reg.event,
              compositionId: reg.id,
              action: Action.LOAD_REVIEW_DECLARATION,
              assignment: reg.assignment
            }}
            key={`DownloadButton-${index}`}
            status={downloadStatus}
          />
        )
      })
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''
      const dateOfEvent =
        reg.dateOfEvent &&
        reg.dateOfEvent.length > 0 &&
        new Date(reg.dateOfEvent)
      const registered =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          isBoldLink={true}
          onClick={() => props.goToDeclarationRecordAudit('printTab', reg.id)}
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() => props.goToDeclarationRecordAudit('printTab', reg.id)}
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )
      return {
        ...reg,
        event,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName status={reg.declarationStatus} name={NameComponent} />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={NameComponent}
            event={event}
          />
        ),
        dateOfEvent,
        registered,
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)

    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        registered:
          item.registered && formattedDuration(item.registered as Date)
      }
    })
  }

  const { intl, queryData, paginationId, onPageChange, pageSize } = props
  const { data } = queryData
  const totalPages = props.queryData?.data?.totalItems
    ? Math.ceil(props.queryData.data.totalItems / pageSize)
    : 0
  const isShowPagination =
    props.queryData?.data?.totalItems &&
    props.queryData.data.totalItems > pageSize
      ? true
      : false
  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.print)}
      isMobileSize={props.viewPortWidth < props.theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={props.loading}
      error={props.error}
      noResultText={intl.formatMessage(wqMessages.noRecordsReadyToPrint)}
      noContent={transformRegisteredContent(data).length <= 0}
    >
      <GridTable
        content={transformRegisteredContent(data)}
        columns={getColumns()}
        loading={props.loading}
        sortOrder={sortOrder}
        sortedCol={sortedCol}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const ReadyToPrint = connect(mapStateToProps, {
  goToPrintCertificate,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ReadyToPrintComponent)))
