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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { ErrorMessage } from '@opencrvs/components/lib/ErrorMessage'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { IStoreState } from '@opencrvs/client/src/store'
import { userMessages as messages } from '@client/i18n/messages'
import { getUserDetails } from '@client/profile/profileSelectors'
import styled from 'styled-components'
import { EMPTY_STRING } from '@client/utils/constants'
import { gql } from '@apollo/client'
import { get } from 'lodash'
import * as React from 'react'
import { Mutation } from '@apollo/client/react/components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { UserDetails } from '@client/utils/userUtils'
import { Text } from '@opencrvs/components/lib/Text'

const Message = styled.div`
  margin-bottom: 16px;
`
const PasswordContents = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  max-width: 50%;
  & input {
    width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const ValidationRulesSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  margin: 16px 0 24px;
  padding: 8px 24px;
  & div {
    padding: 8px 0;
    display: flex;
    align-items: center;
    & span {
      margin-left: 8px;
    }
  }
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const ValidationRulesSectionLg = styled.div`
  background: ${({ theme }) => theme.colors.background};
  margin: 30px 20px 24px;
  width: 100%;
  padding: 8px 24px;
  & div {
    padding: 8px 0;
    display: flex;
    align-items: center;
    & span {
      margin-left: 8px;
    }
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const PasswordMatch = styled(Text)`
  margin-top: 8px;
`

const PasswordMismatch = styled(Text)`
  margin-top: 8px;
`

const Row = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 20px;
  }
`
const Field = styled.div`
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`

const BoxedError = styled.div`
  margin-bottom: 10px;
  display: flex;
`
const changePasswordMutation = gql`
  mutation changePassword(
    $userId: String!
    $existingPassword: String!
    $password: String!
  ) {
    changePassword(
      userId: $userId
      existingPassword: $existingPassword
      password: $password
    )
  }
`
type State = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  validLength: boolean
  hasNumber: boolean
  hasCases: boolean
  passwordMismatched: boolean
  passwordMatched: boolean
  errorOccured: boolean
}

interface IProps {
  showPasswordChange: boolean
  togglePasswordChangeModal: () => void
  passwordChanged: () => void
  userDetails: UserDetails | null
}
type IFullProps = IProps & IntlShapeProps

class PasswordChangeModalComp extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      currentPassword: EMPTY_STRING,
      newPassword: EMPTY_STRING,
      confirmPassword: EMPTY_STRING,
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      errorOccured: false
    }
  }
  validateLength = (value: string) => {
    this.setState(() => ({
      validLength: value.length >= 12
    }))
  }
  validateNumber = (value: string) => {
    this.setState(() => ({
      hasNumber: /\d/.test(value)
    }))
  }
  validateCases = (value: string) => {
    this.setState(() => ({
      hasCases: /[a-z]/.test(value) && /[A-Z]/.test(value)
    }))
  }
  setCurrentPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentPassword = event.target.value
    this.setState(() => ({ currentPassword }))
  }
  checkPasswordStrength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      newPassword: value,
      confirmPassword: EMPTY_STRING,
      passwordMatched: false,
      passwordMismatched: false
    }))
    this.validateLength(value)
    this.validateNumber(value)
    this.validateCases(value)
  }
  matchPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = this.state.newPassword
    const value = event.target.value
    this.setState(() => ({
      confirmPassword: value,
      passwordMismatched: value.length > 0 && newPassword !== value,
      passwordMatched: value.length > 0 && newPassword === value
    }))
  }
  changePassword = (mutation: () => void) => {
    if (
      this.state.passwordMatched &&
      this.state.currentPassword &&
      this.state.hasCases &&
      this.state.hasNumber &&
      this.state.validLength
    ) {
      mutation()
    }
  }
  hideModal = () => {
    this.setState(() => ({
      currentPassword: EMPTY_STRING,
      newPassword: EMPTY_STRING,
      confirmPassword: EMPTY_STRING
    }))
    this.props.togglePasswordChangeModal()
  }
  passwordChangecompleted = () => {
    this.setState({
      currentPassword: EMPTY_STRING,
      newPassword: EMPTY_STRING,
      confirmPassword: EMPTY_STRING,
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      errorOccured: false
    })
    this.props.passwordChanged()
  }
  render() {
    const { intl, showPasswordChange } = this.props
    return (
      <ResponsiveModal
        id="ChangePasswordModal"
        title={intl.formatMessage(messages.changePassword)}
        show={showPasswordChange}
        contentHeight={420}
        actions={[
          <Mutation
            key="change-password-mutation"
            mutation={changePasswordMutation}
            variables={{
              userId: get(this.props, 'userDetails.userMgntUserID'),
              existingPassword: this.state.currentPassword,
              password: this.state.newPassword
            }}
            onCompleted={this.passwordChangecompleted}
            onError={() => this.setState({ errorOccured: true })}
          >
            {(changePassword: () => void) => {
              return (
                <PrimaryButton
                  id="confirm-button"
                  key="confirm"
                  onClick={() => this.changePassword(changePassword)}
                  disabled={
                    !Boolean(this.state.currentPassword.length) ||
                    !this.state.hasCases ||
                    !this.state.hasNumber ||
                    !this.state.validLength ||
                    !this.state.passwordMatched
                  }
                >
                  {intl.formatMessage(messages.confirmButtonLabel)}
                </PrimaryButton>
              )
            }}
          </Mutation>
        ]}
        width={1000}
        handleClose={this.hideModal}
      >
        <Message>{intl.formatMessage(messages.changePasswordMessage)}</Message>

        <form
          id="password-update-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <Row>
            <PasswordContents>
              <BoxedError>
                {this.state.errorOccured && (
                  <ErrorMessage>
                    {intl.formatMessage(messages.incorrectPassword)}
                  </ErrorMessage>
                )}
              </BoxedError>

              <Field>
                <InputField
                  id="currentPassword"
                  label={intl.formatMessage(messages.currentPassword)}
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <TextInput
                    id="CurrentPassword"
                    type="password"
                    touched={true}
                    value={this.state.currentPassword}
                    onChange={this.setCurrentPassword}
                  />
                </InputField>
              </Field>
            </PasswordContents>
          </Row>
          <Row>
            <PasswordContents>
              <Field>
                <InputField
                  id="newPassword"
                  label={intl.formatMessage(messages.newPasswordLabel)}
                  touched={true}
                  required={false}
                >
                  <TextInput
                    id="NewPassword"
                    type="password"
                    touched={true}
                    value={this.state.newPassword}
                    onChange={this.checkPasswordStrength}
                  />
                </InputField>
                <ValidationRulesSection>
                  <div>
                    {intl.formatMessage(
                      messages.passwordUpdateFormValidationMsg
                    )}
                  </div>
                  <div>
                    {this.state.validLength && <TickOn />}
                    {!this.state.validLength && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordLengthCharacteristicsForPasswordUpdateForm,
                        {
                          min: intl.formatMessage({
                            defaultMessage: '12',
                            description: 'Minimum length password',
                            id: 'number.twelve'
                          })
                        }
                      )}
                    </span>
                  </div>
                  <div>
                    {this.state.hasCases && <TickOn />}
                    {!this.state.hasCases && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordCaseCharacteristicsForPasswordUpdateForm
                      )}
                    </span>
                  </div>
                  <div>
                    {this.state.hasNumber && <TickOn />}
                    {!this.state.hasNumber && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordNumberCharacteristicsForPasswordUpdateForm
                      )}
                    </span>
                  </div>
                </ValidationRulesSection>
              </Field>
              <Field>
                <InputField
                  id="newPassword"
                  label={intl.formatMessage(messages.confirmPasswordLabel)}
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <TextInput
                    id="ConfirmPassword"
                    type="password"
                    touched={true}
                    error={this.state.passwordMismatched}
                    value={this.state.confirmPassword}
                    onChange={this.matchPassword}
                  />
                </InputField>
                {this.state.passwordMismatched && (
                  <PasswordMismatch
                    id="passwordMismatch"
                    variant="bold16"
                    color="negative"
                    element="span"
                  >
                    {intl.formatMessage(messages.mismatchedPasswordMsg)}
                  </PasswordMismatch>
                )}
                {this.state.passwordMatched && (
                  <PasswordMatch
                    id="passwordMatch"
                    variant="bold16"
                    color="positive"
                    element="span"
                  >
                    {intl.formatMessage(messages.matchedPasswordMsg)}
                  </PasswordMatch>
                )}
              </Field>
            </PasswordContents>
            <ValidationRulesSectionLg>
              <div>
                {intl.formatMessage(messages.passwordUpdateFormValidationMsg)}
              </div>
              <div>
                {this.state.validLength && <TickOn />}
                {!this.state.validLength && <TickOff />}
                <span>
                  {intl.formatMessage(
                    messages.passwordLengthCharacteristicsForPasswordUpdateForm,
                    {
                      min: intl.formatMessage({
                        defaultMessage: '12',
                        description: 'Minimum length password',
                        id: 'number.twelve'
                      })
                    }
                  )}
                </span>
              </div>
              <div>
                {this.state.hasCases && <TickOn />}
                {!this.state.hasCases && <TickOff />}
                <span>
                  {intl.formatMessage(
                    messages.passwordCaseCharacteristicsForPasswordUpdateForm
                  )}
                </span>
              </div>
              <div>
                {this.state.hasNumber && <TickOn />}
                {!this.state.hasNumber && <TickOff />}
                <span>
                  {intl.formatMessage(
                    messages.passwordNumberCharacteristicsForPasswordUpdateForm
                  )}
                </span>
              </div>
            </ValidationRulesSectionLg>
          </Row>
        </form>
      </ResponsiveModal>
    )
  }
}

const mapStateToProps = (state: IStoreState) => {
  return {
    userDetails: getUserDetails(state)
  }
}
export const PasswordChangeModal = connect(mapStateToProps)(
  injectIntl(PasswordChangeModalComp)
)
