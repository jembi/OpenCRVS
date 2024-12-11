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

import { ActionInput } from '@opencrvs/commons/client'
import { create } from 'zustand'

type FormData = ActionInput['data']

type EventFormData = {
  formValues: FormData
  setFormValues: (data: FormData) => void
  clear: () => void
}

export const useEventFormData = create<EventFormData>((set) => ({
  formValues: {},
  setFormValues: (data: FormData) => set(() => ({ formValues: data })),
  clear: () => set(() => ({ formValues: {} }))
}))
