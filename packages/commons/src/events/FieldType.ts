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

export const FieldType = {
  ADDRESS: 'ADDRESS',
  TEXT: 'TEXT',
  DATE: 'DATE',
  PARAGRAPH: 'PARAGRAPH',
  PAGE_HEADER: 'PAGE_HEADER',
  RADIO_GROUP: 'RADIO_GROUP',
  FILE: 'FILE',
  HIDDEN: 'HIDDEN',
  BULLET_LIST: 'BULLET_LIST',
  CHECKBOX: 'CHECKBOX',
  SELECT: 'SELECT',
  COUNTRY: 'COUNTRY',
  LOCATION: 'LOCATION',
  DIVIDER: 'DIVIDER',
  ADMINISTRATIVE_AREA: 'ADMINISTRATIVE_AREA',
  FACILITY: 'FACILITY',
  OFFICE: 'OFFICE'
} as const

export const fieldTypes = Object.values(FieldType)
export type FieldType = (typeof fieldTypes)[number]
