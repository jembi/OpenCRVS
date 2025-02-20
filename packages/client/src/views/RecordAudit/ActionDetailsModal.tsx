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
import { IDynamicValues } from '@client/navigation'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { IDeclaration } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { IForm, IFormSection } from '@client/forms'
import {
  constantsMessages,
  dynamicConstantsMessages,
  userMessages
} from '@client/i18n/messages'
import { getIndividualNameObj, UserDetails } from '@client/utils/userUtils'
import { History, RegAction, RegStatus } from '@client/utils/gateway'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { isEmpty, find, flatten, values } from 'lodash'
import {
  getFieldValue,
  getStatusLabel,
  isSystemInitiated,
  isVerifiedAction
} from './utils'
import {
  CollectorRelationLabelArray,
  CorrectorRelationLabelArray,
  CorrectorRelationship
} from '@client/forms/correction/corrector'
import { getRejectionReasonDisplayValue } from '@client/views/SearchResult/SearchResult'
import { CorrectionReason } from '@client/forms/correction/reason'
import { Table } from '@opencrvs/components/lib'
import { Pill } from '@opencrvs/components/lib/Pill'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { formatLongDate } from '@client/utils/date-formatting'
import { EMPTY_STRING } from '@client/utils/constants'
import { IReviewFormState } from '@client/forms/register/reviewReducer'
import { useSelector } from 'react-redux'
import { getScope } from '@client/profile/profileSelectors'

interface IActionDetailsModalListTable {
  actionDetailsData: History
  actionDetailsIndex: number
  registerForm: IForm
  reviewForm: IReviewFormState
  intl: IntlShape
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}

function retrieveUniqueComments(
  histories: History[],
  actionDetailsData: History,
  previousHistoryItemIndex: number
) {
  if (!Array.isArray(actionDetailsData.comments)) {
    return []
  }

  if (previousHistoryItemIndex === -1) {
    return actionDetailsData.comments
      .map((comment) => comment?.comment)
      .map((comment) => ({ comment }))
  }

  const comments: IDynamicValues[] = []
  actionDetailsData.comments.forEach((item, index) => {
    if (
      (histories[previousHistoryItemIndex].comments || [])[index]?.comment !==
      item?.comment
    ) {
      comments.push({ comment: item?.comment })
    }
  })

  return comments
}

function retrieveCorrectionComment(actionDetailsData: History) {
  if (!Array.isArray(actionDetailsData.comments)) {
    return []
  }

  const comment = actionDetailsData.comments[1]?.comment || ''

  return [{ comment }]
}

function getHistories(draft: IDeclaration | null) {
  const histories: History[] =
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
  actionDetailsData: History,
  draft: IDeclaration | null
) {
  if (
    !draft ||
    (actionDetailsData.action &&
      actionDetailsData.action !== RegAction.RequestedCorrection &&
      actionDetailsData.action !== RegAction.Corrected)
  ) {
    return []
  }

  const histories = getHistories(draft)
  const currentHistoryItemIndex = histories
    .filter(({ regStatus }: Partial<History>) => {
      return regStatus !== RegStatus.WaitingValidation
    })
    .findIndex((item) => item.date === actionDetailsData.date)

  const previousHistoryItemIndex =
    currentHistoryItemIndex < 0
      ? currentHistoryItemIndex
      : currentHistoryItemIndex - 1

  if (
    [RegStatus.Rejected, RegStatus.Archived].includes(
      actionDetailsData.regStatus as RegStatus
    )
  ) {
    return actionDetailsData.statusReason?.text
      ? [{ comment: actionDetailsData.statusReason.text }]
      : []
  }

  if (
    [RegAction.RequestedCorrection, RegAction.Corrected].includes(
      actionDetailsData.action as RegAction
    )
  )
    return retrieveCorrectionComment(actionDetailsData)

  return retrieveUniqueComments(
    histories,
    actionDetailsData,
    previousHistoryItemIndex
  )
}

const requesterLabelMapper = (
  requester: string,
  intl: IntlShape,
  declaration: IDeclaration
) => {
  const requesterIndividual = CorrectorRelationLabelArray.find(
    (labelItem) => labelItem.value === requester
  )
  const informant =
    ((declaration.data?.informant?.otherInformantType ||
      declaration.data?.informant?.informantType) as string) ?? ''

  // informant info added for corrector being informant
  return requesterIndividual?.label
    ? intl.formatMessage(requesterIndividual.label, {
        informant
      })
    : ''
}

const getReasonForRequest = (
  reasonValue: string,
  otherReason: string,
  intl: IntlShape
) => {
  switch (reasonValue) {
    case CorrectionReason.CLERICAL_ERROR:
      return intl.formatMessage(messages.clericalError)

    case CorrectionReason.MATERIAL_ERROR:
      return intl.formatMessage(messages.materialError)

    case CorrectionReason.MATERIAL_OMISSION:
      return intl.formatMessage(messages.materialOmission)

    case CorrectionReason.JUDICIAL_ORDER:
      return intl.formatMessage(messages.judicialOrder)

    case CorrectionReason.OTHER:
      return otherReason
    default:
      return '-'
  }
}

const ActionDetailsModalListTable = ({
  actionDetailsData,
  actionDetailsIndex,
  registerForm,
  reviewForm,
  intl,
  offlineData,
  draft
}: IActionDetailsModalListTable) => {
  const [currentPage, setCurrentPage] = React.useState(1)

  if (registerForm === undefined) return <></>

  const event = draft?.event || 'birth'
  const sections = reviewForm.reviewForm?.[event].sections || []
  const requesterColumn = [
    {
      key: 'requester',
      label: intl.formatMessage(messages.correctionSummaryRequestedBy),
      width: 100
    }
  ]
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
  const correctionReasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.requestReason),
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
    {
      key: 'edit',
      label: intl.formatMessage(messages.correctionSummaryCorrection),
      width: 33.33
    }
  ]
  const certificateCollectorVerified = [
    {
      key: 'hasShowedVerifiedDocument',
      label: intl.formatMessage(certificateMessages.collectorIDCheck),
      width: 100
    }
  ]
  const duplicateOfColumn = [
    {
      key: 'duplicateOf',
      label: intl.formatMessage(constantsMessages.duplicateOf),
      width: 100
    }
  ]

  const matchedToColumn = [
    {
      key: 'potentialDuplicates',
      label: intl.formatMessage(constantsMessages.matchedTo),
      width: 100
    }
  ]

  const potentialDuplicatesTransformer = (items: string[]) => {
    return (
      <>
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </>
    )
  }

  const getItemName = (
    sectionName: MessageDescriptor,
    fieldLabel: MessageDescriptor,
    fieldLabelParam?: Record<string, string>
  ) => {
    const label = intl.formatMessage(fieldLabel, fieldLabelParam)
    const section = intl.formatMessage(sectionName)

    return (label && label.trim().length > 0 && `${label} (${section})`) || ''
  }

  const dataChange = (actionDetailsData: History): IDynamicValues[] => {
    const result: IDynamicValues[] = []

    if (actionDetailsData.action === RegAction.Downloaded) {
      return result
    }

    actionDetailsData?.input?.forEach((item) => {
      if (!item) return
      const editedValue = actionDetailsData?.output?.find(
        (oi) => oi?.valueId === item.valueId && oi?.valueCode === item.valueCode
      )
      if (!editedValue) return
      const section = find(
        sections,
        (section) => section.id === item?.valueCode
      ) as IFormSection

      if (['documents', 'review', 'preview'].includes(section.id)) {
        item.value = EMPTY_STRING
        editedValue.value = intl.formatMessage(dynamicConstantsMessages.updated)
      }

      const indexes = item?.valueId?.split('.')
      if (!indexes) return

      if (indexes.length > 1) {
        const [parentField, , nestedField] = indexes

        const nestedFields = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        const fieldObj = flatten(values(nestedFields?.nestedFields)).find(
          (field) => field.name === nestedField
        )

        /**
         *  Adding a check if fieldObj there or not to prevent
         *  application crash on accessing label from undefined fieldObj
         */
        if (fieldObj) {
          result.push({
            item: getItemName(
              section.name,
              fieldObj.label,
              fieldObj.labelParam
            ),
            original: getFieldValue(item.value, fieldObj, offlineData, intl),
            edit: getFieldValue(editedValue.value, fieldObj, offlineData, intl)
          })
        }
      } else {
        const [parentField] = indexes

        const fieldObj = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        /**
         *  Adding a check if fieldObj there or not to prevent
         *  application crash on accessing label from undefined fieldObj
         */
        if (fieldObj) {
          result.push({
            item: getItemName(
              section.name,
              fieldObj.label,
              fieldObj.labelParam
            ),
            original: getFieldValue(item.value, fieldObj, offlineData, intl),
            edit: getFieldValue(editedValue.value, fieldObj, offlineData, intl)
          })
        }
      }
    })

    return result
  }
  const certificateCollectorData = (
    actionDetailsData: History,
    index: number
  ): IDynamicValues => {
    if (!actionDetailsData.certificates) return {}

    const certificate = actionDetailsData.certificates.filter((item) => item)[
      index
    ]

    if (!certificate) {
      return {}
    }

    const name = certificate.collector?.name
      ? getIndividualNameObj(
          certificate.collector.name,
          window.config.LANGUAGES
        )
      : certificate.certifier?.name
      ? getIndividualNameObj(
          certificate.certifier.name,
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

      if (certificate.certifier?.role)
        return `${collectorName} (${intl.formatMessage(
          certificate.certifier.role.label
        )})`

      if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE')
        return `${collectorName} (${certificate.collector.otherRelationship})`

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
        !collectorData.relationship || // relationship should not be available if certifier is found for certificate
        collectorData.relationship === 'PRINT_IN_ADVANCE'
          ? intl.formatMessage(certificateMessages.printedOnAdvance)
          : intl.formatMessage(certificateMessages.printedOnCollection),
      width: 100
    }
  ]

  const selectedCertificateTemplate = [
    {
      key: 'certTemplate',
      label: intl.formatMessage(
        certificateMessages.selectedCertificateTemplateLabel
      ),
      width: 200
    }
  ]

  const certificateTemplateMessageDescriptor =
    offlineData.templates?.certificates?.find(
      (x) => x.id === actionDetailsData.certificateTemplateId
    )?.label

  const selectedCertificateTemplateName = {
    certTemplate: certificateTemplateMessageDescriptor
      ? intl.formatMessage(certificateTemplateMessageDescriptor)
      : ''
  }
  const pageChangeHandler = (cp: number) => setCurrentPage(cp)
  const content = prepareComments(actionDetailsData, draft)
  const requesterLabel = requesterLabelMapper(
    actionDetailsData.requester as string,
    intl,
    draft as IDeclaration
  )
  return (
    <>
      {/* For Reject Reason */}
      {actionDetailsData.reason &&
        !actionDetailsData.action &&
        actionDetailsData.regStatus === RegStatus.Rejected && (
          <Table
            noResultText=" "
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

      {/* Correction Requester */}
      {actionDetailsData.requester &&
        (actionDetailsData.action === RegAction.RequestedCorrection ||
          actionDetailsData.action === RegAction.Corrected) && (
          <Table
            noResultText=" "
            columns={requesterColumn}
            content={[{ requester: requesterLabel }]}
          />
        )}
      {/* Correction rejected */}
      {actionDetailsData.action === RegAction.RejectedCorrection && (
        <Table
          noResultText=" "
          columns={reasonColumn}
          content={[{ text: actionDetailsData.reason }]}
        />
      )}

      {/* Correction Requester Id Verified */}
      {(actionDetailsData.action === RegAction.RequestedCorrection ||
        actionDetailsData.action === RegAction.Corrected) &&
        actionDetailsData.requester !== CorrectorRelationship.ANOTHER_AGENT &&
        actionDetailsData.requester !== CorrectorRelationship.REGISTRAR && (
          <Table
            noResultText=" "
            columns={certificateCollectorVerified}
            content={[
              {
                hasShowedVerifiedDocument:
                  actionDetailsData.hasShowedVerifiedDocument
                    ? intl.formatMessage(certificateMessages.idCheckVerify)
                    : intl.formatMessage(
                        certificateMessages.idCheckWithoutVerify
                      )
              }
            ]}
            pageSize={10}
            totalItems={1}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}

      {/* For Correction Reason */}
      {actionDetailsData.reason &&
        (actionDetailsData.action === RegAction.RequestedCorrection ||
          actionDetailsData.action === RegAction.Corrected) && (
          <Table
            noResultText=" "
            columns={correctionReasonColumn}
            content={[
              {
                text: getReasonForRequest(
                  actionDetailsData.reason as string,
                  actionDetailsData.otherReason as string,
                  intl
                )
              }
            ]}
          />
        )}

      {/* Duplicate of */}
      {actionDetailsData.duplicateOf && (
        <Table
          noResultText=" "
          columns={duplicateOfColumn}
          content={[{ duplicateOf: actionDetailsData.duplicateOf }]}
        />
      )}

      {/* For Comments */}
      {content.length > 0 && (
        <Table noResultText=" " columns={commentsColumn} content={content} />
      )}

      {/* Show Duplicate pill for Archived declarations */}
      {actionDetailsData.reason === 'duplicate' &&
        !actionDetailsData.action &&
        actionDetailsData.regStatus === RegStatus.Archived && (
          <p>
            <Pill
              label={intl.formatMessage(recordAuditMessages.markAsDuplicate)}
              size="small"
              type="inactive"
            />
          </p>
        )}

      {/* For Data Updated */}
      {declarationUpdates.length > 0 &&
        (actionDetailsData.action === RegAction.RequestedCorrection ||
          actionDetailsData.action === RegAction.Corrected ||
          actionDetailsData.regStatus === RegStatus.DeclarationUpdated) && (
          <Table
            noResultText=" "
            columns={declarationUpdatedColumns}
            content={declarationUpdates}
            pageSize={10}
            totalItems={declarationUpdates.length}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}

      {/* For Certificate */}
      {!isEmpty(collectorData) &&
        actionDetailsData.regStatus !== RegStatus.Issued && (
          <Table
            noResultText=" "
            columns={certificateCollector}
            content={[collectorData]}
            pageSize={10}
            totalItems={1}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}
      {!isEmpty(collectorData) &&
        actionDetailsData.regStatus !== RegStatus.Issued &&
        !['PRINT_IN_ADVANCE', 'OTHER'].includes(collectorData.relationship) && (
          <Table
            noResultText=" "
            columns={certificateCollectorVerified}
            content={[collectorData]}
            pageSize={10}
            totalItems={1}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}
      {!isEmpty(collectorData) && !!actionDetailsData.certificateTemplateId && (
        <Table
          noResultText=" "
          columns={selectedCertificateTemplate}
          content={[selectedCertificateTemplateName]}
          pageSize={10}
          totalItems={1}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        />
      )}

      {/* Matched to */}
      {actionDetailsData.potentialDuplicates &&
        actionDetailsData.action === RegAction.FlaggedAsPotentialDuplicate && (
          <Table
            noResultText=" "
            columns={matchedToColumn}
            content={[
              {
                potentialDuplicates: potentialDuplicatesTransformer(
                  actionDetailsData.potentialDuplicates
                )
              }
            ]}
          />
        )}
    </>
  )
}

export const ActionDetailsModal = ({
  show,
  actionDetailsData,
  actionDetailsIndex,
  toggleActionDetails,
  intl,
  userDetails,
  registerForm,
  reviewForm,
  offlineData,
  draft
}: {
  show: boolean
  actionDetailsData: History
  actionDetailsIndex: number
  toggleActionDetails: (param: History | null) => void
  intl: IntlShape
  userDetails: UserDetails | null
  registerForm: IForm
  reviewForm: IReviewFormState
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}) => {
  const scopes = useSelector(getScope)
  if (isEmpty(actionDetailsData)) return <></>

  const title = getStatusLabel(
    actionDetailsData.action,
    actionDetailsData.regStatus,
    intl,
    actionDetailsData.user,
    userDetails,
    scopes
  )

  let userName = ''
  if (isVerifiedAction(actionDetailsData) && actionDetailsData.ipAddress) {
    userName = actionDetailsData.ipAddress
  } else if (!isSystemInitiated(actionDetailsData)) {
    const nameObj = actionDetailsData?.user?.name
      ? getIndividualNameObj(
          actionDetailsData.user.name,
          window.config.LANGUAGES
        )
      : null
    userName = nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
  } else {
    userName =
      actionDetailsData.system?.name ??
      intl.formatMessage(userMessages.healthSystem)
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
          <span>
            {' '}
            —{' '}
            {formatLongDate(
              actionDetailsData.date.toLocaleString(),
              intl.locale,
              'MMMM dd, yyyy · hh.mm a'
            )}
          </span>
        </div>
        <ActionDetailsModalListTable
          actionDetailsData={actionDetailsData}
          actionDetailsIndex={actionDetailsIndex}
          registerForm={registerForm}
          reviewForm={reviewForm}
          intl={intl}
          offlineData={offlineData}
          draft={draft}
        />
      </>
    </ResponsiveModal>
  )
}
