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
  generateCreateUserSectionUrl,
  generateUserReviewFormUrl
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import { clearUserFormData, modifyUserFormData } from '@client/user/userReducer'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Button } from '@opencrvs/components/lib/Button'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { UserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'

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
  user: UserDetails | null
}

type IState = {
  fileUploading: boolean
}

type IDispatchProps = {
  modifyUserFormData: typeof modifyUserFormData
  clearUserFormData: typeof clearUserFormData
}
type IFullProps = IntlShapeProps & IProps & IDispatchProps & RouteComponentProps

class UserFormComponent extends React.Component<IFullProps, IState> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      fileUploading: false
    }
  }

  handleFormAction = () => {
    const { formData, activeGroup, offlineCountryConfig, user } = this.props
    if (
      hasFormError(activeGroup.fields, formData, offlineCountryConfig, {}, user)
    ) {
      this.showAllValidationErrors()
    } else {
      this.props.userId
        ? this.props.router.navigate(
            generateUserReviewFormUrl({
              userId: this.props.userId,
              sectionId: this.props.nextSectionId,
              groupId: this.props.nextGroupId
            })
          )
        : this.props.router.navigate(
            generateCreateUserSectionUrl({
              sectionId: this.props.nextSectionId,
              groupId: this.props.nextGroupId
            })
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
    this.props.router.navigate(-1)
  }

  modifyData = (values: IFormSectionData) => {
    const { formData } = this.props
    this.props.modifyUserFormData({ ...formData, ...values })
  }

  render = () => {
    const { section, intl, activeGroup, userId, formData } = this.props
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
          goHome={() =>
            this.props.router.navigate({
              pathname: routes.TEAM_USER_LIST,
              search: stringify({
                locationId: String(formData.registrationOffice)
              })
            })
          }
          hideBackground={true}
        >
          <Content size={ContentSize.SMALL} title={title}>
            <FormFieldGenerator
              key={activeGroup.id}
              id={section.id}
              onChange={(values) => this.modifyData(values)}
              setAllFieldsDirty={false}
              fields={getVisibleGroupFields(activeGroup)}
              onSetTouched={(setTouchedFunc) => {
                this.setAllFormFieldsTouched = setTouchedFunc
              }}
              draftData={{ user: formData }}
              requiredErrorMessage={messages.requiredForNewUser}
              onUploadingStateChanged={this.onUploadingStateChanged}
            />
            <Action>
              <Button
                id="confirm_form"
                type="primary"
                size="large"
                fullWidth
                onClick={this.handleFormAction}
                disabled={this.state.fileUploading}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </Button>
            </Action>
          </Content>
        </ActionPageLight>
      </>
    )
  }
}

const mapStateToProps = (state: IStoreState) => {
  return {
    offlineCountryConfig: getOfflineData(state),
    user: getUserDetails(state)
  }
}

export const UserForm = withRouter(
  connect(mapStateToProps, {
    modifyUserFormData,
    clearUserFormData
  })(injectIntl(UserFormComponent))
)
