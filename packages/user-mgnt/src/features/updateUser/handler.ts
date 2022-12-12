/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  generateUsername,
  rollbackUpdateUser,
  getFromFhir,
  createFhirPractitioner,
  createFhirPractitionerRole,
  sendUpdateUsernameNotification,
  getCatchmentAreaIdsByPrimaryOfficeId,
  postFhir
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import User, {
  FIELD_AGENT_TYPES,
  IUser,
  IUserModel
} from '@user-mgnt/model/user'
import { roleScopeMapping } from '@user-mgnt/utils/userUtils'
import { QA_ENV } from '@user-mgnt/constants'
import * as Hapi from '@hapi/hapi'
import * as _ from 'lodash'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

export default async function updateUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const user = request.payload as IUser & { id: string }
  const token = request.headers.authorization
  const existingUser: IUserModel | null = await User.findOne({ _id: user.id })

  if (!existingUser) {
    throw new Error(`No user found by given id: ${user.id}`)
  }
  const existingPractitioner = await getFromFhir(
    token,
    `/Practitioner/${existingUser.practitionerId}`
  )
  const existingPractitionerRole = await getFromFhir(
    token,
    `/PractitionerRole?practitioner=${existingUser.practitionerId}`
  )
  // Update existing user's fields
  existingUser.name = user.name
  existingUser.identifiers = user.identifiers
  existingUser.email = user.email
  existingUser.mobile = user.mobile
  existingUser.signature = user.signature
  existingUser.localRegistrar = user.localRegistrar
  existingUser.device = user.device
  if (existingUser.role !== user.role) {
    existingUser.role = user.role
    // Updating user sope
    const userScopes: string[] =
      roleScopeMapping[existingUser.role || 'FIELD_AGENT']
    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !userScopes.includes('demo')
    ) {
      userScopes.push('demo')
    }
    existingUser.scope = userScopes
  }
  existingUser.type = user.type

  if (existingUser.role === 'FIELD_AGENT') {
    if (
      !existingUser.type ||
      !Object.values(FIELD_AGENT_TYPES).includes(existingUser.type)
    ) {
      return h.response('Type not supported for this user').code(403)
    }
  } else {
    if (existingUser.type) {
      return h.response('Type not supported for this user').code(403)
    }
  }

  if (existingUser.primaryOfficeId !== user.primaryOfficeId) {
    if (request.auth.credentials?.scope?.includes('natlsysadmin')) {
      existingUser.primaryOfficeId = user.primaryOfficeId
      user.catchmentAreaIds = await getCatchmentAreaIdsByPrimaryOfficeId(
        user.primaryOfficeId,
        token
      )
    } else {
      throw new Error('Location can be changed only by National System Admin')
    }
  }
  // Updating practitioner and practitioner role in hearth
  const practitioner = createFhirPractitioner(user, false)
  practitioner.id = existingPractitioner.id
  const practitionerId = await postFhir(token, practitioner)
  if (!practitionerId) {
    throw new Error(
      'Practitioner resource not updated correctly, practitioner ID not returned'
    )
  }
  const practitionerRole = createFhirPractitionerRole(
    user,
    existingUser.practitionerId,
    false
  )
  practitionerRole.id = existingPractitionerRole.id
  const practitionerRoleId = await postFhir(token, practitioner)
  if (!practitionerRoleId) {
    throw new Error(
      'PractitionerRole resource not updated correctly, practitionerRole ID not returned'
    )
  }
  // Updating user in user-mgnt db
  let userNameChanged = false
  try {
    const newUserName = await generateUsername(
      existingUser.name,
      existingUser.username
    )
    if (newUserName !== existingUser.username) {
      existingUser.username = newUserName
      userNameChanged = true
    }

    // update user in user-mgnt data store
    await User.update({ _id: existingUser._id }, existingUser)
  } catch (err) {
    logger.error(err)
    await rollbackUpdateUser(
      token,
      existingPractitioner,
      existingPractitionerRole.entry[0].resource
    )
    if (err.code === 11000) {
      return h.response().code(403)
    }
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  if (userNameChanged) {
    sendUpdateUsernameNotification(user.mobile, existingUser.username, {
      Authorization: request.headers.authorization
    })
  }
  const resUser = _.omit(existingUser, ['passwordHash', 'salt'])

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  try {
    await postUserActionToMetrics(
      'EDIT_USER',
      request.headers.authorization,
      remoteAddress,
      userAgent
    )
  } catch (err) {
    logger.error(err.message)
  }

  return h.response(resUser).code(201)
}
