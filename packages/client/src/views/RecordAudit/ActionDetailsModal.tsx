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
import styled from '@client/styledComponents'
import { goToUserProfile, IDynamicValues } from '@client/navigation'
import { IntlShape, MessageDescriptor } from 'react-intl'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { ListTable } from '@opencrvs/components/lib/interface'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { IForm, IFormSection, IFormField } from '@client/forms'
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { isEmpty, find, flatten, values, get } from 'lodash'
import {
  getFieldValue,
  DECLARATION_STATUS_LABEL,
  getFormattedDate
} from './utils'
import { CollectorRelationLabelArray } from '@client/forms/correction/corrector'
import { IActionDetailsData } from './History'
import { getRejectionReasonDisplayValue } from '@client/views/SearchResult/SearchResult'

interface IActionDetailsModalListTable {
  actionDetailsData: IActionDetailsData
  actionDetailsIndex: number
  registerForm: IForm
  intl: IntlShape
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}

function retrieveUniqueComments(
  histories: IActionDetailsData[],
  actionDetailsData: IActionDetailsData,
  previousHistoryItemIndex: number
) {
  if (!Array.isArray(actionDetailsData.comments)) {
    return []
  }

  if (previousHistoryItemIndex === -1) {
    return actionDetailsData.comments
      .map((comment: IDynamicValues) => comment.comment)
      .map((comment: string) => ({ comment }))
  }

  const comments: IDynamicValues[] = []
  actionDetailsData.comments.forEach((item: IDynamicValues, index: number) => {
    if (
      (histories[previousHistoryItemIndex].comments || [])[index]?.comment !==
      item.comment
    ) {
      comments.push({ comment: item.comment })
    }
  })

  return comments
}

function getHistories(draft: IDeclaration | null) {
  const histories: IActionDetailsData[] =
    draft?.data.history && Array.isArray(draft.data.history)
      ? draft.data.history.sort((prevItem, nextItem) => {
          return new Date(prevItem.date).getTime() >
            new Date(nextItem.date).getTime()
            ? 1
            : -1
        })
      : []

  return histories
}

/*
 *  This function prepares the comments to be displayed based on status of the declaration.
 */
function prepareComments(
  actionDetailsData: IActionDetailsData,
  draft: IDeclaration | null
) {
  if (
    null === draft ||
    actionDetailsData.action === DOWNLOAD_STATUS.DOWNLOADED
  ) {
    return []
  }

  const histories = getHistories(draft)
  const currentHistoryItemIndex = histories.findIndex(
    (item) => item.date === actionDetailsData.date
  )
  const previousHistoryItemIndex =
    currentHistoryItemIndex < 0
      ? currentHistoryItemIndex
      : currentHistoryItemIndex - 1

  if (actionDetailsData.action === SUBMISSION_STATUS.REJECTED) {
    return actionDetailsData.statusReason?.text
      ? [{ comment: actionDetailsData.statusReason.text }]
      : []
  }

  return retrieveUniqueComments(
    histories,
    actionDetailsData,
    previousHistoryItemIndex
  )
}

export const ActionDetailsModalListTable = ({
  actionDetailsData,
  actionDetailsIndex,
  registerForm,
  intl,
  offlineData,
  draft
}: IActionDetailsModalListTable) => {
  const [currentPage, setCurrentPage] = React.useState(1)

  if (registerForm === undefined) return <></>

  const sections = registerForm?.sections || []
  const commentsColumn = [
    {
      key: 'comment',
      label: intl.formatMessage(constantsMessages.comment),
      width: 100
    }
  ]
  const reasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.reason),
      width: 100
    }
  ]
  const declarationUpdatedColumns = [
    {
      key: 'item',
      label: intl.formatMessage(messages.correctionSummaryItem),
      width: 33.33
    },
    {
      key: 'original',
      label: intl.formatMessage(messages.correctionSummaryOriginal),
      width: 33.33
    },
    { key: 'edit', label: 'Edit', width: 33.33 }
  ]
  const certificateCollectorVerified = [
    {
      key: 'hasShowedVerifiedDocument',
      label: intl.formatMessage(certificateMessages.collectorIDCheck),
      width: 100
    }
  ]

  const getItemName = (
    sectionName: MessageDescriptor,
    fieldLabel: MessageDescriptor
  ) => {
    const label = intl.formatMessage(fieldLabel)
    const section = intl.formatMessage(sectionName)

    return (label && label.trim().length > 0 && `${label} (${section})`) || ''
  }

  const dataChange = (
    actionDetailsData: IActionDetailsData
  ): IDynamicValues[] => {
    const result: IDynamicValues[] = []
    actionDetailsData.input.forEach((item: { [key: string]: any }) => {
      const editedValue = actionDetailsData.output.find(
        (oi: { valueId: string; valueCode: string }) =>
          oi.valueId === item.valueId && oi.valueCode === item.valueCode
      )

      const section = find(
        sections,
        (section) => section.id === item.valueCode
      ) as IFormSection

      const indexes: string[] = item.valueId.split('.')

      if (indexes.length > 1) {
        const [parentField, , nestedField] = indexes

        const nestedFields = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        const fieldObj = flatten(values(nestedFields?.nestedFields)).find(
          (field) => field.name === nestedField
        ) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      } else {
        const [parentField] = indexes

        const fieldObj = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      }
    })

    return result
  }
  const certificateCollectorData = (
    actionDetailsData: IActionDetailsData,
    index: number
  ): IDynamicValues => {
    if (!actionDetailsData.certificates) return []

    const certificate = actionDetailsData.certificates.filter(
      (item: IDynamicValues) => item
    )[index]

    if (!certificate) {
      return {}
    }

    const name = certificate.collector?.individual
      ? getIndividualNameObj(
          certificate.collector.individual.name,
          window.config.LANGUAGES
        )
      : {}
    const collectorLabel = () => {
      const relation = CollectorRelationLabelArray.find(
        (labelItem) => labelItem.value === certificate.collector?.relationship
      )
      const collectorName = `${name?.firstNames || ''} ${
        name?.familyName || ''
      }`
      if (relation)
        return `${collectorName} (${intl.formatMessage(relation.label)})`
      if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE') {
        const otherRelation = CollectorRelationLabelArray.find(
          (labelItem) =>
            labelItem.value === certificate.collector?.otherRelationship
        )
        const otherRelationLabel = otherRelation
          ? intl.formatMessage(otherRelation.label)
          : ''
        return `${collectorName} (${otherRelationLabel})`
      }
      return collectorName
    }

    return {
      hasShowedVerifiedDocument: certificate.hasShowedVerifiedDocument
        ? intl.formatMessage(certificateMessages.idCheckVerify)
        : intl.formatMessage(certificateMessages.idCheckWithoutVerify),
      collector: collectorLabel(),
      otherRelationship: certificate.collector?.otherRelationship,
      relationship: certificate.collector?.relationship
    }
  }

  const declarationUpdates = dataChange(actionDetailsData)
  const collectorData = certificateCollectorData(
    actionDetailsData,
    actionDetailsIndex
  )
  const certificateCollector = [
    {
      key: 'collector',
      label:
        collectorData.relationship === 'PRINT_IN_ADVANCE'
          ? intl.formatMessage(certificateMessages.printedOnAdvance)
          : intl.formatMessage(certificateMessages.printedOnCollection),
      width: 100
    }
  ]
  const pageChangeHandler = (cp: number) => setCurrentPage(cp)
  const content = prepareComments(actionDetailsData, draft)
  return (
    <>
      {/* For Reject Reason */}
      {actionDetailsData.reason &&
        actionDetailsData.action === SUBMISSION_STATUS.REJECTED && (
          <ListTable
            noResultText=" "
            hideBoxShadow={true}
            columns={reasonColumn}
            content={[
              {
                text: intl.formatMessage(
                  getRejectionReasonDisplayValue(actionDetailsData.reason)
                )
              }
            ]}
          />
        )}

      {/* For Comments */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={commentsColumn}
        content={content}
      />

      {/* For Data Updated */}
      {declarationUpdates.length > 0 && (
        <ListTable
          noResultText=" "
          hideBoxShadow={true}
          columns={declarationUpdatedColumns}
          content={declarationUpdates}
          pageSize={10}
          totalItems={declarationUpdates.length}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        />
      )}

      {/* For Certificate */}
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollector}
        content={[collectorData]}
        pageSize={10}
        totalItems={1}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      />
      <ListTable
        noResultText=" "
        hideBoxShadow={true}
        columns={certificateCollectorVerified}
        content={[collectorData]}
        pageSize={10}
        totalItems={1}
        currentPage={currentPage}
        onPageChange={pageChangeHandler}
      />
    </>
  )
}

export const ActionDetailsModal = ({
  show,
  actionDetailsData,
  actionDetailsIndex,
  toggleActionDetails,
  intl,
  goToUser,
  registerForm,
  offlineData,
  draft
}: {
  show: boolean
  actionDetailsData: IActionDetailsData
  actionDetailsIndex: number
  toggleActionDetails: (param: IActionDetailsData | null) => void
  intl: IntlShape
  goToUser: typeof goToUserProfile
  registerForm: IForm
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}) => {
  if (isEmpty(actionDetailsData)) return <></>

  const title =
    (DECLARATION_STATUS_LABEL[actionDetailsData?.action] &&
      intl.formatMessage(
        DECLARATION_STATUS_LABEL[actionDetailsData?.action]
      )) ||
    ''

  let userName = ''

  if (!actionDetailsData.dhis2Notification) {
    const nameObj = getIndividualNameObj(
      actionDetailsData.user.name,
      window.config.LANGUAGES
    )
    userName = nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
  } else {
    userName = intl.formatMessage(userMessages.healthSystem)
  }

  return (
    <ResponsiveModal
      actions={[]}
      handleClose={() => toggleActionDetails(null)}
      show={show}
      responsive={true}
      title={title}
      width={1024}
      autoHeight={true}
    >
      <>
        <div>
          <>{userName}</>
          <span> — {getFormattedDate(actionDetailsData.date)}</span>
        </div>
        <ActionDetailsModalListTable
          actionDetailsData={actionDetailsData}
          actionDetailsIndex={actionDetailsIndex}
          registerForm={registerForm}
          intl={intl}
          offlineData={offlineData}
          draft={draft}
        />
      </>
    </ResponsiveModal>
  )
}
