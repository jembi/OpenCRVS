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

import { ActionType } from './ActionConfig'
import { z } from 'zod'
import { FieldValue } from './FieldValue'

const BaseActionInput = z.object({
  eventId: z.string(),
  transactionId: z.string(),
  data: z.record(z.string(), FieldValue)
})

const CreateActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.CREATE).default(ActionType.CREATE),
    createdAtLocation: z.string()
  })
)

export const RegisterActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.REGISTER).default(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

export const ValidateActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE).default(ActionType.VALIDATE)
  })
)

export const NotifyActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY).default(ActionType.NOTIFY),
    createdAtLocation: z.string()
  })
)

export const DraftActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.DRAFT).default(ActionType.DRAFT)
  })
)

export type DraftActionInput = z.infer<typeof DraftActionInput>

export const DeclareActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.DECLARE).default(ActionType.DECLARE)
  })
)

export type DeclareActionInput = z.infer<typeof DeclareActionInput>

const AssignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN).default(ActionType.ASSIGN),
    assignedTo: z.string()
  })
)
const UnassignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN).default(ActionType.UNASSIGN)
  })
)

/**
 * ActionInput types are used to validate the input data for the action.
 * In our use case, we use it directly with TRPC to validate the input data for the action.
 * using z.literal(ActionType.ACTION).default(ActionType.ACTION) makes them more convenient to use
 * without having to pass the type in the input data, when it's defined in the method.
 *
 * e.g. mutation.declare({createdAt: new Date()}) vs mutation.declare({createdAt: new Date(), type: 'DECLARE'})
 */
export const ActionInput = z.discriminatedUnion('type', [
  CreateActionInput,
  ValidateActionInput,
  DraftActionInput,
  RegisterActionInput,
  NotifyActionInput,
  DeclareActionInput,
  AssignActionInput,
  UnassignActionInput
])

export type ActionInput = z.infer<typeof ActionInput>
