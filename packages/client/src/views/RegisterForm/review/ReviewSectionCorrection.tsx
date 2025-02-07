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
import {
  IDeclaration,
  SUBMISSION_STATUS,
  modifyDeclaration,
  writeDeclaration
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import { Button } from '@opencrvs/components/lib/Button'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { Text } from '@opencrvs/components/lib/Text'
import React from 'react'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/register'
import { buttonMessages } from '@client/i18n/messages'
import { IFormSectionData, SubmissionAction } from '@client/forms'
import { IRejectCorrectionForm } from '@client/review/reject-correction'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { hasFormError } from '@client/forms/utils'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { UserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { generateGoToHomeTabUrl } from '@client/navigation'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

interface IChildrenProps {
  toggleRejectModal: () => void
  toggleApproveModal: () => void
}

interface IProps {
  declaration: IDeclaration
  children(props: IChildrenProps): React.ReactNode
}

interface IConnectProps {
  config: IOfflineData
  user: UserDetails | null
}

type DispatchProps = {
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
}

type FullProps = RouteComponentProps<IProps> &
  IntlShapeProps &
  DispatchProps & { form: IRejectCorrectionForm } & IConnectProps

type State = {
  data: IFormSectionData
  approvePrompt: boolean
  rejectPrompt: boolean
  enabledForReject: boolean
  startTime: number
}

class ReviewSectionCorrectionComp extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      data: {},
      approvePrompt: false,
      rejectPrompt: false,
      enabledForReject: false,
      startTime: 0
    }
  }

  componentDidMount() {
    this.setState({ startTime: Date.now() })
  }

  toggleRejectModal = () => {
    this.setState((state) => ({
      rejectPrompt: !state.rejectPrompt
    }))
  }

  toggleApproveModal = () => {
    this.setState((state) => ({
      approvePrompt: !state.approvePrompt
    }))
  }

  approveCorrectionAction = () => {
    const recordWithSubmissionStatus = {
      ...this.props.declaration,
      submissionStatus: SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
      action: SubmissionAction.APPROVE_CORRECTION
    }
    this.props.modifyDeclaration(recordWithSubmissionStatus)
    this.props.writeDeclaration(recordWithSubmissionStatus)

    this.props.router.navigate(
      generateGoToHomeTabUrl({
        tabId: WORKQUEUE_TABS.readyToPrint
      })
    )
  }

  rejectCorrectionAction = () => {
    const reason = this.state.data.rejectionRaisonOfCorrection as string
    const payload = {
      id: this.props.declaration.id,
      details: {
        reason,
        timeLoggedMS:
          (this.props.declaration.timeLoggedMS || 0) +
          Date.now() -
          this.state.startTime
      }
    }
    const updatedDeclaration = {
      ...this.props.declaration,
      submissionStatus: SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
      action: SubmissionAction.REJECT_CORRECTION,
      payload,
      timeLoggedMS:
        (this.props.declaration.timeLoggedMS || 0) +
        Date.now() -
        this.state.startTime
    }

    this.props.writeDeclaration(updatedDeclaration)
    this.props.router.navigate(
      generateGoToHomeTabUrl({
        tabId: WORKQUEUE_TABS.readyToPrint
      })
    )
  }

  storeData = (rejectionFormData: IFormSectionData) => {
    this.setState(
      () => ({ data: rejectionFormData }),
      () =>
        this.setState(() => ({
          enabledForReject: !hasFormError(
            this.props.form.fields,
            rejectionFormData,
            this.props.config,
            this.props.declaration.data,
            this.props.user
          )
        }))
    )
  }

  render() {
    const { intl, form } = this.props
    const { fields } = form

    return (
      <>
        {this.props.children({
          toggleRejectModal: this.toggleRejectModal,
          toggleApproveModal: this.toggleApproveModal
        })}

        <Dialog
          id="save_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionConfirmModalTitle)}
          isOpen={this.state.approvePrompt}
          onClose={this.toggleApproveModal}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_save"
              key="cancel_save"
              onClick={this.toggleApproveModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="positive"
              size="medium"
              id="confirm_save"
              key="confirm_save"
              onClick={this.approveCorrectionAction}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
        >
          <Text element="p" variant="reg16">
            {intl.formatMessage(messages.saveCorrectionConfirmModalDescription)}
          </Text>
        </Dialog>
        <Dialog
          id="reject_correction_confirmation"
          title={intl.formatMessage(messages.saveCorrectionRejectModalTitle)}
          isOpen={this.state.rejectPrompt}
          onClose={this.toggleRejectModal}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_reject"
              key="cancel_reject"
              onClick={this.toggleRejectModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="negative"
              size="medium"
              key="submit_reject_form"
              id="submit_reject_form"
              disabled={!this.state.enabledForReject}
              onClick={this.rejectCorrectionAction}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
        >
          <Text element="p" variant="reg16">
            {intl.formatMessage(messages.saveCorrectionRejectModalDescription)}
          </Text>
          <FormFieldGenerator
            id="reject_form"
            fields={fields}
            onChange={this.storeData}
            setAllFieldsDirty={false}
            draftData={this.props.declaration.data}
            draftId={this.props.declaration.id}
          />
        </Dialog>
      </>
    )
  }
}

export const ReviewSectionCorrection = withRouter(
  connect<
    IConnectProps,
    DispatchProps,
    RouteComponentProps<IProps>,
    IStoreState
  >(
    (state) => ({ config: getOfflineData(state), user: getUserDetails(state) }),
    {
      writeDeclaration,
      modifyDeclaration
    }
  )(injectIntl<'intl', FullProps>(ReviewSectionCorrectionComp))
)
