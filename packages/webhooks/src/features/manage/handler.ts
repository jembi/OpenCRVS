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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import {
  getTokenPayload,
  getSystem,
  ISystem,
  ITokenPayload,
  generateChallenge
} from '@webhooks/features/manage/service'
import { internal } from '@hapi/boom'
import Webhook from '@webhooks/model/webhook'
import { logger } from '@opencrvs/commons'
import { v4 as uuid } from 'uuid'
import fetch from 'node-fetch'
import { resolve } from 'url'

interface IHub {
  callback: string
  mode: string
  topic: string
  secret: string
}

interface ISubscribePayload {
  hub: IHub
}

export async function subscribeWebhooksHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { hub } = request.payload as ISubscribePayload
  // if (!(hub.topic in TRIGGERS)) {
  //   return h
  //     .response({
  //       hub: {
  //         mode: 'denied',
  //         topic: hub.topic,
  //         reason: `Unsupported topic: ${hub.topic}`
  //       }
  //     })
  //     .code(400)
  // }
  const token: ITokenPayload = getTokenPayload(
    request.headers.authorization.split(' ')[1]
  )
  const systemId = token.sub

  try {
    const system: ISystem = await getSystem(
      { systemId },
      request.headers.authorization
    )
    if (!system || system.status !== 'active') {
      return h
        .response({
          hub: {
            mode: 'denied',
            topic: hub.topic,
            reason:
              'Active system details cannot be found.  This system is no longer authorized'
          }
        })
        .code(400)
    }

    if (hub.secret !== system.sha_secret) {
      return h
        .response({
          hub: {
            mode: 'denied',
            topic: hub.topic,
            reason: 'hub.secret is incorrect'
          }
        })
        .code(400)
    }

    if (hub.mode !== 'subscribe') {
      return h
        .response({
          hub: {
            mode: 'denied',
            topic: hub.topic,
            reason: 'hub.mode must be set to subscribe'
          }
        })
        .code(400)
    }
    const webhookId = uuid()
    const createdBy = {
      client_id: system.client_id,
      name: system.name,
      type: getScopeType(system.scope),
      username: system.username
    }
    const webhook = {
      webhookId,
      createdBy,
      address: hub.callback,
      sha_secret: hub.secret,
      trigger: hub.topic
    }
    const challenge = generateChallenge()

    if (!(system.scope.indexOf('demo') > -1)) {
      try {
        const challengeCheck = await fetch(
          resolve(
            hub.callback,
            `?mode=subscribe&challenge=${encodeURIComponent(challenge)}&topic=${
              hub.topic
            }`
          ),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
          .then((response) => {
            return response.json()
          })
          .catch((error) => {
            return Promise.reject(
              new Error(` request failed: ${error.message}`)
            )
          })
        if (challenge !== challengeCheck.challenge) {
          throw new Error(
            `${challenge} is not equal to ${challengeCheck.challenge}.  Subscription endpoint check failed`
          )
        }
        await Webhook.create(webhook)
        return h.response().code(202)
      } catch (err) {
        logger.error(err)
        return h.response('Subscription callback check failed').code(400)
      }
    } else {
      try {
        await Webhook.create(webhook)
        return h.response().code(202)
      } catch (err) {
        throw new Error(`Cannot save webhook in development: ${err}`)
      }
    }
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

const getScopeType = (scopes: string[]) => {
  const isWebhookUser = scopes.includes('webhook')
  return isWebhookUser ? 'webhook' : 'health'
}
export const reqSubscribeWebhookSchema = Joi.object({
  hub: Joi.object({
    callback: Joi.string(),
    mode: Joi.string(),
    topic: Joi.string(),
    secret: Joi.string()
  })
})

export async function listWebhooksHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token: ITokenPayload = getTokenPayload(
    request.headers.authorization.split(' ')[1]
  )
  const systemId = token.sub
  try {
    const system: ISystem = await getSystem(
      { systemId },
      request.headers.authorization
    )
    if (!system || system.status !== 'active') {
      return h
        .response(
          'Active system details cannot be found.  This system is no longer authorized'
        )
        .code(400)
    }
    try {
      const entries = await Webhook.find({
        'createdBy.client_id': system.client_id
      }).sort({
        createdAt: 'asc'
      })

      const sortedEntries: any = []
      entries.forEach((item) => {
        const entry = {
          id: item.webhookId,
          callback: item.address,
          createdAt: new Date((item.createdAt as number) * 1000).toISOString(),
          createdBy: item.createdBy,
          topic: item.trigger
        }
        sortedEntries.push(entry)
      })
      return h.response({ entries: sortedEntries }).code(200)
    } catch (err) {
      logger.error(err)
      throw internal()
    }
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export async function deleteWebhookHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const webhookId = request.params.webhookId
  if (!webhookId) {
    return h.response('No webhook id in URL params').code(400)
  }
  try {
    await Webhook.findOneAndRemove({ webhookId })
  } catch (err) {
    return h.response(`Could not delete webhook: ${webhookId}`).code(400)
  }
  return h.response().code(204)
}

interface IDeleteWebhooksByClientIdPayload {
  clientId: string
}

export async function deleteWebhookByClientIdHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { clientId } = request.payload as IDeleteWebhooksByClientIdPayload
  if (!clientId) {
    return h.response('No clientId in URL params').code(400)
  }

  try {
    await Webhook.deleteMany({ 'createdBy.client_id': clientId })
  } catch (err) {
    logger.info(
      `Could not delete webhooks associated with client_id: ${clientId}`
    )
  }
  return h.response().code(204)
}
