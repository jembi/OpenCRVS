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
  getValueWithPercentageString,
  getLocationFromPartOfLocationId
} from './utils'
import { mockOfflineData } from '@client/tests/util'

describe('reports utils tests', () => {
  describe('getValueWithPercentage tests', () => {
    it('returns value with percentage string', () => {
      const total = 8
      const value = 3
      const expectedResult = '3 (37%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })

    it('handles the case when total equals 0', () => {
      const total = 0
      const value = 0
      const expectedResult = '0 (0%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })
  })
  describe('getLocationFromPartOfLocationId tests', () => {
    it('returns location name for a valid location', () => {
      const offlineCountryConfiguration = mockOfflineData
      const locationId = 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineCountryConfiguration)
      ).toEqual({
        id: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
        name: 'Barisal',
        alias: 'বরিশাল',
        physicalType: 'Jurisdiction',
        statisticalId: '123',
        jurisdictionType: 'DIVISION',
        type: 'ADMIN_STRUCTURE',
        status: 'active',
        partOf: 'Location/0'
      })
    })
    it('returns office name for a valid office', () => {
      const offlineCountryConfiguration = mockOfflineData
      const locationId = 'Location/0d8474da-0361-4d32-979e-af91f012340a'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineCountryConfiguration)
      ).toEqual({
        id: '0d8474da-0361-4d32-979e-af91f012340a',
        name: 'Moktarpur Union Parishad',
        alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
        physicalType: 'Building',
        statisticalId: '123',
        type: 'CRVS_OFFICE',
        status: 'active',
        partOf: 'Location/7a18cb4c-38f3-449f-b3dc-508473d485f3'
      })
    })
    it('returns empty string for an invalid office/location', () => {
      const offlineCountryConfiguration = mockOfflineData
      const locationId = 'Location/0'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineCountryConfiguration)
      ).toEqual({ name: '' })
    })
  })
})
