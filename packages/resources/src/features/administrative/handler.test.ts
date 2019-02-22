import { createServer } from '../..'
import * as locationsService from 'src/features/administrative/service/service'
import { ILocationDataResponse } from './service/service'

describe('administrative handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns locations json to client', () => {
    const mockReturn: ILocationDataResponse = {
      data: [
        {
          id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
          name: 'Barisal',
          nameBn: 'বরিশাল',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        }
      ]
    }
    it('returns a location array', async () => {
      jest
        .spyOn(locationsService, 'getLocations')
        .mockReturnValue(Promise.resolve(mockReturn))
      const res = await server.server.inject({
        method: 'GET',
        url: '/locations'
      })
      expect(JSON.parse(res.payload).data[0].id).toBe(
        'ba819b89-57ec-4d8b-8b91-e8865579a40f'
      )
    })
  })
})
