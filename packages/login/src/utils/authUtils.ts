import * as decode from 'jwt-decode'
import * as Sentry from '@sentry/browser'

export interface IURLParams {
  [key: string]: string | string[] | undefined
}
export interface ITokenPayload {
  subject: string
  exp: string
  algorithm: string
  scope: string[]
}

export const getTokenPayload = (token: string) => {
  if (!token) {
    return null
  }
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    Sentry.captureException(err)
    return null
  }

  return decoded
}
