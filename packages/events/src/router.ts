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

import {
  DeclareActionInput,
  EventInput,
  NotifyActionInput
} from '@opencrvs/commons'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { z } from 'zod'

import {
  addAction,
  createEvent,
  EventInputWithId,
  getEventById,
  patchEvent
} from './service/events'

const ContextSchema = z.object({
  user: z.object({
    id: z.string()
  })
})

type Context = z.infer<typeof ContextSchema>

export const t = initTRPC.context<Context>().create({
  transformer: superjson
})

const router = t.router
const publicProcedure = t.procedure

/**
 * @public
 */
export type AppRouter = typeof appRouter

export const appRouter = router({
  event: router({
    create: publicProcedure
      .input(
        z.object({
          transactionId: z.string(),
          event: EventInput
        })
      )
      .mutation(async (options) => {
        return createEvent(
          options.input.event,
          options.ctx.user.id,
          options.input.transactionId
        )
      }),
    patch: publicProcedure.input(EventInputWithId).mutation(async (options) => {
      return patchEvent(options.input)
    }),
    get: publicProcedure.input(z.string()).query(async ({ input }) => {
      return getEventById(input)
    }),
    actions: router({
      notify: publicProcedure
        .input(
          z.object({
            eventId: z.string(),
            transactionId: z.string(),
            action: NotifyActionInput
          })
        )
        .mutation(async (options) => {
          return addAction(options.input.eventId, {
            ...options.input.action,
            type: 'NOTIFY',
            createdBy: options.ctx.user.id
          })
        }),
      declare: publicProcedure
        .input(
          z.object({
            eventId: z.string(),
            transactionId: z.string(),
            action: DeclareActionInput
          })
        )
        .mutation(async (options) => {
          return addAction(options.input.eventId, {
            ...options.input.action,
            type: 'DECLARE',
            createdBy: options.ctx.user.id
          })
        })
    })
  })
})
