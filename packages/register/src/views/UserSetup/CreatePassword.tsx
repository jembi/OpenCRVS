import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  InputField,
  TextInput,
  WarningMessage
} from '@opencrvs/components/lib/forms'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData
} from '@register/components/ProtectedAccount'

const messages = defineMessages({
  header: {
    id: 'newPassword.header',
    defaultMessage: 'Choose a new password',
    description: 'New Password header'
  },
  instruction: {
    id: 'newPassword.instruction',
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    description: 'New Password instruction'
  },
  newPassword: {
    id: 'password.label.new',
    defaultMessage: 'New password:',
    description: 'New password label'
  },
  confirmPassword: {
    id: 'password.label.confirm',
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label'
  },
  validationMsg: {
    id: 'password.validation.msg',
    defaultMessage: 'Password must have:',
    description: 'Password validation message'
  },
  minLength: {
    id: 'password.minLength',
    defaultMessage: '{min} characters minimum',
    description: 'Password validation'
  },
  hasCases: {
    id: 'password.cases',
    defaultMessage: 'Contain upper and lower cases',
    description: 'Password validation'
  },
  hasNumber: {
    id: 'password.number',
    defaultMessage: 'At least one number',
    description: 'Password validation'
  },
  match: {
    id: 'password.match',
    defaultMessage: 'Passwords match',
    description: 'Password validation'
  },
  mismatch: {
    id: 'password.mismatch',
    defaultMessage: 'Passwords do not match',
    description: 'Password validation'
  },
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue',
    description: 'Continue button label'
  },
  passwordRequired: {
    id: 'error.required.password',
    defaultMessage: 'New password is not valid',
    description: 'New password required'
  }
})

const Header = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.black};
`
const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.copy};
`
const Action = styled.div`
  margin-top: 32px;
`

const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.error};
`
const PasswordMatch = styled.div`
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.success};
  margin-top: 8px;
`
const PasswordMismatch = styled.div`
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 8px;
`

const PasswordContents = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  max-width: 416px;
`
const ValidationRulesSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  margin: 16px 0 16px;
  padding: 8px 24px;
  & div {
    padding: 8px 0;
    display: flex;
    align-items: center;
    & span {
      margin-left: 8px;
    }
  }
`

type State = {
  newPassword: string
  confirmPassword: string
  validLength: boolean
  hasNumber: boolean
  hasCases: boolean
  passwordMismatched: boolean
  passwordMatched: boolean
  continuePressed: boolean
}

interface IProps {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

type IFullProps = IProps & InjectedIntlProps

class CreatePasswordComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      newPassword: '',
      confirmPassword: '',
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      continuePressed: false
    }
  }
  validateLength = (value: string) => {
    this.setState(() => ({
      validLength: value.length >= 8
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
  checkPasswordStrength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      newPassword: value,
      confirmPassword: '',
      passwordMatched: false,
      passwordMismatched: false,
      continuePressed: false
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
      passwordMatched: value.length > 0 && newPassword === value,
      continuePressed: false
    }))
  }
  whatNext = () => {
    this.setState(() => ({
      continuePressed: true,
      passwordMismatched:
        this.state.newPassword.length > 0 &&
        this.state.newPassword !== this.state.confirmPassword
    }))

    if (
      this.state.newPassword.length > 0 &&
      this.state.newPassword === this.state.confirmPassword
    ) {
      this.props.setupData.password = this.state.newPassword
      this.props.goToStep(ProtectedAccoutStep.LANDING, this.props.setupData)
    }
  }
  render = () => {
    const { intl } = this.props
    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(messages.newPassword)}
          goBack={() => {
            this.props.goToStep(ProtectedAccoutStep.LANDING, {})
          }}
        >
          <Header>{intl.formatMessage(messages.header)}</Header>
          <Instruction>{intl.formatMessage(messages.instruction)}</Instruction>
          <GlobalError id="GlobalError">
            {this.state.continuePressed && this.state.passwordMismatched && (
              <WarningMessage>
                {intl.formatMessage(messages.mismatch)}
              </WarningMessage>
            )}
            {this.state.continuePressed &&
              this.state.newPassword.length === 0 && (
                <WarningMessage>
                  {intl.formatMessage(messages.passwordRequired)}
                </WarningMessage>
              )}
          </GlobalError>
          <PasswordContents>
            <InputField
              id="newPassword"
              label={intl.formatMessage(messages.newPassword)}
              touched={true}
              required={false}
              optionalLabel=""
            >
              <TextInput
                id="NewPassword"
                type="password"
                touched={true}
                value={this.state.newPassword}
                onChange={this.checkPasswordStrength}
                error={
                  this.state.continuePressed &&
                  this.state.newPassword.length === 0
                }
              />
            </InputField>
            <ValidationRulesSection>
              <div>{intl.formatMessage(messages.validationMsg)}</div>
              <div>
                {this.state.validLength && <TickOn />}
                {!this.state.validLength && <TickOff />}
                <span>
                  {intl.formatMessage(messages.minLength, { min: 8 })}
                </span>
              </div>
              <div>
                {this.state.hasCases && <TickOn />}
                {!this.state.hasCases && <TickOff />}
                <span>{intl.formatMessage(messages.hasCases)}</span>
              </div>
              <div>
                {this.state.hasNumber && <TickOn />}
                {!this.state.hasNumber && <TickOff />}
                <span>{intl.formatMessage(messages.hasNumber)}</span>
              </div>
            </ValidationRulesSection>

            <InputField
              id="newPassword"
              label={intl.formatMessage(messages.confirmPassword)}
              touched={true}
              required={false}
              optionalLabel=""
            >
              <TextInput
                id="ConfirmPassword"
                type="password"
                touched={true}
                error={
                  this.state.continuePressed && this.state.passwordMismatched
                }
                value={this.state.confirmPassword}
                onChange={this.matchPassword}
              />
            </InputField>
            {this.state.passwordMismatched && (
              <PasswordMismatch>
                {intl.formatMessage(messages.mismatch)}
              </PasswordMismatch>
            )}
            {this.state.passwordMatched && (
              <PasswordMatch>
                {intl.formatMessage(messages.match)}
              </PasswordMatch>
            )}
          </PasswordContents>
          <Action>
            <PrimaryButton id="Continue" onClick={this.whatNext}>
              {intl.formatMessage(messages.continue)}
            </PrimaryButton>
          </Action>
        </ActionPageLight>
      </>
    )
  }
}

export const CreatePassword = connect(
  null,
  {}
)(injectIntl(CreatePasswordComponent))
