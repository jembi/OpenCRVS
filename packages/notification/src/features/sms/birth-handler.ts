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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { sendNotification, ISMSPayload } from '@notification/features/sms/utils'
import { logger } from '@notification/logger'
import { messageKeys } from '@notification/i18n/messages'

export interface IInProgressPayload extends ISMSPayload {
  trackingId: string
  crvsOffice: string
}

export interface IDeclarationPayload extends ISMSPayload {
  trackingId: string
  name: string
}

export interface IRegistrationPayload extends ISMSPayload {
  name: string
  registrationNumber: string
  trackingId: string
}

export interface IRejectionPayload extends ISMSPayload {
  trackingId: string
  name: string
}

export async function sendBirthInProgressConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IInProgressPayload
  logger.info(
    `Notification service sendBirthInProgressConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthInProgressNotification
  await sendNotification(
    request,
    {
      sms: templateName
    },
    { sms: payload.msisdn },
    {
      trackingId: payload.trackingId,
      crvsOffice: payload.crvsOffice
    }
  )
  return h.response().code(200)
}

export async function sendBirthDeclarationConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendBirthDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthDeclarationNotification
  await sendNotification(
    request,
    { sms: templateName },
    { sms: payload.msisdn },
    {
      name: payload.name,
      trackingId: payload.trackingId
    }
  )
  return h.response().code(200)
}

export async function sendBirthRegistrationConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendBirthRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthRegistrationNotification
  await sendNotification(
    request,
    { sms: templateName },
    { sms: payload.msisdn },
    {
      name: payload.name,
      trackingId: payload.trackingId,
      registrationNumber: payload.registrationNumber
    }
  )
  return h.response().code(200)
}

export async function sendBirthRejectionConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRejectionPayload
  logger.info(
    `Notification service sendBirthRejectionConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )

  const templateName = messageKeys.birthRejectionNotification
  await sendNotification(
    request,
    { sms: templateName },
    { sms: payload.msisdn },
    {
      name: payload.name,
      trackingId: payload.trackingId
    }
  )
  return h.response().code(200)
}

export const inProgressNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  crvsOffice: Joi.string().required()
})

export const declarationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  name: Joi.string().required()
})

export const registrationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  name: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  registrationNumber: Joi.string().required()
})

export const rejectionNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  name: Joi.string().required()
})
