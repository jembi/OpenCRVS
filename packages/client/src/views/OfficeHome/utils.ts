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
  IDynamicValues,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/Workqueue'
import { orderBy } from 'lodash'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
  externalValidationTab: GQLEventSearchResultSet
}

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED',
  WAITING_VALIDATION: 'WAITING_VALIDATION'
}

export const getSortedItems = (
  items: IDynamicValues[],
  sortedCol: COLUMNS,
  sortOrder: SORT_ORDER
): IDynamicValues[] => {
  return orderBy(items, [sortedCol], [sortOrder])
}

export const changeSortedColumn = (
  columnName: string,
  presentSortedCol: COLUMNS,
  presentSortOrder: SORT_ORDER
) => {
  let newSortedCol: COLUMNS
  let newSortOrder: SORT_ORDER = SORT_ORDER.ASCENDING

  switch (columnName) {
    case COLUMNS.ICON_WITH_NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.EVENT:
      newSortedCol = COLUMNS.EVENT
      break
    case COLUMNS.DATE_OF_EVENT:
      newSortedCol = COLUMNS.DATE_OF_EVENT
      break
    case COLUMNS.SENT_FOR_REVIEW:
      newSortedCol = COLUMNS.SENT_FOR_REVIEW
      break
    case COLUMNS.SENT_FOR_UPDATES:
      newSortedCol = COLUMNS.SENT_FOR_UPDATES
      break
    case COLUMNS.SENT_FOR_APPROVAL:
      newSortedCol = COLUMNS.SENT_FOR_APPROVAL
      break
    case COLUMNS.REGISTERED:
      newSortedCol = COLUMNS.REGISTERED
      break
    case COLUMNS.SENT_FOR_VALIDATION:
      newSortedCol = COLUMNS.SENT_FOR_VALIDATION
      break
    case COLUMNS.NOTIFICATION_SENT:
      newSortedCol = COLUMNS.NOTIFICATION_SENT
      break
    case COLUMNS.LAST_UPDATED:
      newSortedCol = COLUMNS.LAST_UPDATED
      break
    default:
      newSortedCol = COLUMNS.NAME
  }

  if (newSortedCol === presentSortedCol) {
    if (presentSortOrder === SORT_ORDER.ASCENDING) {
      newSortOrder = SORT_ORDER.DESCENDING
    } else {
      newSortOrder = SORT_ORDER.ASCENDING
    }
  }

  return {
    newSortedCol: newSortedCol,
    newSortOrder: newSortOrder
  }
}
