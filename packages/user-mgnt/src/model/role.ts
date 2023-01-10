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
import { model, Schema, Document } from 'mongoose'

interface ISystemRole {
  value: string
  roles: Role[]
  active: boolean
  creationDate: number
}

type Role = {
  labels: Array<{
    lang: string
    label: string
  }>
}

export interface ISystemRoleModel extends ISystemRole, Document {}

const LabelSchema = new Schema(
  {
    lang: String,
    label: String
  },
  { _id: false }
)

const RoleSchema = new Schema(
  {
    labels: [LabelSchema]
  },
  { _id: false }
)

const systemRoleSchema = new Schema({
  value: String,
  roles: [RoleSchema],
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<ISystemRoleModel>('SystemRole', systemRoleSchema)
