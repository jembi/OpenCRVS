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

const ActionBase = z.object({
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  data: z.record(z.string(), z.any())
})

const AssignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string()
  })
)

const UnassignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

const RegisterAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

const DeclareAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const DraftAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.DRAFT)
  })
)

const CreatedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE),
    createdAtLocation: z.string()
  })
)

const NotifiedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY),
    createdAtLocation: z.string()
  })
)

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ActionDocument = z.discriminatedUnion('type', [
  CreatedAction,
  DraftAction,
  ValidateAction,
  NotifiedAction,
  RegisterAction,
  DeclareAction,
  AssignedAction,
  UnassignedAction,
  CustomAction
])

export type ActionDocument = z.infer<typeof ActionDocument>
export type CreatedAction = z.infer<typeof CreatedAction>
