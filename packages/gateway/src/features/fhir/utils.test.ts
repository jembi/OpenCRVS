import {
  selectOrCreateDocRefResource,
  selectOrCreateCollectorPersonResource
} from './utils'
import { mockFhirBundle } from '../../utils/testUtils'
import * as fetch from 'jest-fetch-mock'
import { ITemplatedBundle } from '../registration/fhir-builders'
import { clone } from 'lodash'

describe('Fhir util function testing', () => {
  describe('selectOrCreateDocRefResource()', () => {
    it('successfully creates a document entry even if section reference is wrong', () => {
      const mockFhirBundleCloned = clone(mockFhirBundle)
      // @ts-ignore
      mockFhirBundleCloned.entry[0].resource.section.push({
        title: 'Certificates',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-sections',
              code: 'certificates'
            }
          ],
          text: 'Certificates'
        },
        entry: [
          {
            reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b266ssw4'
          }
        ]
      })
      const documentRef = selectOrCreateDocRefResource(
        'certificates',
        'Certificates',
        mockFhirBundleCloned as ITemplatedBundle,
        { _index: { certificates: 0 } },
        'certificates'
      )
      expect(documentRef).toBeDefined()
    })
  })
  describe('selectOrCreateCollectorPersonResource()', () => {
    const mockFhirBundleCloned = clone(mockFhirBundle)
    it('returns a patientEntry', () => {
      const patientEntry = selectOrCreateCollectorPersonResource(
        mockFhirBundleCloned as ITemplatedBundle,
        { _index: { certificates: 0 } },
        'BIRTH'
      )
      expect(patientEntry).toBeDefined()
    })
    it('throws error if related person has an invalid patient reference', () => {
      // @ts-ignore
      mockFhirBundleCloned.entry[mockFhirBundle.entry.length - 1] = {}

      expect(() => {
        selectOrCreateCollectorPersonResource(
          mockFhirBundleCloned as ITemplatedBundle,
          { _index: { certificates: 0 } },
          'BIRTH'
        )
      }).toThrowError(
        'No related collector person entry not found on fhir bundle'
      )
    })
  })
})
