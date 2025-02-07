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
import { Stack, ToggleMenu } from '@opencrvs/components/lib'
import * as React from 'react'
import { FormikTouched, FormikValues } from 'formik'
import {
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  useIntl
} from 'react-intl'
import { connect, useDispatch } from 'react-redux'
import { isNull, isUndefined, merge, flatten, isEqual, get } from 'lodash'
import debounce from 'lodash/debounce'
import {
  PrimaryButton,
  TertiaryButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import { DeclarationIcon, Duplicate } from '@opencrvs/components/lib/icons'
import { Alert } from '@opencrvs/components/lib/Alert'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import {
  deleteDeclaration,
  IDeclaration,
  IPayload,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration,
  DOWNLOAD_STATUS
} from '@client/declarations'
import {
  FormFieldGenerator,
  ITouchedNestedFields,
  mapFieldsToValues
} from '@client/components/form'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { RejectRegistrationForm } from '@client/components/review/RejectRegistrationForm'
import { TimeMounted } from '@client/components/TimeMounted'
import {
  CorrectionSection,
  IForm,
  IFormData,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  SubmissionAction
} from '@client/forms'
import {
  evalExpressionInFieldDefinition,
  getNextSectionIds,
  getSectionFields,
  getVisibleGroupFields,
  getVisibleSectionGroupsBasedOnConditions,
  handleInitialValue,
  hasFormError,
  VIEW_TYPE
} from '@client/forms/utils'
import { useModal } from '@client/hooks/useModal'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { duplicateMessages } from '@client/i18n/messages/views/duplicates'
import { messages } from '@client/i18n/messages/views/register'
import {
  formatUrl,
  generateCertificateCorrectionUrl,
  generateGoToHomeTabUrl,
  generateGoToPageGroupUrl
} from '@client/navigation'
import { HOME } from '@client/navigation/routes'
import { toggleDraftSavedNotification } from '@client/notification/actions'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { client } from '@client/utils/apolloClient'
import {
  ACCUMULATED_FILE_SIZE,
  DECLARED,
  REJECTED,
  VALIDATED
} from '@client/utils/constants'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { EventType, RegStatus } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import {
  bytesToSize,
  isCorrection,
  isFileSizeExceeded
} from '@client/views/CorrectionForm/utils'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { DuplicateFormTabs } from '@client/views/RegisterForm/duplicate/DuplicateFormTabs'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { Text } from '@opencrvs/components/lib/Text'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import * as routes from '@client/navigation/routes'
import { Params, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.reg18};
  margin: 30px -25px;
`

const BackButtonContainer = styled.div`
  position: fixed;
  padding: 16px 0px;
  height: 64px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: relative;
    margin: 0 16px;
  }
`

const PageFooter = styled.div`
  height: 200px;
`

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
type IFormProps = RouteComponentProps<{
  declaration: IDeclaration
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
  reviewSummaryHeader?: React.ReactNode
  /**
   * In Review Correction, the component gives in additional props to override router props.
   */
  match?: { params: Params<string> }
}>

type DispatchProps = {
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
  deleteDeclaration: typeof deleteDeclaration
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
}

type Props = {
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
  fieldsToShowValidationErrors?: IFormField[]
  isWritingDraft: boolean
  userDetails: UserDetails | null
  scope: Scope[] | null
  config: IOfflineData
}

export type FullProps = IFormProps &
  Props &
  DispatchProps &
  IntlShapeProps &
  RouteComponentProps

type State = {
  isDataAltered: boolean
  rejectFormOpen: boolean
  hasError: boolean
  showConfirmationModal: boolean
  confirmDeleteDeclarationModal: boolean
  isFileUploading: boolean
  startTime: number
  selectedDuplicateComId: string
  isDuplicateDeclarationLoading: boolean
  formFieldKey: string
}

function getDeclarationIconColor(declaration: IDeclaration): string {
  return declaration.submissionStatus === SUBMISSION_STATUS.DRAFT
    ? 'purple'
    : declaration.registrationStatus
    ? STATUSTOCOLOR[declaration.registrationStatus]
    : 'orange'
}

export const DeleteModal: React.FC<{
  intl: IntlShape
  close: (result: boolean | null) => void
}> = ({ intl, close }) => (
  <ResponsiveModal
    autoHeight
    responsive={false}
    title={intl.formatMessage(messages.deleteDeclarationConfirmModalTitle)}
    actions={[
      <Button
        type="tertiary"
        id="cancel_delete"
        key="cancel_delete"
        onClick={() => {
          close(null)
        }}
      >
        {intl.formatMessage(buttonMessages.cancel)}
      </Button>,
      <Button
        type="negative"
        key="confirm_delete"
        id="confirm_delete"
        onClick={() => {
          close(true)
        }}
      >
        {intl.formatMessage(buttonMessages.confirm)}
      </Button>
    ]}
    show={true}
    handleClose={() => close(null)}
  >
    <Stack>
      <Text variant="reg16" element="p" color="grey500">
        {intl.formatMessage(messages.deleteDeclarationConfirmModalDescription)}
      </Text>
    </Stack>
  </ResponsiveModal>
)

function FormAppBar({
  section,
  declaration,
  duplicate,
  modifyDeclarationMethod,
  deleteDeclarationMethod,
  printDeclarationMethod,
  canSaveAndExit
}: {
  duplicate: boolean | undefined
  section: IFormSection
  declaration: IDeclaration
  modifyDeclarationMethod: (declration: IDeclaration) => void
  deleteDeclarationMethod: (declration: IDeclaration) => void
  printDeclarationMethod: (declarationId: string) => void
  canSaveAndExit: boolean
}) {
  const navigate = useNavigate()
  const intl = useIntl()
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const isFormDataAltered = () => {
    if (!declaration.localData) {
      // if there is no localData property
      // that means it's a draft and has unsaved changes
      return true
    }

    return !isEqual(declaration.localData, declaration.data)
  }

  const getRedirectionTabOnSaveOrExit = () => {
    const status =
      declaration.submissionStatus || declaration.registrationStatus
    switch (status) {
      case 'DECLARED':
        return WORKQUEUE_TABS.readyForReview
      case 'DRAFT':
        return WORKQUEUE_TABS.myDrafts
      case 'IN_PROGRESS':
        return WORKQUEUE_TABS.inProgressFieldAgent
      case 'REJECTED':
        return WORKQUEUE_TABS.requiresUpdate
      case 'VALIDATED':
        return WORKQUEUE_TABS.readyForReview
      default:
        return WORKQUEUE_TABS.inProgress
    }
  }
  const handleSaveAndExit = async () => {
    const saveAndExitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        id="save_declaration_confirmation"
        autoHeight
        responsive={false}
        title={intl.formatMessage(messages.saveDeclarationConfirmModalTitle)}
        actions={[
          <Button
            type="tertiary"
            id="cancel_save_exit"
            key="cancel_save_exit"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="positive"
            key="confirm_save_exit"
            id="confirm_save_exit"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {intl.formatMessage(
              messages.saveDeclarationConfirmModalDescription
            )}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      // saving current changes to localData
      // for reverting back the changes when users exits without saving
      declaration.localData = declaration.data
      // save declaration and exit
      dispatch(writeDeclaration(declaration))

      navigate(
        generateGoToHomeTabUrl({
          tabId: getRedirectionTabOnSaveOrExit()
        })
      )
    }
  }

  const handleExit = async () => {
    const isDataAltered = isFormDataAltered()
    if (!isDataAltered) {
      navigate(
        generateGoToHomeTabUrl({
          tabId: getRedirectionTabOnSaveOrExit()
        })
      )

      return
    }
    const [exitModalTitle, exitModalDescription] =
      isCorrection(declaration) ||
      declaration.registrationStatus === RegStatus.CorrectionRequested
        ? [
            intl.formatMessage(
              messages.exitWithoutSavingModalForCorrectionRecordTitle
            ),
            intl.formatMessage(
              messages.exitWithoutSavingModalForCorrectionRecordDescription
            )
          ]
        : [
            intl.formatMessage(
              messages.exitWithoutSavingDeclarationConfirmModalTitle
            ),
            intl.formatMessage(
              messages.exitWithoutSavingDeclarationConfirmModalDescription
            )
          ]
    const exitConfirm = await openModal<boolean | null>((close) => (
      <ResponsiveModal
        autoHeight
        responsive={false}
        title={exitModalTitle}
        actions={[
          <Button
            type="tertiary"
            id="cancel_save_without_exit"
            key="cancel_save_without_exit"
            onClick={() => {
              close(null)
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="confirm_save_without_exit"
            id="confirm_save_without_exit"
            onClick={() => {
              close(true)
            }}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(null)}
      >
        <Stack>
          <Text variant="reg16" element="p" color="grey500">
            {exitModalDescription}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))

    if (exitConfirm) {
      if (!declaration.localData) {
        deleteDeclarationMethod(declaration)
      } else {
        modifyDeclarationMethod({
          ...declaration,
          data: declaration.localData
        })
      }
      navigate(
        generateGoToHomeTabUrl({
          tabId: getRedirectionTabOnSaveOrExit()
        })
      )
    }
  }

  const handleDelete = async () => {
    const deleteConfirm = await openModal<boolean | null>((close) => (
      <DeleteModal intl={intl} close={close}></DeleteModal>
    ))

    deleteConfirm && deleteDeclarationMethod(declaration)
    return
  }
  switch (section.viewType) {
    case 'review':
      return (
        <>
          <AppBar
            desktopLeft={
              duplicate ? (
                <Duplicate />
              ) : (
                <DeclarationIcon color={getDeclarationIconColor(declaration)} />
              )
            }
            desktopTitle={
              duplicate
                ? intl.formatMessage(duplicateMessages.duplicateReviewHeader, {
                    event: declaration.event
                  })
                : intl.formatMessage(messages.newVitalEventRegistration, {
                    event: declaration.event
                  })
            }
            desktopRight={
              <>
                {!duplicate &&
                  !isCorrection(declaration) &&
                  declaration.registrationStatus !==
                    RegStatus.CorrectionRequested && (
                    <>
                      <Button
                        id="save-exit-btn"
                        type="primary"
                        size="small"
                        onClick={handleSaveAndExit}
                      >
                        <Icon name="DownloadSimple" />
                        {intl.formatMessage(buttonMessages.saveExitButton)}
                      </Button>
                      {window.config.FEATURES.PRINT_DECLARATION && (
                        <Button
                          id="print-btn"
                          type="secondary"
                          size="small"
                          onClick={() => printDeclarationMethod(declaration.id)}
                        >
                          <Icon name="Printer" />
                          {intl.formatMessage(buttonMessages.printDeclaration)}
                        </Button>
                      )}
                    </>
                  )}
                <Button
                  id="exit-btn"
                  type="secondary"
                  size="small"
                  onClick={handleExit}
                >
                  <Icon name="X" />
                  {intl.formatMessage(buttonMessages.exitButton)}
                </Button>
              </>
            }
            mobileLeft={
              duplicate ? (
                <Duplicate />
              ) : (
                <DeclarationIcon color={getDeclarationIconColor(declaration)} />
              )
            }
            mobileTitle={
              duplicate
                ? intl.formatMessage(duplicateMessages.duplicateReviewHeader, {
                    event: declaration.event
                  })
                : intl.formatMessage(messages.newVitalEventRegistration, {
                    event: declaration.event
                  })
            }
            mobileRight={
              <>
                {!duplicate && !isCorrection(declaration) && (
                  <Button type="icon" size="small" onClick={handleSaveAndExit}>
                    <Icon name="DownloadSimple" />
                  </Button>
                )}
                <Button type="icon" size="small" onClick={handleExit}>
                  <Icon name="X" />
                </Button>
              </>
            }
          />
          {modal}
        </>
      )
    case 'preview':
    case 'form':
      return (
        <>
          <AppBar
            desktopLeft={
              <DeclarationIcon color={getDeclarationIconColor(declaration)} />
            }
            desktopTitle={intl.formatMessage(
              messages.newVitalEventRegistration,
              {
                event: declaration.event
              }
            )}
            desktopRight={
              <>
                {!isCorrection(declaration) && (
                  <Button
                    id="save-exit-btn"
                    type="primary"
                    size="small"
                    disabled={!canSaveAndExit}
                    onClick={handleSaveAndExit}
                  >
                    <Icon name="DownloadSimple" />
                    {intl.formatMessage(buttonMessages.saveExitButton)}
                  </Button>
                )}
                {section.viewType === 'preview' &&
                  window.config.FEATURES.PRINT_DECLARATION && (
                    <Button
                      id="print-btn"
                      type="secondary"
                      size="small"
                      onClick={() => printDeclarationMethod(declaration.id)}
                    >
                      <Icon name="Printer" />
                      {intl.formatMessage(buttonMessages.printDeclaration)}
                    </Button>
                  )}
                <Button type="secondary" size="small" onClick={handleExit}>
                  <Icon name="X" />
                  {intl.formatMessage(buttonMessages.exitButton)}
                </Button>
                {declaration.submissionStatus === SUBMISSION_STATUS.DRAFT && (
                  <ToggleMenu
                    id="eventToggleMenu"
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                    menuItems={[
                      {
                        label: intl.formatMessage(
                          buttonMessages.deleteDeclaration
                        ),
                        handler: () => {
                          handleDelete()
                        }
                      }
                    ]}
                  />
                )}
              </>
            }
            mobileLeft={
              <DeclarationIcon color={getDeclarationIconColor(declaration)} />
            }
            mobileTitle={intl.formatMessage(
              messages.newVitalEventRegistration,
              {
                event: declaration.event
              }
            )}
            mobileRight={
              <>
                {!isCorrection(declaration) && (
                  <Button
                    type="icon"
                    size="small"
                    disabled={!canSaveAndExit}
                    onClick={handleSaveAndExit}
                  >
                    <Icon name="DownloadSimple" />
                  </Button>
                )}
                <Button type="icon" size="small" onClick={handleExit}>
                  <Icon name="X" />
                </Button>
                {declaration.submissionStatus === SUBMISSION_STATUS.DRAFT && (
                  <ToggleMenu
                    id="eventToggleMenu"
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                    menuItems={[
                      {
                        label: intl.formatMessage(
                          buttonMessages.deleteDeclaration
                        ),
                        handler: () => {
                          handleDelete()
                        }
                      }
                    ]}
                  />
                )}
              </>
            }
          />
          {modal}
        </>
      )
  }
  return null
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      isDataAltered: false,
      rejectFormOpen: false,
      hasError: false,
      showConfirmationModal: false,
      confirmDeleteDeclarationModal: false,
      isFileUploading: false,
      startTime: 0,
      selectedDuplicateComId: props.declaration.id,
      isDuplicateDeclarationLoading: false,
      formFieldKey: `${props.activeSection.id}-${props.activeSectionGroup.id}`
    }
  }
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  setSelectedCompId = (id: string) => {
    this.setState({ selectedDuplicateComId: id })
  }

  showAllValidationErrors = () => {
    const touched = getSectionFields(
      this.props.activeSection,
      this.props.declaration.data[this.props.activeSection.id],
      this.props.declaration.data
    ).reduce((memo, field) => {
      let fieldTouched: boolean | ITouchedNestedFields = true
      if (field.nestedFields) {
        fieldTouched = {
          value: true,
          nestedFields: flatten(Object.values(field.nestedFields)).reduce(
            (nestedMemo, nestedField) => ({
              ...nestedMemo,
              [nestedField.name]: true
            }),
            {}
          )
        }
      }
      return { ...memo, [field.name]: fieldTouched }
    }, {})
    this.setAllFormFieldsTouched(touched)
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes(SCOPES.RECORD_REGISTER)
  }

  userHasValidateScope() {
    const validateScopes = [
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES
    ] as Scope[]

    return (
      this.props.scope &&
      this.props.scope.some((x) => validateScopes.includes(x))
    )
  }

  componentDidMount() {
    this.setState({ startTime: Date.now() })
  }

  componentDidUpdate(prevProps: FullProps) {
    const oldHash = prevProps.router.location && prevProps.router.location.hash
    const newHash =
      this.props.router.location && this.props.router.location.hash
    const { declaration } = this.props
    const informantTypeChanged =
      prevProps.declaration?.data?.informant?.informantType !==
        declaration?.data?.informant?.informantType &&
      Boolean(declaration?.data?.informant?.informantType)

    // see https://github.com/opencrvs/opencrvs-core/issues/5820
    if (informantTypeChanged) {
      let informant
      let modifiedDeclaration = declaration

      if (declaration?.data?.informant?.informantType === 'MOTHER') {
        informant = 'mother'
      } else if (declaration?.data?.informant?.informantType === 'FATHER') {
        informant = 'father'
      } else if (declaration?.data?.informant?.informantType === 'SPOUSE') {
        informant = 'spouse'
      }

      modifiedDeclaration = {
        ...modifiedDeclaration,
        data: {
          ...modifiedDeclaration.data,
          informant: {
            informantType: modifiedDeclaration.data.informant?.informantType
          }
        }
      }

      if (informant) {
        modifiedDeclaration = {
          ...modifiedDeclaration,
          data: {
            ...modifiedDeclaration.data,
            [informant]: {
              ...modifiedDeclaration.data[informant],
              detailsExist: true
            }
          }
        }
      }
      this.props.modifyDeclaration(modifiedDeclaration)
      // this is to forcefully remount the component
      // to reset the initial values of formik
      this.setState({
        formFieldKey: `${this.props.activeSection.id}-${declaration.data.informant?.informantType}`
      })
    }

    if (newHash && oldHash !== newHash && !newHash.match('form-input')) {
      this.props.router.navigate(
        {
          pathname: this.props.router.location.pathname,
          hash: newHash + '-form-input'
        },
        {
          replace: true
        }
      )
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    if (declaration.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  logTime(timeMs: number) {
    const timeLoggedMS = (this.props.declaration.timeLoggedMS ?? 0) + timeMs
    const declarationId = this.props.declaration.id
    this.props.modifyDeclaration({ timeLoggedMS, id: declarationId })
  }

  confirmSubmission = (
    declaration: IDeclaration,
    submissionStatus: string,
    action: SubmissionAction,
    payload?: IPayload,
    downloadStatus?: DOWNLOAD_STATUS
  ) => {
    const updatedDeclaration = {
      ...declaration,
      submissionStatus,
      action,
      payload,
      downloadStatus,
      timeLoggedMS:
        (declaration.timeLoggedMS || 0) + Date.now() - this.state.startTime
    }
    this.props.writeDeclaration(updatedDeclaration)
    this.props.router.navigate(HOME)
  }

  generateSectionListForReview = (
    disabled: boolean,
    sections: IFormSection[]
  ) => {
    const result: IFormSection[] = sections.map((section: IFormSection) => {
      return merge(
        {
          disabled: section.viewType !== VIEW_TYPE.REVIEW && disabled
        },
        section
      )
    })
    return result
  }

  toggleRejectForm = () => {
    this.setState((state) => ({
      rejectFormOpen: !state.rejectFormOpen
    }))
  }

  toggleConfirmationModal = () => {
    this.setState((prevState) => ({
      showConfirmationModal: !prevState.showConfirmationModal
    }))
  }

  toggleConfirmDeleteModalOpen = () => {
    this.setState((prevState) => ({
      confirmDeleteDeclarationModal: !prevState.confirmDeleteDeclarationModal
    }))
  }

  getEvent() {
    const eventType = this.props.declaration.event || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return EventType.Birth
      case 'death':
        return EventType.Death
      case 'marriage':
        return EventType.Marriage
      default:
        return EventType.Birth
    }
  }

  onSaveAsDraftClicked = async () => {
    const { declaration } = this.props
    const canApproveOrRegister =
      this.userHasRegisterScope() || this.userHasValidateScope()
    const isConfirmationModalApplicable =
      declaration.registrationStatus === DECLARED ||
      declaration.registrationStatus === VALIDATED ||
      declaration.registrationStatus === REJECTED
    if (canApproveOrRegister && isConfirmationModalApplicable) {
      this.toggleConfirmationModal()
    } else {
      this.writeDeclarationAndGoToHome()
    }
  }

  writeDeclarationAndGoToHome = () => {
    this.props.writeDeclaration(this.props.declaration)
    this.props.router.navigate(
      generateGoToHomeTabUrl({
        tabId: this.getRedirectionTabOnSaveOrExit()
      })
    )
  }

  onDeleteDeclaration = (declaration: IDeclaration) => {
    this.props.deleteDeclaration(declaration.id, client)
  }

  onCloseDeclaration = () => {
    this.props.router.navigate(
      generateGoToHomeTabUrl({
        tabId: this.getRedirectionTabOnSaveOrExit()
      })
    )
  }

  continueButtonHandler = async (
    pageRoute: string,
    declarationId: string,
    pageId: string,
    groupId: string,
    event: string
  ) => {
    const { preventContinueIfError } = this.props.activeSectionGroup
    let groupHasError = false
    if (preventContinueIfError) {
      if (!this.props.declaration.data[this.props.activeSection.id]) {
        groupHasError = true
      } else {
        const activeSectionFields = this.props.activeSectionGroup.fields
        const activeSectionValues =
          this.props.declaration.data[this.props.activeSection.id]
        groupHasError = hasFormError(
          activeSectionFields,
          activeSectionValues,
          this.props.config,
          this.props.declaration.data,
          this.props.userDetails
        )
      }
      if (groupHasError) {
        this.showAllValidationErrors()
        return
      }
    }

    this.updateVisitedGroups()
    this.modifyDeclaration(
      this.getFormValues(),
      this.props.activeSection,
      this.props.declaration
    )

    this.props.router.navigate(
      generateGoToPageGroupUrl({
        pageRoute,
        declarationId,
        pageId,
        groupId,
        event
      })
    )
  }

  updateVisitedGroups = () => {
    const visitedGroups = this.props.declaration.visitedGroupIds || []
    if (
      visitedGroups.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === this.props.activeSection.id &&
          visitedGroup.groupId === this.props.activeSectionGroup.id
      ) === -1
    ) {
      visitedGroups.push({
        sectionId: this.props.activeSection.id,
        groupId: this.props.activeSectionGroup.id
      })
    }
    this.props.declaration.visitedGroupIds = visitedGroups
  }

  getRedirectionTabOnSaveOrExit = () => {
    const status =
      this.props.declaration.submissionStatus ||
      this.props.declaration.registrationStatus ||
      ''
    switch (status) {
      case 'DECLARED':
        return WORKQUEUE_TABS.readyForReview
      case 'DRAFT':
        return WORKQUEUE_TABS.myDrafts
      case 'IN_PROGRESS':
        return WORKQUEUE_TABS.inProgressFieldAgent
      case 'REJECTED':
        return WORKQUEUE_TABS.requiresUpdate
      case 'VALIDATED':
        return WORKQUEUE_TABS.readyForReview
      default:
        return WORKQUEUE_TABS.inProgress
    }
  }

  setAllFieldsDirty = () =>
    this.props.declaration.visitedGroupIds?.some(
      (visitedGroup) =>
        visitedGroup.sectionId === this.props.activeSection.id &&
        visitedGroup.groupId === this.props.activeSectionGroup.id
    ) ?? false

  getFormValues = () => {
    const { activeSectionGroup, declaration, activeSection } = this.props
    return {
      ...mapFieldsToValues(
        activeSectionGroup.fields,
        declaration.data[activeSection.id],
        this.props.config,
        declaration.data,
        this.props.userDetails
      ),
      ...declaration.data[activeSection.id]
    }
  }

  render() {
    const {
      intl,
      fieldsToShowValidationErrors,
      declaration,
      registerForm,
      duplicate,
      activeSection,
      activeSectionGroup,
      reviewSummaryHeader,
      userDetails,
      config
    } = this.props

    const nextSectionGroup = getNextSectionIds(
      registerForm.sections,
      activeSection,
      activeSectionGroup,
      declaration,
      userDetails
    )

    const isErrorOccured = this.state.hasError
    const debouncedModifyDeclaration = debounce(this.modifyDeclaration, 300)
    const isDocumentUploadPage =
      this.props?.router.match?.params?.pageId === 'documents'
    const introSection =
      findFirstVisibleSection(registerForm.sections).id === activeSection.id
    const canContinue =
      'canContinue' in activeSection
        ? evalExpressionInFieldDefinition(
            activeSection.canContinue!,
            declaration.data[activeSection.id],
            config,
            declaration.data,
            declaration.id,
            userDetails
          )
        : true

    return (
      <>
        <TimeMounted
          onUnmount={(duration: number) => {
            this.logTime(duration)
          }}
        ></TimeMounted>
        <Frame
          header={
            <FormAppBar
              declaration={declaration}
              section={activeSection}
              duplicate={duplicate}
              modifyDeclarationMethod={this.props.modifyDeclaration}
              deleteDeclarationMethod={this.onDeleteDeclaration}
              printDeclarationMethod={(declarationId: string) =>
                this.props.router.navigate(
                  formatUrl(routes.PRINT_RECORD, {
                    declarationId
                  })
                )
              }
              canSaveAndExit={canContinue}
            />
          }
          key={activeSection.id}
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          {isErrorOccured && (
            <ErrorText id="error_message_section">
              {intl.formatMessage(messages.registerFormQueryError)}
            </ErrorText>
          )}
          {!isErrorOccured && (
            <>
              {activeSection.viewType === VIEW_TYPE.PREVIEW && (
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={declaration}
                  form={this.props.registerForm}
                  submitClickEvent={this.confirmSubmission}
                  onChangeReviewForm={this.modifyDeclaration}
                  userDetails={userDetails}
                />
              )}
              {activeSection.viewType === VIEW_TYPE.REVIEW && (
                <>
                  {duplicate && (
                    <DuplicateFormTabs
                      declaration={declaration}
                      selectedDuplicateComId={this.state.selectedDuplicateComId}
                      onTabClick={this.setSelectedCompId}
                    />
                  )}
                  {(!duplicate ||
                    this.state.selectedDuplicateComId === declaration.id) && (
                    <ReviewSection
                      pageRoute={this.props.pageRoute}
                      draft={declaration}
                      form={this.props.registerForm}
                      rejectDeclarationClickEvent={this.toggleRejectForm}
                      submitClickEvent={this.confirmSubmission}
                      onChangeReviewForm={this.modifyDeclaration}
                      reviewSummaryHeader={reviewSummaryHeader}
                      userDetails={userDetails}
                      onContinue={() => {
                        this.props.router.navigate(
                          generateCertificateCorrectionUrl({
                            declarationId: this.props.declaration.id,
                            pageId: CorrectionSection.SupportingDocuments
                          })
                        )
                      }}
                    />
                  )}
                </>
              )}

              {activeSection.viewType === VIEW_TYPE.FORM && (
                <>
                  <Frame.LayoutForm>
                    <Frame.SectionFormBackAction>
                      {!introSection && (
                        <BackButtonContainer>
                          <Button
                            type="tertiary"
                            size="small"
                            onClick={() => this.props.router.navigate(-1)}
                            disabled={!canContinue}
                          >
                            <Icon name="ArrowLeft" size="medium" />
                            {intl.formatMessage(buttonMessages.back)}
                          </Button>
                        </BackButtonContainer>
                      )}
                    </Frame.SectionFormBackAction>
                    <Frame.Section>
                      <Content
                        size={ContentSize.SMALL}
                        key={activeSectionGroup.id}
                        id="register_form"
                        title={
                          (activeSectionGroup.title &&
                            intl.formatMessage(activeSectionGroup.title)) ??
                          (activeSection.title &&
                            intl.formatMessage(activeSection.title))
                        }
                        showTitleOnMobile={true}
                        bottomActionDirection="column"
                        bottomActionButtons={
                          [
                            nextSectionGroup && (
                              <Button
                                id="next_section"
                                key="next_section"
                                type="primary"
                                size="large"
                                fullWidth
                                onClick={() => {
                                  this.continueButtonHandler(
                                    this.props.pageRoute,
                                    declaration.id,
                                    nextSectionGroup.sectionId,
                                    nextSectionGroup.groupId,
                                    declaration.event.toLowerCase()
                                  )
                                }}
                                disabled={
                                  !canContinue || this.state.isFileUploading
                                }
                              >
                                {intl.formatMessage(
                                  buttonMessages.continueButton
                                )}
                              </Button>
                            ),
                            declaration.review && (
                              <Button
                                id="back-to-review-button"
                                key="back-to-review-button"
                                type="secondary"
                                size="large"
                                className="item"
                                fullWidth
                                onClick={() => {
                                  this.continueButtonHandler(
                                    this.props.pageRoute,
                                    declaration.id,
                                    declaration.submissionStatus &&
                                      declaration.submissionStatus ===
                                        SUBMISSION_STATUS.DRAFT
                                      ? 'preview'
                                      : 'review',
                                    declaration.submissionStatus &&
                                      declaration.submissionStatus ===
                                        SUBMISSION_STATUS.DRAFT
                                      ? 'preview-view-group'
                                      : 'review-view-group',
                                    declaration.event.toLowerCase()
                                  )
                                }}
                              >
                                {intl.formatMessage(
                                  messages.backToReviewButton
                                )}
                              </Button>
                            )
                          ].filter(Boolean) as React.ReactElement[]
                        }
                      >
                        {this.props.isWritingDraft ? (
                          <SpinnerWrapper>
                            <Spinner id="draft_write_loading" />
                          </SpinnerWrapper>
                        ) : (
                          <>
                            {activeSection.notice && (
                              <Notice
                                id={`form_section_notice_${activeSectionGroup.id}`}
                              >
                                {intl.formatMessage(activeSection.notice)}
                              </Notice>
                            )}
                            <form
                              id={`form_section_id_${activeSectionGroup.id}`}
                              onSubmit={(event: React.FormEvent) =>
                                event.preventDefault()
                              }
                            >
                              {isFileSizeExceeded(declaration) &&
                                isDocumentUploadPage && (
                                  <Alert type="warning">
                                    {intl.formatMessage(
                                      constantsMessages.totalFileSizeExceed,
                                      {
                                        fileSize: bytesToSize(
                                          ACCUMULATED_FILE_SIZE
                                        )
                                      }
                                    )}
                                  </Alert>
                                )}
                              <FormFieldGenerator
                                id={`${activeSection.id}-${activeSectionGroup.id}`}
                                key={this.state.formFieldKey}
                                onChange={(values) => {
                                  debouncedModifyDeclaration(
                                    values,
                                    activeSection,
                                    declaration
                                  )
                                }}
                                setAllFieldsDirty={this.setAllFieldsDirty()}
                                fieldsToShowValidationErrors={
                                  fieldsToShowValidationErrors
                                }
                                initialValues={this.getFormValues()}
                                fields={getVisibleGroupFields(
                                  activeSectionGroup
                                )}
                                draftData={declaration.data}
                                draftId={declaration.id}
                                onSetTouched={(setTouchedFunc) => {
                                  this.setAllFormFieldsTouched = setTouchedFunc
                                }}
                                onUploadingStateChanged={
                                  this.onUploadingStateChanged
                                }
                              />
                            </form>
                          </>
                        )}
                      </Content>
                      <PageFooter />
                    </Frame.Section>
                  </Frame.LayoutForm>
                </>
              )}
            </>
          )}
          {this.state.rejectFormOpen && (
            <RejectRegistrationForm
              onClose={this.toggleRejectForm}
              confirmRejectionEvent={this.confirmSubmission}
              duplicate={duplicate}
              draftId={declaration.id}
              event={this.getEvent()}
              declaration={declaration}
            />
          )}
          <ResponsiveModal
            id="save_declaration_confirmation"
            title={intl.formatMessage(
              messages.saveDeclarationConfirmModalTitle
            )}
            show={this.state.showConfirmationModal}
            handleClose={this.toggleConfirmationModal}
            responsive={false}
            contentHeight={80}
            actions={[
              <TertiaryButton
                id="cancel_save"
                key="cancel_save"
                onClick={this.toggleConfirmationModal}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                id="confirm_save"
                key="confirm_save"
                onClick={this.writeDeclarationAndGoToHome}
              >
                {intl.formatMessage(buttonMessages.save)}
              </PrimaryButton>
            ]}
          >
            {intl.formatMessage(
              messages.saveDeclarationConfirmModalDescription
            )}
          </ResponsiveModal>
          <ResponsiveModal
            id="delete_declaration_confirmation"
            title={intl.formatMessage(
              messages.deleteDeclarationConfirmModalTitle
            )}
            show={this.state.confirmDeleteDeclarationModal}
            handleClose={this.toggleConfirmDeleteModalOpen}
            responsive={false}
            contentHeight={80}
            actions={[
              <TertiaryButton
                id="cancel_delete"
                key="cancel_delete"
                onClick={this.toggleConfirmDeleteModalOpen}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <DangerButton
                id="confirm_delete"
                key="confirm_delete"
                onClick={() => this.onDeleteDeclaration(declaration)}
              >
                {intl.formatMessage(buttonMessages.delete)}
              </DangerButton>
            ]}
          >
            {intl.formatMessage(
              messages.deleteDeclarationConfirmModalDescription
            )}
          </ResponsiveModal>
        </Frame>
      </>
    )
  }
}

function firstVisibleGroup(
  section: IFormSection,
  declaration: IDeclaration,
  userDetails?: UserDetails | null
): IFormSectionGroup | undefined {
  return getVisibleSectionGroupsBasedOnConditions(
    section,
    declaration.data[section.id] || {},
    declaration.data,
    userDetails
  )[0]
}

function getValidSectionGroup(
  sections: IFormSection[],
  declaration: IDeclaration,
  sectionId: string,
  groupId?: string,
  userDetails?: UserDetails | null
): {
  activeSection: IFormSection
  activeSectionGroup: IFormSectionGroup
} {
  const currentSection = sectionId
    ? sections.find((sec) => sec.id === sectionId)
    : findFirstVisibleSection(sections)
  if (!currentSection) {
    throw new Error(`Section with id "${sectionId}" not found `)
  }

  const currentGroup = groupId
    ? currentSection.groups.find((group) => group.id === groupId)
    : firstVisibleGroup(currentSection, declaration, userDetails)

  const sectionIndex = sections.findIndex((sec) => sec.id === currentSection.id)
  if (!currentGroup) {
    return getValidSectionGroup(
      sections,
      declaration,
      sections[sectionIndex + 1].id,
      undefined,
      userDetails
    )
  }
  return {
    activeSection: currentSection,
    activeSectionGroup: currentGroup
  }
}
function getInitialValue(
  field: IFormField,
  form: IFormSectionData,
  draft: IFormData,
  config: IOfflineData,
  user: UserDetails | null
) {
  let fieldInitialValue = field.initialValue
  if (field.initialValueKey) {
    fieldInitialValue = get(draft, field.initialValueKey, '')
  }

  return handleInitialValue(fieldInitialValue!, form, config, draft, user)
}

export function replaceInitialValues(
  fields: IFormField[],
  form: IFormSectionData,
  draft: IFormData,
  config: IOfflineData,
  user: UserDetails | null
) {
  return fields.map((field) => ({
    ...field,
    initialValue:
      isUndefined(form[field.name]) || isNull(form[field.name])
        ? getInitialValue(field, form, draft, config, user)
        : form[field.name]
  }))
}

function findFirstVisibleSection(sections: IFormSection[]) {
  return sections.filter(({ viewType }) => viewType !== 'hidden')[0]
}

function mapStateToProps(state: IStoreState, props: IFormProps) {
  const { router, registerForm, declaration } = props
  const params = {
    ...(router.match?.params ?? {}),
    // ReviewCorrection depends on additional params passed in as props.
    ...(props?.match?.params ?? {})
  }

  const sectionId =
    params.pageId || findFirstVisibleSection(registerForm.sections).id
  const user = getUserDetails(state)
  const config = getOfflineData(state)
  const groupId = params.groupId
  const { activeSection, activeSectionGroup } = getValidSectionGroup(
    registerForm.sections,
    declaration,
    sectionId,
    groupId,
    user
  )

  if (!activeSectionGroup) {
    throw new Error(`Configuration for group "${params.groupId}" missing!`)
  }

  const setAllFieldsDirty =
    (declaration.visitedGroupIds &&
      declaration.visitedGroupIds.findIndex(
        (visitedGroup) =>
          visitedGroup.sectionId === activeSection.id &&
          visitedGroup.groupId === activeSectionGroup.id
      ) > -1) ||
    false

  const fields = activeSectionGroup.fields

  let updatedFields: IFormField[] = []

  if (!setAllFieldsDirty) {
    updatedFields = activeSectionGroup.fields.filter(
      (field, index) => fields[index].initialValue !== field.initialValue
    )
  }

  return {
    activeSection,
    activeSectionGroup: {
      ...activeSectionGroup,
      fields
    },
    fieldsToShowValidationErrors: updatedFields,
    isWritingDraft: declaration.writingDraft ?? false,
    scope: getScope(state),
    config,
    userDetails: user,
    location: router.location,
    navigate: router.navigate
  }
}

export const RegisterForm = withRouter(
  connect<Props, DispatchProps, IFormProps, IStoreState>(mapStateToProps, {
    writeDeclaration,
    modifyDeclaration,
    deleteDeclaration,
    toggleDraftSavedNotification
  })(injectIntl(RegisterFormView))
)
