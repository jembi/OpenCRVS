import { generateBirthRegistrationNumber } from './index'
import { testFhirBundle } from 'src/test/utils'
import * as fetch from 'jest-fetch-mock'

describe('Verify generateBirthRegistrationNumber', () => {
  const practitioner = {
    resourceType: 'Practitioner',
    identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
    telecom: [{ system: 'phone', value: '01711111111' }],
    name: [
      { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
      { use: 'bn', family: '', given: [''] }
    ],
    gender: 'male',
    meta: {
      lastUpdated: '2018-11-25T17:31:08.062+00:00',
      versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
    },
    id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
  }
  it('Generate BD BRN properly', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
              resource: {
                resourceType: 'PractitionerRole',
                practitioner: {
                  reference: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                },
                code: [
                  {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/roles',
                        code: 'FIELD_AGENT'
                      }
                    ]
                  }
                ],
                location: [
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                  }
                ],
                meta: {
                  lastUpdated: '2018-11-25T17:31:08.096+00:00',
                  versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                },
                id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
              }
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ]
        }),
        { status: 200 }
      ]
    )
    const brn = await generateBirthRegistrationNumber(
      testFhirBundle.entry[1].resource,
      practitioner
    )
    expect(brn).toBeDefined()
    expect(brn).toMatch(
      new RegExp(`^${new Date().getFullYear()}10342112345678`)
    )
  })
  it('Throws error for default BRN generator', async () => {
    expect(
      generateBirthRegistrationNumber(testFhirBundle, practitioner, 'default')
    ).rejects.toThrowError('Default BRN generator has not been impleted yet')
  })
})
