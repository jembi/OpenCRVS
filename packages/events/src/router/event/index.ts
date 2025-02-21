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

import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getEventWithOnlyUserSpecificDrafts } from '@events/drafts'
import { getEventConfigurations } from '@events/service/config/config'
import {
  addAction,
  createEvent,
  deleteEvent,
  getEventById
} from '@events/service/events/events'
import { presignFilesInEvent } from '@events/service/files'
import { getIndex, getIndexedEvents } from '@events/service/indexing/indexing'
import {
  EventConfig,
  getUUID,
  ApproveCorrectionActionInput,
  RejectCorrectionActionInput,
  RequestCorrectionActionInput,
  SCOPES,
  logger
} from '@opencrvs/commons'
import {
  ActionType,
  PrintCertificateActionInput,
  DeclareActionInput,
  EventIndex,
  EventInput,
  NotifyActionInput,
  RegisterActionInput,
  ValidateActionInput,
  FieldValue,
  EventSearchIndex
} from '@opencrvs/commons/events'
import { router, publicProcedure } from '@events/router/trpc'
import { approveCorrection } from '@events/service/events/actions/approve-correction'
import { rejectCorrection } from '@events/service/events/actions/reject-correction'
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'

function validateEventType({
  eventTypes,
  eventInputType
}: {
  eventTypes: string[]
  eventInputType: string
}) {
  if (!eventTypes.includes(eventInputType)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid event type ${eventInputType}. Valid event types are: ${eventTypes.join(
        ', '
      )}`
    })
  }
}

const RECORD_READ_SCOPES = [
  SCOPES.RECORD_DECLARE,
  SCOPES.RECORD_READ,
  SCOPES.RECORD_SUBMIT_INCOMPLETE,
  SCOPES.RECORD_SUBMIT_FOR_REVIEW,
  SCOPES.RECORD_REGISTER,
  SCOPES.RECORD_EXPORT_RECORDS
]

export const eventRouter = router({
  config: router({
    get: publicProcedure
      .use(
        requiresAnyOfScopes([
          ...RECORD_READ_SCOPES,
          SCOPES.CONFIG,
          SCOPES.CONFIG_UPDATE_ALL
        ])
      )
      .output(z.array(EventConfig))
      .query(async (options) => {
        return getEventConfigurations(options.ctx.token)
      })
  }),
  create: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_DECLARE]))
    .input(EventInput)
    .mutation(async (options) => {
      const config = await getEventConfigurations(options.ctx.token)
      const eventIds = config.map((c) => c.id)

      validateEventType({
        eventTypes: eventIds,
        eventInputType: options.input.type
      })

      return createEvent({
        eventInput: options.input,
        createdBy: options.ctx.user.id,
        createdAtLocation: options.ctx.user.primaryOfficeId,
        transactionId: options.input.transactionId
      })
    }),
  get: publicProcedure
    .use(requiresAnyOfScopes(RECORD_READ_SCOPES))
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const event = await getEventById(input)
      const eventWithSignedFiles = await presignFilesInEvent(event, ctx.token)

      return getEventWithOnlyUserSpecificDrafts(
        eventWithSignedFiles,
        ctx.user.id
      )
    }),
  delete: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_DECLARE]))
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return deleteEvent(input.eventId, { token: ctx.token })
    }),
  actions: router({
    notify: publicProcedure
      .use(requiresAnyOfScopes([SCOPES.RECORD_SUBMIT_INCOMPLETE]))
      .input(NotifyActionInput)
      .use(middleware.validateAction(ActionType.NOTIFY))
      .mutation(async (options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id,
          createdAtLocation: options.ctx.user.primaryOfficeId,
          token: options.ctx.token,
          transactionId: options.input.transactionId
        })
      }),
    declare: publicProcedure
      .use(requiresAnyOfScopes([SCOPES.RECORD_DECLARE]))
      .input(DeclareActionInput)
      .use(middleware.validateAction(ActionType.DECLARE))
      .mutation(async (options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id,
          createdAtLocation: options.ctx.user.primaryOfficeId,
          token: options.ctx.token,
          transactionId: options.input.transactionId
        })
      }),
    validate: publicProcedure
      .use(requiresAnyOfScopes([SCOPES.RECORD_SUBMIT_FOR_APPROVAL]))
      .input(ValidateActionInput)
      .use(middleware.validateAction(ActionType.VALIDATE))
      .mutation(async (options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id,
          createdAtLocation: options.ctx.user.primaryOfficeId,
          token: options.ctx.token,
          transactionId: options.input.transactionId
        })
      }),
    register: publicProcedure
      .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
      // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
      .input(RegisterActionInput.omit({ identifiers: true }))
      // @ts-expect-error
      .use(middleware.validateAction(ActionType.REGISTER))
      .mutation(async (options) => {
        return addAction(
          {
            ...options.input,
            identifiers: {
              trackingId: getUUID(),
              registrationNumber: getUUID()
            }
          },
          {
            eventId: options.input.eventId,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token,
            transactionId: options.input.transactionId
          }
        )
      }),
    printCertificate: publicProcedure
      .use(requiresAnyOfScopes([SCOPES.RECORD_DECLARATION_PRINT]))
      .input(PrintCertificateActionInput)
      .use(middleware.validateAction(ActionType.PRINT_CERTIFICATE))
      .mutation(async (options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id,
          createdAtLocation: options.ctx.user.primaryOfficeId,
          token: options.ctx.token,
          transactionId: options.input.transactionId
        })
      }),
    correction: router({
      request: publicProcedure
        .use(
          requiresAnyOfScopes([SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION])
        )
        .input(RequestCorrectionActionInput)
        .use(middleware.validateAction(ActionType.REQUEST_CORRECTION))
        .mutation(async (options) => {
          return addAction(options.input, {
            eventId: options.input.eventId,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token,
            transactionId: options.input.transactionId
          })
        }),
      approve: publicProcedure
        .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTRATION_CORRECT]))
        .input(ApproveCorrectionActionInput)
        .use(middleware.validateAction(ActionType.APPROVE_CORRECTION))
        .mutation(async (options) => {
          return approveCorrection(options.input, {
            eventId: options.input.eventId,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token,
            transactionId: options.input.transactionId
          })
        }),
      reject: publicProcedure
        .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTRATION_CORRECT]))
        .input(RejectCorrectionActionInput)
        .mutation(async (options) => {
          return rejectCorrection(options.input, {
            eventId: options.input.eventId,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token,
            transactionId: options.input.transactionId
          })
        })
    })
  }),
  list: publicProcedure
    .use(requiresAnyOfScopes(RECORD_READ_SCOPES))
    .output(z.array(EventIndex))
    .query(getIndexedEvents),
  registration: router({
    confirm: publicProcedure
      .input(
        z.object({
          eventId: z.string(),
          data: z.record(z.string(), FieldValue)
        })
      )
      .mutation(async ({ input, ctx }) => {
        logger.info('Registration confirmed', { eventId: input.eventId })
        logger.info(input.data)
        return getEventById(input.eventId)
      })
  }),
  search: publicProcedure
    .input(EventSearchIndex)
    .query(async ({ input, ctx }) => {
      return getIndex(input)
    })
})
