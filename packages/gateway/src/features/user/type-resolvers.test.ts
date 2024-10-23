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
  IUserModelData,
  userTypeResolvers as typeResolvers
} from '@gateway/features/user/type-resolvers'

import LocationsAPI from '@gateway/features/fhir/locationsAPI'
import { TestResolvers } from '@gateway/utils/testUtils'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock

const userTypeResolvers = typeResolvers as unknown as TestResolvers

const mockGet = jest.fn()
jest.mock('apollo-datasource-rest', () => {
  class MockRESTDataSource {
    get = mockGet
  }
  return {
    RESTDataSource: MockRESTDataSource
  }
})

beforeEach(() => {
  fetch.resetMocks()
})

describe('User type resolvers', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  const mockResponse: IUserModelData = {
    _id: 'ba7022f0ff4822',
    name: [
      {
        use: 'en',
        given: ['Tamim'],
        family: 'Iqbal'
      }
    ],
    username: 'tamim.iqlbal',
    mobile: '+8801711111111',
    email: 'test@test.org',
    systemRole: 'REGISTRATION_AGENT',
    scope: ['certify'],
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: '1559054406433',
    role: {
      labels: [
        {
          lang: 'en',
          label: 'MAYOR'
        }
      ]
    },
    device: ''
  }
  it('return id type', () => {
    const res = userTypeResolvers.User!.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return userMgntUserID type', () => {
    const res = userTypeResolvers.User!.userMgntUserID(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return suspicious user flag', () => {
    const underInvestigationUserMockResponse = mockResponse
    underInvestigationUserMockResponse.status = 'deactivated'
    underInvestigationUserMockResponse.auditHistory = [
      {
        auditedBy: 'DUMMY_AUDITOR_ID',
        auditedOn: 1234897987,
        action: 'DEACTIVATE',
        reason: 'SUSPICIOUS'
      }
    ]
    const res = userTypeResolvers.User!.underInvestigation(mockResponse)
    expect(res).toBeTruthy()
  })
  it('return primaryOffice type', async () => {
    const mockOffice = {
      resourceType: 'Location',
      name: 'Moktarpur Union Parishad',
      alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
      status: 'active',
      partOf: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      },
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/location-type',
            code: 'CRVS_OFFICE'
          }
        ]
      },
      physicalType: {
        coding: [
          {
            code: 'bu',
            display: 'Building'
          }
        ]
      },
      address: {
        line: ['Moktarpur', 'Kaliganj'],
        district: 'Gazipur',
        state: 'Dhaka'
      },
      id: '79776844-b606-40e9-8358-7d82147f702a'
    }
    mockGet.mockResolvedValueOnce(mockOffice)
    const locationsAPI = new LocationsAPI()
    locationsAPI.context = {
      record: null
    }
    const res = await userTypeResolvers.User.primaryOffice(
      mockResponse,
      undefined,
      {
        dataSources: {
          locationsAPI: {
            getLocation: () => mockOffice
          }
        }
      }
    )
    expect(res).toEqual(mockOffice)
  })
  it('return user signature as registration agent', async () => {
    const roleBundle = {
      resourceType: 'Bundle',
      id: 'e9b83485-0418-47a0-b62b-c9d80a89691b',
      total: 1,
      entry: [
        {
          resource: {
            resourceType: 'PractitionerRole',
            practitioner: {
              reference: 'Practitioner/dd78cad3-26dc-469a-bddb-0b45ae489491'
            },
            code: [
              {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/roles',
                    code: 'LOCAL_REGISTRAR'
                  }
                ]
              }
            ],
            location: [
              {
                reference: 'Location/54538456-fcf6-4276-86ac-122a7eb47703'
              },
              {
                reference: 'Location/319b0d8f-e330-45b8-8bd5-863a234d4cc5'
              }
            ],
            id: '7c246f38-90c7-4f80-8266-f884c6e7b491'
          }
        }
      ]
    }
    const practitioner = {
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: {
            contentType: 'img/png',
            url: '/ocrvs/a1-b2-c3.png',
            creation: '1721970080786'
          }
        }
      ],
      id: 'dd78cad3-26dc-469a-bddb-0b45ae489491'
    }
    const presignedURL =
      'http://minio.farajaland-dev.opencrvs.org/ocrvs/cbf7c3cd-1b59-40b0-b8f9-2cd1310fe85b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20240726%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20240726T094242Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=2eb6a0cdfb9d25f347771b3f10cba442946d09de035f3294d8edec49e09ec1a6'

    fetch.mockResponses(
      [JSON.stringify(roleBundle), { status: 200 }],
      [JSON.stringify({ presignedURL }), { status: 200 }],
      [JSON.stringify(practitioner), { status: 200 }]
    )

    const response = await userTypeResolvers.User!.localRegistrar(
      mockResponse,
      undefined,
      {
        headers: undefined,
        dataSources: {
          fhirAPI: {
            getPractitioner: () => practitioner
          }
        }
      }
    )

    expect(response).toEqual({
      role: 'LOCAL_REGISTRAR',
      name: undefined,
      signature: presignedURL
    })
  })

  it('return user signature as registrar', async () => {
    const presignedURL =
      'http://minio.farajaland-dev.opencrvs.org/ocrvs/cbf7c3cd-1b59-40b0-b8f9-2cd1310fe85b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20240726%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20240726T094242Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=2eb6a0cdfb9d25f347771b3f10cba442946d09de035f3294d8edec49e09ec1a6'

    const practitioner = {
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: {
            contentType: 'img/png',
            url: '/ocrvs/a1-b2-c3.png',
            creation: '1721970080786'
          }
        }
      ],
      id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de'
    }
    fetch.mockResponses(
      [JSON.stringify({ presignedURL }), { status: 200 }],
      [JSON.stringify(practitioner), { status: 200 }]
    )

    const userResponse = mockResponse
    userResponse.scope!.push('register')

    const response = await userTypeResolvers.User!.localRegistrar(
      userResponse,
      undefined,
      {
        headers: undefined,
        dataSources: {
          fhirAPI: {
            getPractitioner: () => practitioner
          }
        }
      }
    )

    expect(response).toEqual({
      role: 'REGISTRATION_AGENT',
      signature: presignedURL
    })
  })
})
