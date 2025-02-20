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
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { useDispatch, useSelector } from 'react-redux'
import {
  formatUrl,
  generateCertificateCorrectionUrl,
  generateGoToPageUrl,
  generateIssueCertificateUrl,
  generatePrintCertificateUrl
} from '@client/navigation'
import {
  clearCorrectionAndPrintChanges,
  deleteDeclaration,
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS,
  unassignDeclaration
} from '@client/declarations'
import {
  canBeCorrected,
  isArchivable,
  canBeReinstated,
  isIssuable,
  isPendingCorrection,
  isPrintable,
  isRecordOrDeclaration,
  isReviewableDeclaration,
  isUpdatableDeclaration,
  isViewable
} from '@client/declarations/utils'
import ProtectedComponent from '@client/components/ProtectedComponent'
import {
  RECORD_ALLOWED_SCOPES,
  usePermissions
} from '@client/hooks/useAuthorization'
import { getUserDetails } from '@client/profile/profileSelectors'
import { CorrectionSection } from '@client/forms'
import { useModal } from '@client/hooks/useModal'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/action'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  DRAFT_MARRIAGE_FORM_PAGE,
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { client } from '@client/utils/apolloClient'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { DeleteModal } from '@client/views/RegisterForm/RegisterForm'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import { useIntl } from 'react-intl'
import { IDeclarationData } from './utils'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'
import { useDeclaration } from '@client/declarations/selectors'
import { FETCH_DECLARATION_SHORT_INFO } from './queries'

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  draft: IDeclaration | null
  duplicates?: string[]
  toggleDisplayDialog: () => void
}> = ({ declaration, draft, toggleDisplayDialog, duplicates }) => {
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const navigate = useNavigate()
  const [modal, openModal] = useModal()

  const intl = useIntl()

  const { id, type, assignment, status } = declaration

  const assignedToSelf =
    assignment?.practitionerId === userDetails?.practitionerId
  const assignedToOther = !!(
    assignment && assignment?.practitionerId !== userDetails?.practitionerId
  )

  const isDownloaded = draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED
  const isDraft = draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  const isActionable = isDownloaded && assignedToSelf

  const isDuplicate = (duplicates ?? []).length > 0

  const handleDelete = async () => {
    const deleteConfirm = await openModal<boolean | null>((close) => (
      <DeleteModal intl={intl} close={close}></DeleteModal>
    ))
    if (deleteConfirm) {
      dispatch(deleteDeclaration(id, client))
      navigate(routes.HOME)
    }
    return
  }

  const handleUnassign = async () => {
    const { firstName, lastName, officeName } = assignment || {}
    const unassignConfirm = await openModal<boolean | null>(
      (close) =>
        assignment && (
          <UnassignModal
            close={close}
            name={firstName + ' ' + lastName}
            assignedSelf={assignedToSelf}
            officeName={officeName}
          />
        )
    )
    if (unassignConfirm) {
      dispatch(unassignDeclaration(id, client, [FETCH_DECLARATION_SHORT_INFO]))
    }
    return
  }

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger>
          <Button type="primary" size="medium">
            {intl.formatMessage(messages.action)}
            <Icon name="CaretDown" color="currentColor" size="small" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {assignment && assignedToOther && (
            <>
              <DropdownMenu.Label>
                {intl.formatMessage(messages.assignedTo, {
                  name: assignment.firstName + ' ' + assignment.lastName,
                  officeName: assignment.officeName
                })}
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
            </>
          )}
          <ViewAction declarationId={id} declarationStatus={status} />
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.REVIEW}>
            <ReviewAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
              isDuplicate={isDuplicate}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.REVIEW_CORRECTION}>
            <ReviewCorrectionAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          {isDraft ? (
            <UpdateAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable || isDraft}
            />
          ) : (
            <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.UPDATE}>
              <UpdateAction
                declarationId={id}
                declarationStatus={status}
                type={type}
                isActionable={isActionable || isDraft}
              />
            </ProtectedComponent>
          )}
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.ARCHIVE}>
            <ArchiveAction
              toggleDisplayDialog={toggleDisplayDialog}
              isActionable={isActionable}
              declarationStatus={status}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.REINSTATE}>
            <ReinstateAction
              toggleDisplayDialog={toggleDisplayDialog}
              isActionable={isActionable}
              declarationStatus={status}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.PRINT}>
            <PrintAction
              declarationStatus={status}
              declarationId={id}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.ISSUE}>
            <IssueAction
              declarationStatus={status}
              declarationId={id}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={RECORD_ALLOWED_SCOPES.CORRECT}>
            <CorrectRecordAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <DeleteAction
            handleDelete={handleDelete}
            declarationStatus={status}
          />
          <UnassignAction
            handleUnassign={handleUnassign}
            assignedOther={assignedToOther}
            assignedSelf={assignedToSelf}
            declarationStatus={status}
          />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}

interface IActionItemCommonProps {
  isActionable: boolean
  declarationStatus?: SUBMISSION_STATUS
}

interface IDeclarationProps {
  declarationId: string
  type?: string
}

const ViewAction: React.FC<{
  declarationStatus?: SUBMISSION_STATUS
  declarationId: string
}> = ({ declarationStatus, declarationId }) => {
  const navigate = useNavigate()
  const intl = useIntl()

  if (!isViewable(declarationStatus)) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        navigate(
          formatUrl(routes.VIEW_RECORD, {
            declarationId
          })
        )
      }}
    >
      <Icon name="Eye" color="currentColor" size="small" />
      {intl.formatMessage(messages.view, {
        recordOrDeclaration: isRecordOrDeclaration(declarationStatus)
      })}
    </DropdownMenu.Item>
  )
}

const CorrectRecordAction: React.FC<
  IActionItemCommonProps & IDeclarationProps
> = ({ declarationId, declarationStatus, type, isActionable }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const intl = useIntl()

  const isBirthOrDeathEvent =
    type && [EventType.Birth, EventType.Death].includes(type as EventType)

  if (!isBirthOrDeathEvent || !canBeCorrected(declarationStatus)) {
    return null
  }

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))

        navigate(
          generateCertificateCorrectionUrl({
            declarationId,
            pageId: CorrectionSection.Corrector
          })
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="NotePencil" color="currentColor" size="small" />
      {intl.formatMessage(messages.correctRecord)}
    </DropdownMenu.Item>
  )
}

const ArchiveAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isActionable, declarationStatus }) => {
  const intl = useIntl()
  if (!isArchivable(declarationStatus)) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isActionable}>
      <Icon name="Archive" color="currentColor" size="small" />
      {intl.formatMessage(messages.archiveRecord)}
    </DropdownMenu.Item>
  )
}

const ReinstateAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isActionable, declarationStatus }) => {
  const intl = useIntl()
  if (!canBeReinstated(declarationStatus)) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isActionable}>
      <Icon name="FileArrowUp" color="currentColor" size="small" />
      {intl.formatMessage(messages.reinstateRecord)}
    </DropdownMenu.Item>
  )
}

const ReviewAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { isDuplicate: boolean }
> = ({ declarationId, declarationStatus, type, isActionable, isDuplicate }) => {
  const intl = useIntl()
  const navigate = useNavigate()

  if (!isReviewableDeclaration(declarationStatus)) {
    return null
  }

  return (
    <DropdownMenu.Item
      onClick={() => {
        navigate(
          generateGoToPageUrl({
            pageRoute: REVIEW_EVENT_PARENT_FORM_PAGE,
            declarationId,
            pageId: 'review',
            event: type as string
          })
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="PencilLine" color="currentColor" size="small" />
      {intl.formatMessage(messages.reviewDeclaration, { isDuplicate })}
    </DropdownMenu.Item>
  )
}

const ReviewCorrectionAction: React.FC<
  IActionItemCommonProps & IDeclarationProps
> = ({ declarationId, declarationStatus, type, isActionable }) => {
  const intl = useIntl()
  const navigate = useNavigate()

  if (!isPendingCorrection(declarationStatus)) {
    return null
  }

  return (
    <DropdownMenu.Item
      onClick={() => {
        if (type) {
          navigate(
            generateGoToPageUrl({
              pageRoute: REVIEW_CORRECTION,
              declarationId,
              pageId: 'review',
              event: type
            })
          )
        }
      }}
      disabled={!isActionable}
    >
      <Icon name="PencilLine" color="currentColor" size="small" />
      {intl.formatMessage(messages.reviewCorrection)}
    </DropdownMenu.Item>
  )
}

const UpdateAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  type,
  isActionable
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const declaration = useDeclaration(declarationId)
  const isDraft = declaration?.submissionStatus === SUBMISSION_STATUS.DRAFT

  let pageRoute: string, pageId: 'preview' | 'review'

  if (declarationStatus === SUBMISSION_STATUS.DRAFT) {
    pageId = 'preview'
    if (type === 'birth') {
      pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
    } else if (type === 'death') {
      pageRoute = DRAFT_DEATH_FORM_PAGE
    } else if (type === 'marriage') {
      pageRoute = DRAFT_MARRIAGE_FORM_PAGE
    }
  } else {
    pageRoute = REVIEW_EVENT_PARENT_FORM_PAGE
    pageId = 'review'
  }

  if (!isUpdatableDeclaration(declarationStatus) && !isDraft) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        navigate(
          generateGoToPageUrl({
            pageRoute: pageRoute,
            declarationId,
            pageId,
            event: type as string
          })
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="PencilCircle" color="currentColor" size="small" />
      {intl.formatMessage(messages.updateDeclaration)}
    </DropdownMenu.Item>
  )
}

const PrintAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  type,
  isActionable
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!isPrintable(declarationStatus)) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))

        navigate(
          generatePrintCertificateUrl({
            registrationId: declarationId,
            event: (type as string)?.toLocaleLowerCase()
          })
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="Printer" color="currentColor" size="small" />
      {intl.formatMessage(messages.printDeclaration)}
    </DropdownMenu.Item>
  )
}

const IssueAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  isActionable,
  declarationStatus
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!isIssuable(declarationStatus)) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))
        navigate(
          generateIssueCertificateUrl({
            registrationId: declarationId
          })
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="Handshake" color="currentColor" size="small" />
      {intl.formatMessage(messages.issueCertificate)}
    </DropdownMenu.Item>
  )
}

const DeleteAction: React.FC<{
  handleDelete: () => void
  declarationStatus?: SUBMISSION_STATUS
}> = ({ handleDelete, declarationStatus }) => {
  const intl = useIntl()
  if (declarationStatus !== SUBMISSION_STATUS.DRAFT) return null
  return (
    <DropdownMenu.Item onClick={handleDelete}>
      <Icon name="Trash" color="currentColor" size="small" />
      {intl.formatMessage(buttonMessages.deleteDeclaration)}
    </DropdownMenu.Item>
  )
}
const UnassignAction: React.FC<{
  handleUnassign: () => void
  assignedOther: boolean
  assignedSelf: boolean
  declarationStatus?: SUBMISSION_STATUS
}> = ({ handleUnassign, assignedOther, assignedSelf, declarationStatus }) => {
  const { hasScope } = usePermissions()
  const intl = useIntl()

  if (
    declarationStatus === SUBMISSION_STATUS.DRAFT ||
    (!assignedSelf &&
      (!assignedOther || !hasScope(SCOPES.RECORD_UNASSIGN_OTHERS)))
  )
    return null

  return (
    <DropdownMenu.Item onClick={handleUnassign}>
      <Icon name="ArrowCircleDown" color="currentColor" size="small" />
      {intl.formatMessage(buttonMessages.unassign)}
    </DropdownMenu.Item>
  )
}

const UnassignModal: React.FC<{
  close: (result: boolean | null) => void
  assignedSelf: boolean
  name: string
  officeName?: string | null
}> = ({ close, assignedSelf, name, officeName }) => {
  const intl = useIntl()
  return (
    <Dialog
      title={intl.formatMessage(conflictsMessages.unassignTitle)}
      isOpen={true}
      onClose={() => close(null)}
      actions={[
        <Button
          type="tertiary"
          size="medium"
          id="cancel_unassign"
          key="cancel_unassign"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          type="negative"
          size="medium"
          key="confirm_unassign"
          id="confirm_unassign"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(buttonMessages.unassign)}
        </Button>
      ]}
    >
      <Text element="p" variant="reg16" color="grey500">
        {assignedSelf
          ? intl.formatMessage(conflictsMessages.selfUnassignDesc)
          : intl.formatMessage(conflictsMessages.regUnassignDesc, {
              name,
              officeName
            })}
      </Text>
    </Dialog>
  )
}
