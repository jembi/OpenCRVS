import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { authenticate, storeUserInformation } from './service'
import {
  generateVerificationCode,
  sendVerificationCode,
  generateNonce,
  storeVerificationCode
} from 'src/features/verifyCode/service'
import { logger } from 'src/logger'
import { unauthorized } from 'boom'
import { PRODUCTION } from 'src/constants'

export interface IAuthPayload {
  mobile: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload
  let result

  try {
    result = await authenticate(payload.mobile, payload.password)
  } catch (err) {
    throw unauthorized()
  }

  const nonce = generateNonce()
  await storeUserInformation(nonce, result.userId, result.scope, result.mobile)

  const isDemoUser = result.scope.indexOf('demo') > -1

  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
    await storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = await generateVerificationCode(nonce, result.mobile)
  }

  if (!PRODUCTION || isDemoUser) {
    logger.info('Sending a verification SMS', {
      mobile: result.mobile,
      verificationCode
    })
  } else {
    await sendVerificationCode(result.mobile, verificationCode)
  }

  return { mobile: result.mobile, nonce }
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string()
})
