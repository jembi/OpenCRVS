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

/* eslint-disable */
import {
  DateField,
  IDateFieldProps as DateFieldProps
} from '@opencrvs/components/lib/DateField'
import * as React from 'react'

function DateInput({
  onChange,
  value,
  ...props
}: DateFieldProps & {
  onChange: (newValue: string) => void
  value?: string
}) {
  return <DateField {...props} value={value ?? ''} onChange={onChange} />
}

function DateOutput({ value }: { value?: string }) {
  return value ?? ''
}

export const Date = {
  Input: DateInput,
  Output: DateOutput
}
