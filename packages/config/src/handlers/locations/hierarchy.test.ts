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
import { resolveLocationParents } from './locationTreeSolver'
import * as fixtures from '@opencrvs/commons/fixtures'
import { UUID } from '@opencrvs/commons'
import { fetchFromHearth } from '@config/services/hearth'
import { SavedLocation } from '@opencrvs/commons/types'

jest.mock('@config/services/hearth', () => ({
  fetchFromHearth: jest.fn()
}))

const fetchFromHearthMock = fetchFromHearth as jest.Mock

const mockHearthLocations = (locations: SavedLocation[]) => {
  fetchFromHearthMock.mockImplementation((id: string) => {
    const location = locations.find((l) => `Location/${l.id}` === id)
    return Promise.resolve(location)
  })
}

describe('resolveLocationParents', () => {
  it('should return child location only if the location has no parent', async () => {
    const location = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })

    mockHearthLocations([location])

    const result = await resolveLocationParents(location.id)
    expect(result).toEqual([location])
  })

  it('should return child location only if the location parent is Location/0', async () => {
    const topLevel = '0' as UUID
    const location = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: {
        reference: `Location/${topLevel}`
      }
    })

    mockHearthLocations([location])

    const result = await resolveLocationParents(location.id)
    expect(result).toEqual([location])
  })

  it('should resolve a single level parent correctly', async () => {
    const parent = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })

    const child = fixtures.savedLocation({
      id: 'uuid2' as UUID,
      partOf: { reference: `Location/${parent.id}` }
    })

    mockHearthLocations([child, parent])

    const result = await resolveLocationParents(child.id)
    expect(result).toEqual([parent, child])
  })

  it('should resolve multiple levels of parents correctly', async () => {
    const grandparent = fixtures.savedLocation({
      id: 'uuid1' as UUID,
      partOf: undefined
    })
    const parent = fixtures.savedLocation({
      id: 'uuid2' as UUID,
      partOf: { reference: `Location/${grandparent.id}` }
    })
    const child = fixtures.savedLocation({
      id: 'uuid3' as UUID,
      partOf: { reference: `Location/${parent.id}` }
    })
    const locations = [grandparent, parent, child]

    mockHearthLocations(locations)

    const result = await resolveLocationParents(child.id)
    expect(result).toEqual(locations)
  })
})
