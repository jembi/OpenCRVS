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
import { MongoMemoryServer } from 'mongodb-memory-server'

import { UUID } from '@opencrvs/commons'
import * as fixtures from '@opencrvs/commons/fixtures'
import { Location, SavedLocation } from '@opencrvs/commons/types'
import { Collection, MongoClient } from 'mongodb'

let client: MongoClient
let mongoServer: MongoMemoryServer
let collection: Collection<Location>
let OLD_ENV: NodeJS.ProcessEnv

const parent = fixtures.savedLocation({
  id: 'uuid1' as UUID,
  partOf: undefined
})
const child = fixtures.savedLocation({
  id: 'uuid2' as UUID,
  partOf: { reference: parent.id as `Location/${UUID}` }
})
const grandchild = fixtures.savedLocation({
  id: 'uuid3' as UUID,
  partOf: { reference: child.id as `Location/${UUID}` }
})

const lateLoadModule = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { resolveLocationChildren } = require('./locationTreeSolver')
  return resolveLocationChildren
}

describe('resolveChildren', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: { checkMD5: false }
    })
    const uri = mongoServer.getUri()
    OLD_ENV = process.env
    process.env.HEARTH_MONGO_URL = mongoServer.getUri()

    client = new MongoClient(uri)
    const connectedClient = await client.connect()

    const db = connectedClient.db()
    collection = db.collection<Location>('Location_view_with_plain_ids')
  }, 60000 /* Timeout to allow mongo binary download*/)

  afterAll(async () => {
    process.env = OLD_ENV
    if (client) {
      await client.close()
    }
    if (mongoServer) {
      await mongoServer.stop()
    }
  })

  beforeEach(async () => {
    await collection.deleteMany({})
  })

  describe('given a location with no children', () => {
    test('should return empty array', async () => {
      // late import to allow env vars to be set before the module is loaded
      const resolveLocationChildren = await lateLoadModule()

      await collection.insertMany([grandchild])

      const children = (await resolveLocationChildren(
        'uuid1' as UUID
      )) as SavedLocation[]

      expect(children).toHaveLength(0)
    })
  })

  describe('given a location with children', () => {
    test('should return all descendants', async () => {
      // late import to allow env vars to be set before the module is loaded
      const resolveLocationChildren = await lateLoadModule()

      await collection.insertMany([parent, child, grandchild])

      const children = (await resolveLocationChildren(
        'uuid1' as UUID
      )) as SavedLocation[]

      expect(children).toHaveLength(2)
      expect(children).toEqual(expect.arrayContaining([child, grandchild]))
    })
  })
})
