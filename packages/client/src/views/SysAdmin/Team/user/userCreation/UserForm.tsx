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
import { FormFieldGenerator } from '@client/components/form'
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import {
  getSectionFields,
  getVisibleGroupFields,
  hasFormError
} from '@client/forms/utils'
import {
  buttonMessages,
  validationMessages as messages
} from '@client/i18n/messages'
import {
  goBack,
  goToCreateUserSection,
  goToTeamUserList,
  goToUserReviewForm
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import {
  clearUserFormData,
  ISystemRolesMap,
  modifyUserFormData
} from '@client/user/userReducer'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { Content } from '@opencrvs/components/lib/Content'
import { selectSystemRoleMap } from '@client/user/selectors'

export const Action = styled.div`
  margin-top: 32px;
`

type IProps = {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
  offlineCountryConfig: IOfflineData
  systemRoleMap: ISystemRolesMap
}

type IState = {
  disableContinueOnLocation: boolean
  fileUploading: boolean
}

type IDispatchProps = {
  goBack: typeof goBack
  goToTeamUserList: typeof goToTeamUserList
  modifyUserFormData: typeof modifyUserFormData
  goToCreateUserSection: typeof goToCreateUserSection
  goToUserReviewForm: typeof goToUserReviewForm
  clearUserFormData: typeof clearUserFormData
}
type IFullProps = IntlShapeProps & IProps & IDispatchProps

class UserFormComponent extends React.Component<IFullProps, IState> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      disableContinueOnLocation: false,
      fileUploading: false
    }
  }

  handleFormAction = () => {
    const { formData, activeGroup, offlineCountryConfig } = this.props
    if (hasFormError(activeGroup.fields, formData, offlineCountryConfig)) {
      this.showAllValidationErrors()
    } else {
      this.props.userId
        ? this.props.goToUserReviewForm(
            this.props.userId,
            this.props.nextSectionId,
            this.props.nextGroupId
          )
        : this.props.goToCreateUserSection(
            this.props.nextSectionId,
            this.props.nextGroupId
          )
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      fileUploading: isUploading
    })
  }

  showAllValidationErrors = () => {
    const touched = getSectionFields(
      this.props.section,
      this.props.formData
    ).reduce((memo, { name }) => ({ ...memo, [name]: true }), {})
    this.setAllFormFieldsTouched(touched)
  }

  handleBackAction = () => {
    this.props.goBack()
  }

  modifyData = (values: any) => {
    const { formData } = this.props
    if (
      values['registrationOffice'] !== '0' &&
      values['registrationOffice'] !== ''
    ) {
      if (values.role) {
        const getSystemRoles = this.props.systemRoleMap
        values.systemRole = getSystemRoles[values.role]
      }
      this.props.modifyUserFormData({ ...formData, ...values })
      this.setState({
        disableContinueOnLocation: false
      })
    } else {
      this.setState({
        disableContinueOnLocation: true
      })
    }
  }

  render = () => {
    const { section, intl, activeGroup, userId, formData, goToTeamUserList } =
      this.props
    const title = activeGroup?.title
      ? intl.formatMessage(activeGroup.title)
      : ''

    return (
      <>
        <ActionPageLight
          title={
            userId
              ? intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
              : section.title && intl.formatMessage(section.title)
          }
          goBack={this.handleBackAction}
          goHome={() => goToTeamUserList(String(formData.registrationOffice))}
          hideBackground={true}
        >
          <Content title={title}>
            <FormFieldGenerator
              key={activeGroup.id}
              id={section.id}
              onChange={(values) => this.modifyData(values)}
              setAllFieldsDirty={false}
              fields={getVisibleGroupFields(activeGroup)}
              onSetTouched={(setTouchedFunc) => {
                this.setAllFormFieldsTouched = setTouchedFunc
              }}
              requiredErrorMessage={messages.requiredForNewUser}
              onUploadingStateChanged={this.onUploadingStateChanged}
            />
            <Action>
              <PrimaryButton
                id="confirm_form"
                onClick={this.handleFormAction}
                disabled={
                  this.state.disableContinueOnLocation ||
                  this.state.fileUploading
                }
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </PrimaryButton>
            </Action>
          </Content>
        </ActionPageLight>
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState
): { offlineCountryConfig: IOfflineData; systemRoleMap: ISystemRolesMap } => {
  return {
    systemRoleMap: selectSystemRoleMap(state),
    offlineCountryConfig: getOfflineData(state)
  }
}

export const UserForm = connect(mapStateToProps, {
  modifyUserFormData,
  goToCreateUserSection,
  goToUserReviewForm,
  goBack,
  goToTeamUserList,
  clearUserFormData
})(injectIntl(UserFormComponent))
