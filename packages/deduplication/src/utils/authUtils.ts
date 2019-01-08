import * as decode from 'jwt-decode'
import * as Hapi from 'hapi'

export enum USER_SCOPE {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify'
}

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export const getTokenPayload = (token: string) => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occured during token decode : ${err}`
    )
  }
  return decoded
}

export const getToken = (request: Hapi.Request): string => {
  if (request.headers['authorization'].indexOf('Bearer') > -1) {
    return request.headers['authorization'].split(' ')[1]
  } else {
    return request.headers['authorization']
  }
}
