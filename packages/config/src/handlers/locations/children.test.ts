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
import { UUID } from '@opencrvs/commons'
import * as fixtures from '@opencrvs/commons/fixtures'
import { resolveChildren } from './children'
import { fetchFromHearth } from '@config/services/hearth'
import { resolveLocationChildren } from './locationTreeSolver'

jest.mock('@config/services/hearth', () => ({
  fetchFromHearth: jest.fn()
}))

jest.mock('./locationTreeSolver', () => ({
  resolveLocationChildren: jest.fn()
}))

const fetchFromHearthMock = fetchFromHearth as jest.Mock
const resolveLocationChildrenMock = resolveLocationChildren as jest.Mock

// Cast handler to make it callable
const handler = resolveChildren as unknown as (req: Request) => Promise<any>

describe('resolveChildren', () => {
  describe('given a location of type office', () => {
    test('does not fetch location hierarchy', async () => {
      const office = fixtures.savedLocation({
        id: 'uuid1' as UUID,
        type: { coding: [{ code: 'CRVS_OFFICE' }] }
      })

      fetchFromHearthMock.mockResolvedValue(office)

      const req = { params: { locationId: office.id } } as any

      const res = await handler(req)

      expect(resolveLocationChildrenMock).not.toHaveBeenCalled()
      expect(res).toEqual([office])
    })
  })

  describe('given a location with children', () => {
    test('should return location and children', async () => {
      const parent = fixtures.savedLocation({
        id: 'uuid1' as UUID,
        type: { coding: [{ code: 'ADMIN_STRUCTURE' }] }
      })

      fetchFromHearthMock.mockResolvedValue(parent)

      const child1 = fixtures.savedLocation({ id: 'uuid2' as UUID })
      const child2 = fixtures.savedLocation({ id: 'uuid3' as UUID })

      resolveLocationChildrenMock.mockResolvedValue([child1, child2])

      const req = { params: { locationId: parent.id } } as any

      const res = await handler(req)

      expect(res).toEqual([parent, child1, child2])
    })
  })
})
