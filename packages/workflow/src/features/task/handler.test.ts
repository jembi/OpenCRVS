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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
// eslint-disable-next-line import/no-relative-parent-imports
import { createServer } from '../../server'
import {
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock,
  testFhirTaskBundle,
  taskResourceMock,
  testDeathFhirTaskBundle
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

const archivedTaskBundle = cloneDeep(testFhirTaskBundle)

archivedTaskBundle.entry[0].resource.businessStatus.coding[0].code = 'ARCHIVED'

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      [taskResourceMock, { status: 200 }],
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }]
    )
  })
  it('updateTaskHandler returns OK for a correctly authenticated user for birth', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { resourceType: 'Task' }
            }
          ]
        })
      ],
      [JSON.stringify('')]
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: testFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('updateTaskHandler returns OK for a correctly authenticated user for death', async () => {
    fetch.mockResponse(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { resourceType: 'Task' }
          }
        ]
      })
    )

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: testDeathFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('updateTaskHandler returns OK for an archived task for birth', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { resourceType: 'Task' }
            }
          ]
        })
      ],
      [JSON.stringify('')]
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: archivedTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('updateTaskHandler returns OK for an archived task for death', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { resourceType: 'Task' }
            }
          ]
        })
      ],
      [JSON.stringify('')]
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const taskBundle = cloneDeep(archivedTaskBundle)

    taskBundle.entry[0].resource.code.coding[0].code = 'DEATH'

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('updateTaskHandler throws error if invalid fhir data is provided', async () => {
    fetch.mockResponse(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { resourceType: 'Task' }
          }
        ]
      })
    )

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: { data: 'INVALID' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
  it('updateTaskHandler throws error if fhir returns an error', async () => {
    fetch.mockImplementation(() => new Error('boom'))

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: archivedTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
  it('updateTaskHandler returns OK for REINSTATED a task for birth', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { resourceType: 'Task' }
            }
          ]
        })
      ],
      [JSON.stringify('')]
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const taskBundle = cloneDeep(testFhirTaskBundle)

    taskBundle.entry[0].resource.businessStatus.coding[0].code =
      'WAITING_FOR_VERIFICATION'

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('updateTaskHandler returns OK for REINSTATED a task for death', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { resourceType: 'Task' }
            }
          ]
        })
      ],
      [JSON.stringify('')]
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const taskBundle = cloneDeep(testFhirTaskBundle)

    taskBundle.entry[0].resource.businessStatus.coding[0].code =
      'WAITING_FOR_VERIFICATION'
    taskBundle.entry[0].resource.code.coding[0].code = 'DEATH'

    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})
