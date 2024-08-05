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
import {
  indexComposition,
  updateComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { mockCompositionBody } from '@search/test/utils'
import { logger } from '@opencrvs/commons'
import { BirthDocument } from '@search/elasticsearch/utils'
import { searchForBirthDuplicates } from '@search/features/registration/deduplicate/service'
import { client } from '@search/elasticsearch/client'

describe('elasticsearch db helper', () => {
  let indexSpy: jest.SpyInstance<any, any[]>
  let updateSpy: jest.SpyInstance<any, any[]>
  let searchSpy: jest.SpyInstance<any, any[]>

  describe('elasticsearch db helper', () => {
    beforeAll(() => {
      logger.error = jest.fn()
    })

    it('should index a composition with proper configuration', async () => {
      indexSpy = jest.spyOn(client, 'index')
      indexComposition('testId', mockCompositionBody, client)

      expect(indexSpy).toBeCalled()
      expect(indexSpy).toBeCalledWith(
        {
          body: mockCompositionBody,
          id: 'testId',
          index: 'ocrvs',
          refresh: 'wait_for'
        },
        { meta: true }
      )
    })

    it('should update a composition with proper configuration', async () => {
      const body: BirthDocument = {
        compositionId: '11111111-1111-1111-1111-111111111111',
        childFirstNames: 'testValue'
      }
      updateSpy = jest.spyOn(client, 'update')
      updateComposition('testId', body, client)
      expect(updateSpy).toBeCalled()
      expect(updateSpy).toBeCalledWith(
        {
          index: 'ocrvs',
          id: 'testId',
          body: {
            doc: body
          },
          refresh: 'wait_for'
        },
        { meta: true }
      )
    })

    it('should perform search for composition', async () => {
      searchSpy = jest.spyOn(client, 'search')
      await searchForBirthDuplicates(mockCompositionBody, client)
      if (
        searchSpy.mock &&
        searchSpy.mock.calls[0] &&
        searchSpy.mock.calls[0][0]
      ) {
        expect(searchSpy.mock.calls[0][0].query).toBeDefined()
      } else {
        throw new Error('Failed')
      }
      expect(searchSpy).toBeCalled()
    })

    it('should perform search by composition id', async () => {
      searchByCompositionId('r1324-sd6k2-12121-1212', client)
      expect(searchSpy.mock.calls[0][0].query).toBeDefined()
      expect(searchSpy).toBeCalled()
    })
  })
})
