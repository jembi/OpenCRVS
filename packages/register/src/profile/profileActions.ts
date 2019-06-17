import { RouterAction } from 'react-router-redux'
import { IURLParams } from '@register/utils/authUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { IUserDetails } from '@register/utils/userUtils'
export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'
export const REDIRECT_TO_AUTHENTICATION = 'PROFILE/REDIRECT_TO_AUTHENTICATION'
export const FETCH_USER_DETAILS = 'PROFILE/FETCH_USER_DETAILS'
export const SET_USER_DETAILS = 'PROFILE/SET_USER_DETAILS'
export const MODIFY_USER_DETAILS = 'PROFILE/MODIFY_USER_DETAILS'
export const SET_INITIAL_USER_DETAILS = 'PROFILE/SET_INITIAL_USER_DETAILS'
export const GET_USER_DETAILS_SUCCESS = 'PROFILE/GET_USER_DETAILS_SUCCESS'
export const GET_USER_DETAILS_FAILED = 'PROFILE/GET_USER_DETAILS_FAILED'

type RedirectToAuthenticationAction = {
  type: typeof REDIRECT_TO_AUTHENTICATION
}

type CheckAuthAction = {
  type: typeof CHECK_AUTH
  payload: IURLParams
}

type SetUserDetailsAction = {
  type: typeof SET_USER_DETAILS
  payload: ApolloQueryResult<GQLQuery>
}

type ModifyUserDetailsAction = {
  type: typeof MODIFY_USER_DETAILS
  payload: IUserDetails
}

export type IGetStorageUserDetailsSuccessAction = {
  type: typeof GET_USER_DETAILS_SUCCESS
  payload: string
}

export type IGetStorageUserDetailsFailedAction = {
  type: typeof GET_USER_DETAILS_FAILED
}

export type ISetInitialUserDetails = {
  type: typeof SET_INITIAL_USER_DETAILS
}

export type Action =
  | CheckAuthAction
  | SetUserDetailsAction
  | RedirectToAuthenticationAction
  | RouterAction
  | ISetInitialUserDetails
  | IGetStorageUserDetailsSuccessAction
  | IGetStorageUserDetailsFailedAction
  | ModifyUserDetailsAction

export const checkAuth = (payload: IURLParams): CheckAuthAction => ({
  type: CHECK_AUTH,
  payload
})

export const setUserDetails = (
  payload: ApolloQueryResult<GQLQuery>
): SetUserDetailsAction => ({
  type: SET_USER_DETAILS,
  payload
})
export const modifyUserDetails = (
  payload: IUserDetails
): ModifyUserDetailsAction => ({
  type: MODIFY_USER_DETAILS,
  payload
})
export const setInitialUserDetails = (): ISetInitialUserDetails => ({
  type: SET_INITIAL_USER_DETAILS
})

export const getStorageUserDetailsSuccess = (
  response: string
): IGetStorageUserDetailsSuccessAction => ({
  type: GET_USER_DETAILS_SUCCESS,
  payload: response
})

export const getStorageUserDetailsFailed = (): IGetStorageUserDetailsFailedAction => ({
  type: GET_USER_DETAILS_FAILED
})

export const redirectToAuthentication = (): RedirectToAuthenticationAction => ({
  type: REDIRECT_TO_AUTHENTICATION
})
