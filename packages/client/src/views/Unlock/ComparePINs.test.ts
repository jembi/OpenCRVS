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
import { pinValidator } from '@client/views/Unlock/ComparePINs'
import { pinLoader } from '@client/views/Unlock/utils'
import * as bcrypt from 'bcryptjs'
import { vi } from 'vitest'

describe('Compare two PINs', () => {
  const pin = '1212'

  beforeEach(() => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(pin, salt)
    pinLoader.loadUserPin = vi.fn(async () => Promise.resolve(hash))
  })

  it('should return true when PINs match', async () => {
    const result = await pinValidator.isValidPin(pin)
    expect(result).toBe(true)
  })

  it('should return false when PINs do not match', async () => {
    const invalidPin = '2121'
    const result = await pinValidator.isValidPin(invalidPin)
    expect(result).toBe(false)
  })
})
