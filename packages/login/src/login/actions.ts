import { AxiosError } from 'axios'
import { RouterAction } from 'react-router-redux'
import { convertToMSISDN } from '@login/utils/dataCleanse'
import {
  IAuthenticateResponse,
  IAuthenticationData,
  ITokenResponse
} from '@login/utils/authApi'
import { phoneNumberFormat } from '@login/utils/validate'
export const AUTHENTICATE = 'login/AUTHENTICATE'
export const AUTHENTICATION_COMPLETED = 'login/AUTHENTICATION_COMPLETED'
export const AUTHENTICATION_FAILED = 'login/AUTHENTICATION_FAILED'

export const VERIFY_CODE = 'login/VERIFY_CODE'
export const VERIFY_CODE_COMPLETED = 'login/VERIFY_CODE_COMPLETED'
export const VERIFY_CODE_FAILED = 'login/VERIFY_CODE_FAILED'

export const RESEND_SMS = 'login/RESEND_SMS'
export const RESEND_SMS_COMPLETED = 'login/RESEND_SMS_COMPLETED'
export const RESEND_SMS_FAILED = 'login/RESEND_SMS_FAILED'
export const AUTHENTICATE_VALIDATE = 'login/AUTHENTICATE_VALIDATE'
export const GOTO_APP = 'login/GOTO_APP'

export type AuthenticationDataAction = {
  type: typeof AUTHENTICATE
  payload: IAuthenticationData
}
export type AuthenticationFieldValidationAction = {
  type: typeof AUTHENTICATE_VALIDATE
  payload: number
}

export type AuthenticateResponseAction = {
  type: typeof AUTHENTICATION_COMPLETED
  payload: IAuthenticateResponse
}

export type AuthenticationFailedAction = {
  type: typeof AUTHENTICATION_FAILED
  payload: AxiosError
}

export type ResendSMSAction = {
  type: typeof RESEND_SMS
}

export type ResendSMSCompleteAction = {
  type: typeof RESEND_SMS_COMPLETED
  payload: IAuthenticateResponse
}

export type ResendSMSFailedAction = {
  type: typeof RESEND_SMS_FAILED
  payload: Error
}

export type VerifyCodeAction = {
  type: typeof VERIFY_CODE
  payload: { code: string }
}

export type VerifyCodeCompleteAction = {
  type: typeof VERIFY_CODE_COMPLETED
  payload: ITokenResponse
}

export type VerifyCodeFailedAction = {
  type: typeof VERIFY_CODE_FAILED
  payload: Error
}

export type GoToAppAction = {
  type: typeof GOTO_APP
  payload: string
}

export type Action =
  | RouterAction
  | AuthenticationDataAction
  | AuthenticateResponseAction
  | AuthenticationFailedAction
  | ResendSMSAction
  | ResendSMSCompleteAction
  | ResendSMSFailedAction
  | VerifyCodeAction
  | VerifyCodeCompleteAction
  | VerifyCodeFailedAction
  | GoToAppAction
  | AuthenticationFieldValidationAction

export const authenticate = (
  values: IAuthenticationData
): AuthenticationDataAction | AuthenticationFieldValidationAction => {
  if (!values.mobile || !values.password) {
    return {
      type: AUTHENTICATE_VALIDATE,
      payload: 500
    }
  }
  const validate = phoneNumberFormat(values.mobile)
  if (validate) {
    return {
      type: AUTHENTICATE_VALIDATE,
      payload: 503
    }
  }
  const cleanedData = {
    mobile: convertToMSISDN(values.mobile, window.config.COUNTRY),
    password: values.password
  }

  return {
    type: AUTHENTICATE,
    payload: cleanedData
  }
}

export const completeAuthentication = (
  response: IAuthenticateResponse
): AuthenticateResponseAction => ({
  type: AUTHENTICATION_COMPLETED,
  payload: response
})

export const failAuthentication = (
  error: AxiosError
): AuthenticationFailedAction => ({
  type: AUTHENTICATION_FAILED,
  payload: error
})

export const resendSMS = (): ResendSMSAction => ({
  type: RESEND_SMS
})

export interface IVerifyCodeNumbers {
  code: string
}

export const completeSMSResend = (
  response: IAuthenticateResponse
): ResendSMSCompleteAction => ({
  type: RESEND_SMS_COMPLETED,
  payload: response
})

export const failSMSResend = (error: AxiosError): ResendSMSFailedAction => ({
  type: RESEND_SMS_FAILED,
  payload: error
})

export const verifyCode = (values: IVerifyCodeNumbers): VerifyCodeAction => {
  const code = Object.values(values).join('')
  return {
    type: VERIFY_CODE,
    payload: { code }
  }
}

export const completeVerifyCode = (
  response: ITokenResponse
): VerifyCodeCompleteAction => ({
  type: VERIFY_CODE_COMPLETED,
  payload: response
})

export const failVerifyCode = (error: AxiosError): VerifyCodeFailedAction => ({
  type: VERIFY_CODE_FAILED,
  payload: error
})
export const gotoApp = (appId: string): GoToAppAction => ({
  type: GOTO_APP,
  payload: appId
})
