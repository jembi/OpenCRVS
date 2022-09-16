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

import React from 'react'
import { Table } from '@opencrvs/components/lib/Table'
import { Divider } from '@opencrvs/components/lib/Divider'
import styled from '@client/styledComponents'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { getFormattedDate, getPageItems, getStatusLabel } from './utils'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { CMethodParams } from './ActionButtons'
import { LinkButton } from '@opencrvs/components/lib/buttons/LinkButton'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import {
  IAvatar,
  getIndividualNameObj,
  IUserDetails
} from '@client/utils/userUtils'
import { AvatarSmall } from '@client/components/Avatar'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'
import { DOWNLOAD_STATUS, SUBMISSION_STATUS } from '@client/declarations'
import { useIntl } from 'react-intl'
import { Box } from '@opencrvs/components/lib/icons/Box'
import { v4 as uuid } from 'uuid'
import { History } from '@client/utils/gateway'

const TableDiv = styled.div`
  overflow: auto;
`

const Heading = styled.h3`
  ${({ theme }) => theme.fonts.h3}
  margin-bottom: 0px !important;
`

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 100%;
  border-radius: 4px;
  margin: 15px 0px;
`

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

export interface IActionDetailsData {
  [key: string]: any
}

export const GetLink = ({
  status,
  onClick
}: {
  status: string
  onClick: () => void
}) => {
  return (
    <>
      <LinkButton style={{ textAlign: 'left' }} onClick={onClick}>
        {status}
      </LinkButton>
    </>
  )
}

const HealthSystemLogo = styled.div`
  border-radius: 100%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  margin-right: 10px;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.grey200};
`

const HealthSystemLocation = styled.p`
  ${({ theme }) => theme.fonts.reg16}
`

function HealthSystemUser() {
  const intl = useIntl()
  return (
    <NameAvatar>
      <HealthSystemLogo>
        <Box />
      </HealthSystemLogo>
      <span>{intl.formatMessage(userMessages.healthSystem)}</span>
    </NameAvatar>
  )
}

const GetNameWithAvatar = ({
  id,
  nameObject,
  avatar,
  language
}: {
  id: string
  nameObject: Array<GQLHumanName | null>
  avatar: IAvatar
  language: string
}) => {
  const nameObj = getIndividualNameObj(nameObject, language)
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={userName} />
      <span>{userName}</span>
    </NameAvatar>
  )
}

const getIndexByAction = (histories: any, index: number): number => {
  const newHistories = [...histories]
  newHistories.map((item) => {
    item.uuid = uuid()
    return item
  })

  const uid = newHistories[index].uuid
  const actionIndex = newHistories
    .filter((item) => item.action === newHistories[index].action)
    .reverse()
    .findIndex((item) => item.uuid === uid)

  return actionIndex
}

export const GetHistory = ({
  intl,
  draft,
  goToUserProfile,
  goToTeamUserList,
  toggleActionDetails,
  userDetails
}: CMethodParams & {
  toggleActionDetails: (actionItem: IActionDetailsData, index?: number) => void
}) => {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const isFieldAgent =
    userDetails?.role && FIELD_AGENT_ROLES.includes(userDetails.role)
      ? true
      : false
  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10
  const onPageChange = (currentPageNumber: number) =>
    setCurrentPageNumber(currentPageNumber)
  if (
    !(draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) &&
    !(draft?.submissionStatus === SUBMISSION_STATUS.DRAFT)
  )
    return (
      <>
        <Divider />
        <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
        <LargeGreyedInfo />
      </>
    )
  let allHistoryData = (draft.data.history || []) as unknown as {
    [key: string]: any
  }[]
  if (!allHistoryData.length && userDetails) {
    allHistoryData.unshift({
      date: new Date(draft.savedOn || Date.now()).toString(),
      action: 'STARTED',
      user: {
        id: userDetails.userMgntUserID,
        name: userDetails.name,
        avatar: userDetails.avatar,
        role: userDetails.role
      },
      office: userDetails.primaryOffice,
      comments: [],
      input: [],
      output: []
    })
  }

  if (!window.config.EXTERNAL_VALIDATION_WORKQUEUE) {
    allHistoryData = allHistoryData.filter((obj: { [key: string]: any }) => {
      return obj.action !== 'WAITING_VALIDATION'
    })
  }

  // TODO: We need to figure out a way to sort the history in backend
  const sortedHistory = allHistoryData.sort((fe, se) => {
    return new Date(fe.date).getTime() - new Date(se.date).getTime()
  })

  const historiesForDisplay = getPageItems(
    currentPageNumber,
    DEFAULT_HISTORY_RECORD_PAGE_SIZE,
    sortedHistory
  )

  const historyData = (historiesForDisplay as History[]).map((item, index) => ({
    date: getFormattedDate(item?.date),
    action: (
      <GetLink
        status={getStatusLabel(
          item?.action as string,
          !!item.reinstated,
          intl,
          item?.user as IUserDetails
        )}
        onClick={() => {
          const actionIndex = getIndexByAction(historiesForDisplay, index)
          toggleActionDetails(item, actionIndex)
        }}
      />
    ),
    user:
      item.dhis2Notification && !item.user?.id ? (
        <HealthSystemUser />
      ) : (
        <GetNameWithAvatar
          id={item?.user?.id as string}
          nameObject={item?.user?.name as (GQLHumanName | null)[]}
          avatar={item.user?.avatar as IAvatar}
          language={window.config.LANGUAGES}
        />
      ),
    type: intl.formatMessage(
      item.dhis2Notification && !item.user?.role
        ? userMessages.healthSystem
        : userMessages[item?.user?.role as string]
    ),
    location:
      item.dhis2Notification && !item.user?.role ? (
        <HealthSystemLocation>{item.office?.name}</HealthSystemLocation>
      ) : isFieldAgent ? (
        <>{item.office?.name}</>
      ) : (
        <GetLink
          status={item.office?.name as string}
          onClick={() => {
            goToTeamUserList && goToTeamUserList(item?.office?.id as string)
          }}
        />
      )
  }))

  const columns = [
    {
      label: intl.formatMessage(constantsMessages.action),
      width: 22,
      key: 'action'
    },
    {
      label: intl.formatMessage(constantsMessages.date),
      width: 22,
      key: 'date'
    },
    {
      label: intl.formatMessage(constantsMessages.by),
      width: 22,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(constantsMessages.type),
      width: 15,
      key: 'type'
    },
    {
      label: intl.formatMessage(constantsMessages.location),
      width: 20,
      key: 'location'
    }
  ]
  return (
    <>
      <Divider />
      <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
      <TableDiv>
        <Table
          id="task-history"
          fixedWidth={1088}
          noResultText=""
          columns={columns}
          content={historyData}
          alignItemCenter={true}
          highlightRowOnMouseOver
          pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
        />
        {allHistoryData.length > DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
          <Pagination
            initialPage={currentPageNumber}
            totalPages={Math.ceil(
              allHistoryData.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
            )}
            onPageChange={onPageChange}
          />
        )}
      </TableDiv>
    </>
  )
}
