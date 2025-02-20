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
import { COUNTRY_CONFIG_URL, USER_MANAGEMENT_URL } from '@gateway/constants'
import {
  Roles,
  logger,
  isBase64FileString,
  joinURL,
  fetchJSON
} from '@opencrvs/commons'
import {
  IUserModelData,
  IUserPayload,
  IUserSearchPayload
} from '@gateway/features/user/type-resolvers'
import {
  getFullName,
  inScope,
  isTokenOwner,
  getUserId
} from '@gateway/features/user/utils'
import {
  GQLHumanNameInput,
  GQLResolver,
  GQLSearchFieldAgentResponse,
  GQLUserInput
} from '@gateway/graphql/schema'
import { checkVerificationCode } from '@gateway/routes/verifyCode/handler'

import fetch from '@gateway/fetch'
import { validateAttachments } from '@gateway/utils/validators'
import { postMetrics } from '@gateway/features/metrics/service'
import { uploadBase64ToMinio } from '@gateway/features/documents/service'
import { rateLimitedResolver } from '@gateway/rate-limit'
import { SCOPES } from '@opencrvs/commons/authentication'
import { UserInputError } from '@gateway/utils/graphql-errors'

export const resolvers: GQLResolver = {
  Query: {
    getUser: rateLimitedResolver(
      { requestsPerMinute: 20 },
      async (_, { userId }, { headers: authHeader, dataSources }) => {
        if (
          !inScope(authHeader, [
            SCOPES.USER_READ,
            SCOPES.USER_READ_MY_OFFICE,
            SCOPES.USER_READ_MY_JURISDICTION,
            SCOPES.USER_UPDATE,
            SCOPES.USER_UPDATE_MY_JURISDICTION
          ]) &&
          !isTokenOwner(authHeader, userId!)
        ) {
          return await Promise.reject(
            new Error(
              `Can not get user information. ${userId} is not the owner of the token`
            )
          )
        }
        const user = await dataSources.usersAPI.getUserById(userId!)
        return user
      }
    ),
    getUserByMobile: rateLimitedResolver(
      { requestsPerMinute: 20 },
      async (_, { mobile }, { dataSources }) => {
        return dataSources.usersAPI.getUserByMobile(mobile)
      }
    ),

    getUserByEmail: rateLimitedResolver(
      { requestsPerMinute: 20 },
      (_, { email }, { dataSources }) => {
        return dataSources.usersAPI.getUserByEmail(email)
      }
    ),

    searchUsers: rateLimitedResolver(
      { requestsPerMinute: 20 },
      async (
        _,
        {
          username = null,
          mobile = null,
          status = null,
          primaryOfficeId = null,
          locationId = null,
          count = 10,
          skip = 0,
          sort = 'desc'
        },
        { headers: authHeader }
      ) => {
        // Only users with organisation scope should be able to retrieve the list
        // of users in a particular office
        if (
          !inScope(authHeader, [
            SCOPES.ORGANISATION_READ_LOCATIONS,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
            SCOPES.USER_DATA_SEEDING
          ])
        ) {
          throw new Error('Searching other users is not allowed for this user')
        }

        let payload: IUserSearchPayload = {
          count,
          skip,
          sortOrder: sort
        }
        if (username) {
          payload = { ...payload, username }
        }
        if (mobile) {
          payload = { ...payload, mobile }
        }
        if (locationId) {
          payload = { ...payload, locationId }
        }
        if (primaryOfficeId) {
          payload = { ...payload, primaryOfficeId }
        }
        if (status) {
          payload = { ...payload, status }
        }
        const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        })
        return res.json()
      }
    ),

    searchFieldAgents: rateLimitedResolver(
      { requestsPerMinute: 20 },
      async (
        _,
        {
          locationId,
          primaryOfficeId,
          language = 'en',
          status = null,
          timeStart,
          timeEnd,
          event,
          count = 10,
          skip = 0,
          sort = 'desc'
        },
        { headers: authHeader, dataSources }
      ) => {
        // Only sysadmin or registrar or registration agent should be able to search field agents
        if (
          !inScope(authHeader, [
            SCOPES.USER_READ,
            SCOPES.USER_READ_MY_JURISDICTION,
            SCOPES.USER_READ_MY_OFFICE,
            SCOPES.PERFORMANCE_READ
          ])
        ) {
          throw new Error('Search field agents is not allowed for this user')
        }

        if (!locationId && !primaryOfficeId) {
          logger.error('No location provided')
          return {
            totalItems: 0,
            results: []
          }
        }

        let payload: IUserSearchPayload = {
          count,
          skip,
          sortOrder: sort
        }
        if (locationId) {
          payload = { ...payload, locationId }
        }
        if (primaryOfficeId) {
          payload = { ...payload, primaryOfficeId }
        }
        if (status) {
          payload = { ...payload, status }
        }
        const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        })
        const userResponse = await res.json()
        if (
          !userResponse ||
          !userResponse.results ||
          !userResponse.totalItems
        ) {
          logger.error('Invalid result found from search user endpoint')
          return {
            totalItems: 0,
            results: []
          }
        }
        // Loading metrics data by practitioner ids
        const metricsForPractitioners = await postMetrics(
          '/declarationStartedMetricsByPractitioners',
          {
            timeStart,
            timeEnd,
            locationId: locationId ? locationId : (primaryOfficeId as string),
            event,
            practitionerIds: userResponse.results.map(
              (user: IUserModelData) => user.practitionerId
            )
          },
          authHeader
        )

        const roles = await dataSources.countryConfigAPI.getRoles()

        const fieldAgentRoles = roles
          .filter((role) =>
            role.scopes.includes(SCOPES.RECORD_SUBMIT_FOR_REVIEW)
          )
          .map((role) => role.id)

        const fieldAgentList: GQLSearchFieldAgentResponse[] =
          userResponse.results
            .filter((user: IUserModelData) => {
              const role = roles.find((role) => role.id === user.role)
              return role && fieldAgentRoles.includes(role.id)
            })
            .map((user: IUserModelData) => {
              const role = roles.find((role) => role.id === user.role)

              const metricsData = metricsForPractitioners.find(
                (metricsForPractitioner: { practitionerId: string }) =>
                  metricsForPractitioner.practitionerId === user.practitionerId
              )
              return {
                practitionerId: user.practitionerId,
                fullName: getFullName(user, language),
                role: role,
                status: user.status,
                avatar: user.avatar,
                primaryOfficeId: user.primaryOfficeId,
                creationDate: user?.creationDate,
                totalNumberOfDeclarationStarted:
                  metricsData?.totalNumberOfDeclarationStarted ?? 0,
                totalNumberOfInProgressAppStarted:
                  metricsData?.totalNumberOfInProgressAppStarted ?? 0,
                totalNumberOfRejectedDeclarations:
                  metricsData?.totalNumberOfRejectedDeclarations ?? 0,
                averageTimeForDeclaredDeclarations:
                  metricsData?.averageTimeForDeclaredDeclarations ?? 0
              }
            })

        return {
          results: fieldAgentList,
          totalItems: userResponse.totalItems
        }
      }
    ),

    verifyPasswordById: rateLimitedResolver(
      { requestsPerMinute: 10 },
      async (_, { id, password }, { headers: authHeader }) => {
        const res = await fetch(`${USER_MANAGEMENT_URL}verifyPasswordById`, {
          method: 'POST',
          body: JSON.stringify({ id, password }),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        })

        if (res.status !== 200) {
          throw new Error('Unauthorized to verify password')
        }

        return await res.json()
      }
    )
  },

  Mutation: {
    async createOrUpdateUser(_, { user }, { headers: authHeader }) {
      if (
        !inScope(authHeader, [
          SCOPES.USER_DATA_SEEDING,
          SCOPES.USER_CREATE,
          SCOPES.USER_CREATE_MY_JURISDICTION,
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ])
      ) {
        throw new Error('Create or update user is not allowed for this user')
      }

      try {
        if (user.signature) {
          await validateAttachments([user.signature])
        }
      } catch (error) {
        throw new UserInputError(error.message)
      }

      const roles = await fetchJSON<Roles>(
        joinURL(COUNTRY_CONFIG_URL, '/roles')
      )
      const userPayload: IUserPayload = createOrUpdateUserPayload(user, roles)
      const action = userPayload.id ? 'updateUser' : 'createUser'

      const res = await fetch(joinURL(USER_MANAGEMENT_URL, action), {
        method: 'POST',
        body: JSON.stringify(userPayload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status === 403) {
        const errorResponse = await res.json()
        const duplicateDataErrorMap = {
          emailForNotification: {
            field: 'email',
            conflictingValue: userPayload.emailForNotification
          },
          mobile: {
            field: 'mobile',
            conflictingValue: userPayload.mobile
          }
        }

        throw new UserInputError(errorResponse.message, {
          duplicateNotificationMethodError:
            duplicateDataErrorMap[
              errorResponse[
                'errorThrowingProperty'
              ] as keyof typeof duplicateDataErrorMap
            ]
        })
      } else if (res.status !== 201) {
        throw new Error(
          `Something went wrong on user-mgnt service. Couldn't perform ${action}`
        )
      }
      return await res.json()
    },
    async activateUser(
      _,
      { userId, password, securityQNAs },
      { headers: authHeader }
    ) {
      if (
        !isTokenOwner(authHeader, userId) &&
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ])
      )
        throw new Error('User can not be activated')

      const res = await fetch(`${USER_MANAGEMENT_URL}activateUser`, {
        method: 'POST',
        body: JSON.stringify({ userId, password, securityQNAs }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      const response = await res.json()

      if (res.status !== 201) {
        throw new Error(
          "Something went wrong on user-mgnt service. Couldn't activate given user"
        )
      }
      return response.userId
    },
    async changePassword(
      _,
      { userId, existingPassword, password },
      { headers: authHeader }
    ) {
      // Only token owner of CONFIG_UPDATE_ALL should be able to change their password
      if (
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ]) &&
        !isTokenOwner(authHeader, userId)
      ) {
        throw new Error(
          `Change password is not allowed. ${userId} is not the owner of the token`
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserPassword`, {
        method: 'POST',
        body: JSON.stringify({ userId, existingPassword, password }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          "Something went wrong on user-mgnt service. Couldn't change user password"
        )
      }
      return true
    },
    async changePhone(
      _,
      { userId, phoneNumber, nonce, verifyCode },
      { headers: authHeader }
    ) {
      if (!isTokenOwner(authHeader, userId)) {
        throw new Error(
          `Change phone is not allowed. ${userId} is not the owner of the token`
        )
      }
      try {
        await checkVerificationCode(nonce, verifyCode)
      } catch (err) {
        logger.error(err)
        throw new Error(`Change phone is not allowed. Error: ${err}`)
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserPhone`, {
        method: 'POST',
        body: JSON.stringify({ userId, phoneNumber }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          "Something went wrong on user-mgnt service. Couldn't change user phone number"
        )
      }
      return true
    },
    async changeEmail(
      _,
      { userId, email, nonce, verifyCode },
      { headers: authHeader }
    ) {
      if (!isTokenOwner(authHeader, userId)) {
        throw new Error(
          `Change email is not allowed. ${userId} is not the owner of the token`
        )
      }
      try {
        await checkVerificationCode(nonce, verifyCode)
      } catch (err) {
        logger.error(err)
        throw new Error(`Change email is not allowed. Error: ${err}`)
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserEmail`, {
        method: 'POST',
        body: JSON.stringify({ userId, email }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          "Something went wrong on user-mgnt service. Couldn't change user email"
        )
      }
      return true
    },
    async changeAvatar(_, { userId, avatar }, { headers: authHeader }) {
      try {
        await validateAttachments([avatar])
      } catch (error) {
        throw new UserInputError(error.message)
      }

      // Only token owner should be able to change their avatar
      if (!isTokenOwner(authHeader, userId)) {
        throw new Error(
          `Changing avatar is not allowed. ${userId} is not the owner of the token`
        )
      }

      if (isBase64FileString(avatar.data)) {
        const docUploadResponse = await uploadBase64ToMinio(
          avatar.data,
          authHeader
        )
        avatar.data = docUploadResponse
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}changeUserAvatar`, {
        method: 'POST',
        body: JSON.stringify({ userId, avatar }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          "Something went wrong on user-mgnt service. Couldn't change user avatar"
        )
      }
      return avatar
    },
    async auditUser(
      _,
      { userId, action, reason, comment },
      { headers: authHeader }
    ) {
      if (
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION,
          SCOPES.USER_DATA_SEEDING
        ])
      ) {
        throw new Error(
          `User ${userId} is not allowed to audit for not having the sys admin scope`
        )
      }

      const auditedBy = getUserId(authHeader)

      const res = await fetch(`${USER_MANAGEMENT_URL}auditUser`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          auditedBy,
          action,
          reason,
          comment
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          `Something went wrong on user-mgnt service. Couldn't audit user ${userId}`
        )
      }
      return true
    },
    async resendInvite(_, { userId }, { headers: authHeader }) {
      if (
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ])
      ) {
        throw new Error('SMS invite can not be resent by this user')
      }

      const res = await fetch(`${USER_MANAGEMENT_URL}resendInvite`, {
        method: 'POST',
        body: JSON.stringify({
          userId
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          `Something went wrong on user-mgnt service. Couldn't send sms to ${userId}`
        )
      }
      return true
    },
    async usernameReminder(_, { userId }, { headers: authHeader }) {
      if (
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ])
      ) {
        throw new Error('Username reminder can not be resent by this user')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}usernameReminder`, {
        method: 'POST',
        body: JSON.stringify({
          userId
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          `Something went wrong on user-mgnt service. Couldn't send sms to ${userId}`
        )
      }
      return true
    },
    async resetPasswordInvite(_, { userId }, { headers: authHeader }) {
      if (
        !inScope(authHeader, [
          SCOPES.USER_UPDATE,
          SCOPES.USER_UPDATE_MY_JURISDICTION
        ])
      ) {
        throw new Error('Reset password can not be sent by this user')
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}resetPasswordInvite`, {
        method: 'POST',
        body: JSON.stringify({
          userId
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 200) {
        throw new Error(
          `Something went wrong on user-mgnt service. Couldn't reset password and send sms to ${userId}`
        )
      }
      return true
    }
  }
}

function createOrUpdateUserPayload(
  user: GQLUserInput,
  roles: Roles
): IUserPayload {
  const userPayload: IUserPayload = {
    name: user.name.map((name: GQLHumanNameInput) => ({
      use: name.use as string,
      family: name.familyName?.trim() as string,
      given: [name.firstNames?.trim() || ''] as string[]
    })),
    role: user.role as string,
    ...(user.password && { password: user.password }),
    ...(user.status && { status: user.status }),
    primaryOfficeId: user.primaryOffice as string,
    email: '',
    ...(user.email && { emailForNotification: user.email }), //instead of saving data in email, we want to store it in emailForNotification property
    ...(user.mobile && { mobile: user.mobile as string }),
    device: user.device as string,
    signature: user.signature,
    ...(user.username && { username: user.username })
  }
  if (user.id) {
    userPayload.id = user.id
  }
  return userPayload
}
