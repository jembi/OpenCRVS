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
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { USER_MANAGEMENT_URL } from '@webhooks/constants'
import {
  createRequestSignature,
  getPermissionsBundle
} from '@webhooks/features/event/service'
import { EventType, ISystem } from '@webhooks/features/manage/service'
import { logger } from '@opencrvs/commons'
import Webhook, { IWebhookModel, TRIGGERS } from '@webhooks/model/webhook'
import { getQueue } from '@webhooks/queue'
import { Queue } from 'bullmq'
import fetch from 'node-fetch'
import ShortUIDGen from 'short-uid'
import { RegisteredRecord } from '@opencrvs/commons/types'

export interface IAuthHeader {
  Authorization: string
  'x-correlation-id': string
}

export async function birthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as RegisteredRecord
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  let webhookQueue: Queue

  try {
    webhookQueue = getQueue()
  } catch (error) {
    logger.error(`Can't get webhook queue: ${error}`)
    return internal(error)
  }

  try {
    const webhooks: IWebhookModel[] | null = await Webhook.find()
    if (!webhooks) {
      throw internal('Failed to find webhooks')
    }
    logger.info(`Subscribed webhooks: ${JSON.stringify(webhooks)}`)
    if (webhooks) {
      for (const webhookToNotify of webhooks) {
        logger.info(
          `Queueing webhook ${webhookToNotify.trigger} ${
            TRIGGERS[TRIGGERS.BIRTH_REGISTERED]
          }`
        )
        const permissions = await fetchSystemPermissions(
          webhookToNotify,
          authHeader,
          EventType.Birth
        )

        let finalBundle: RegisteredRecord
        if (webhookToNotify.createdBy.type === 'webhook') {
          finalBundle = getPermissionsBundle(bundle, permissions)
        } else {
          finalBundle = bundle
        }
        if (webhookToNotify.trigger === TRIGGERS[TRIGGERS.BIRTH_REGISTERED]) {
          const payload = {
            timestamp: new Date().toISOString(),
            id: webhookToNotify.webhookId,
            event: {
              hub: {
                topic: TRIGGERS[TRIGGERS.BIRTH_REGISTERED]
              },
              context: [finalBundle]
            }
          }
          logger.info(
            `Dispatching BIRTH_REGISTERED webhook: ${JSON.stringify({
              timestamp: payload.timestamp,
              id: payload.id,
              event: { hub: { topic: payload.event.hub.topic } },
              context: ['<<redacted>>']
            })}`
          )
          const hmac = createRequestSignature(
            'sha256',
            webhookToNotify.sha_secret,
            JSON.stringify(payload)
          )
          webhookQueue.add(
            `${webhookToNotify.webhookId}_${
              TRIGGERS[TRIGGERS.BIRTH_REGISTERED]
            }`,
            {
              payload,
              url: webhookToNotify.address,
              hmac
            },
            {
              jobId: `WEBHOOK_${new ShortUIDGen().randomUUID().toUpperCase()}_${
                webhookToNotify.webhookId
              }`,
              attempts: 3
            }
          )
        }
      }
    } else {
      logger.info(`No webhooks subscribed to birth registration trigger`)
    }
  } catch (error) {
    logger.error(`Webhooks/birthRegisteredHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}

export async function deathRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as RegisteredRecord
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  let webhookQueue: Queue

  try {
    webhookQueue = getQueue()
  } catch (error) {
    logger.error(`Can't get webhook queue: ${error}`)
    return internal(error)
  }

  try {
    const webhooks: IWebhookModel[] | null = await Webhook.find()
    if (!webhooks) {
      throw internal('Failed to find webhooks')
    }
    logger.info(`Subscribed webhooks: ${JSON.stringify(webhooks)}`)
    if (webhooks) {
      for (const webhookToNotify of webhooks) {
        logger.info(
          `Queueing webhook ${webhookToNotify.trigger} ${
            TRIGGERS[TRIGGERS.DEATH_REGISTERED]
          }`
        )
        const permissions = await fetchSystemPermissions(
          webhookToNotify,
          authHeader,
          EventType.Death
        )

        let finalBundle: RegisteredRecord
        if (webhookToNotify.createdBy.type === 'webhook') {
          finalBundle = getPermissionsBundle(bundle, permissions)
        } else {
          finalBundle = bundle
        }
        if (webhookToNotify.trigger === TRIGGERS[TRIGGERS.DEATH_REGISTERED]) {
          const payload = {
            timestamp: new Date().toISOString(),
            id: webhookToNotify.webhookId,
            event: {
              hub: {
                topic: TRIGGERS[TRIGGERS.DEATH_REGISTERED]
              },
              context: [finalBundle]
            }
          }
          logger.info(
            `Dispatching DEATH_REGISTERED webhook: ${JSON.stringify({
              timestamp: payload.timestamp,
              id: payload.id,
              event: { hub: { topic: payload.event.hub.topic } },
              context: ['<<redacted>>']
            })}`
          )
          const hmac = createRequestSignature(
            'sha256',
            webhookToNotify.sha_secret,
            JSON.stringify(payload)
          )
          webhookQueue.add(
            `${webhookToNotify.webhookId}_${
              TRIGGERS[TRIGGERS.DEATH_REGISTERED]
            }`,
            {
              payload,
              url: webhookToNotify.address,
              hmac
            },
            {
              jobId: `WEBHOOK_${new ShortUIDGen().randomUUID().toUpperCase()}_${
                webhookToNotify.webhookId
              }`,
              attempts: 3
            }
          )
        }
      }
    } else {
      logger.info(`No webhooks subscribed to death registration trigger`)
    }
  } catch (error) {
    logger.error(`Webhooks/deathRegisteredHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}

export async function marriageRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response().code(200)
}

export async function approveRejectHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { eventType, statusType } = request.params
  const bundle = request.payload as { trackingId: string }

  const currentTrigger = `${eventType}/${statusType}`.toLowerCase()

  const webhookQueue = getQueue()

  const webhooks: IWebhookModel[] | null = await Webhook.find()
  if (!webhooks) {
    throw internal('Failed to find webhooks')
  }
  logger.info(`Subscribed webhooks: ${JSON.stringify(webhooks)}`)
  for (const webhookToNotify of webhooks) {
    logger.info(`Queueing webhook ${webhookToNotify.trigger} ${currentTrigger}`)
    if (webhookToNotify.trigger.toLowerCase() === currentTrigger) {
      const payload = {
        timestamp: new Date().toISOString(),
        id: webhookToNotify.webhookId,
        event: {
          hub: {
            topic: currentTrigger
          },
          context: {
            trackingId: bundle?.trackingId,
            status: statusType
          }
        }
      }
      logger.info(
        `Dispatching webhook: ${JSON.stringify({
          timestamp: payload.timestamp,
          id: payload.id,
          event: { hub: { topic: payload.event.hub.topic } },
          context: ['<<redacted>>']
        })}`
      )
      const hmac = createRequestSignature(
        'sha256',
        webhookToNotify.sha_secret,
        JSON.stringify(payload)
      )
      webhookQueue.add(
        `${webhookToNotify.webhookId}_${currentTrigger}`,
        {
          payload,
          url: webhookToNotify.address,
          hmac
        },
        {
          jobId: `WEBHOOK_${new ShortUIDGen().randomUUID().toUpperCase()}_${
            webhookToNotify.webhookId
          }`,
          attempts: 3
        }
      )
    }
  }

  return h.response().code(200)
}

const fetchSystemPermissions = async (
  { createdBy: { client_id, type } }: IWebhookModel,
  authHeader: IAuthHeader,
  event: EventType
) => {
  if (type !== 'webhook') return []
  try {
    const response = await fetch(`${USER_MANAGEMENT_URL}getSystem`, {
      method: 'POST',
      body: JSON.stringify({ clientId: client_id }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const fetchSystem: ISystem = await response.json()
    logger.info(` Fetching system integration : fetchSystem ${fetchSystem}`)

    return (
      fetchSystem.settings.webhook.find((x) => x.event === event)
        ?.permissions || []
    )
  } catch (error) {
    logger.error(`System integration is not exists : error ${error}`)
    throw new Error(error)
  }
}
