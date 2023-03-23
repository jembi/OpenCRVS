/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { resolvers } from '@gateway/features/formDraft/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('getFormDraft()', () => {
  let authHeaderSysAdmin: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderSysAdmin = {
      Authorization: `Bearer ${sysAdminToken}`
    }
  })
  const dummyDraftList = [
    {
      event: 'death',
      Comment: 'Published death question',
      version: 1,
      status: 'PUBLISHED',
      history: [
        {
          Comment: 'Added new death question',
          version: 1,
          status: 'DRAFT'
        }
      ]
    },
    {
      event: 'birth',
      Comment: 'Published birth question',
      version: 1,
      status: 'PUBLISHED',
      history: {
        Comment: 'Added new birth question',
        version: 1,
        status: 'DRAFT'
      }
    }
  ]
  it('should returns birth and death draft', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        totalItems: dummyDraftList.length,
        results: dummyDraftList
      })
    )

    const response = await resolvers.Query.getFormDraft(
      {},
      {},
      { headers: authHeaderSysAdmin }
    )

    expect(response.totalItems).toBe(2)
    expect(response.results).toEqual(dummyDraftList)
  })
})

describe('createFormDraft mutation', () => {
  let authHeaderSysAdmin: { Authorization: string }
  let authHeaderRegister: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderSysAdmin = {
      Authorization: `Bearer ${sysAdminToken}`
    }
    const regsiterToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegister = {
      Authorization: `Bearer ${regsiterToken}`
    }
  })

  const formDraft = {
    questions: [
      {
        fieldId: 'birth.myField',
        fieldName: 'Question 1',
        fieldType: 'TEXT'
      }
    ],
    event: 'birth',
    status: 'DRAFT'
  }

  it('creates birth form question draft for natlsysadmin', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        fieldId: 'birth.myField'
      }),
      { status: 201 }
    )

    const response = await resolvers.Mutation.createFormDraft(
      {},
      { formDraft },
      { headers: authHeaderSysAdmin }
    )

    expect(response).toEqual({
      fieldId: 'birth.myField'
    })
  })

  it('published birth form draft for natlsysadmin', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        status: 'PUBLISHED'
      }),
      { status: 201 }
    )
    const response = await resolvers.Mutation.createFormDraft(
      {},
      {
        formDraft: {
          event: 'birth',
          comment: 'Published birth form draft',
          status: 'PUBLISHED'
        }
      },
      { headers: authHeaderSysAdmin }
    )

    expect(response).toEqual({
      status: 'PUBLISHED'
    })
  })

  it('should throw error for register', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.createFormDraft({}, { formDraft }, authHeaderRegister)
    ).rejects.toThrowError(
      'Create or update form draft is only allowed for natlsysadmin'
    )
  })

  it('should throw error when /createFormDraft sends anything but 201', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.createFormDraft(
        {},
        { formDraft },
        { headers: authHeaderSysAdmin }
      )
    ).rejects.toThrowError(
      "Something went wrong on config service. Couldn't mofify form draft"
    )
  })
})

describe('modifyDraftStatus mutation', () => {
  let authHeaderSysAdmin: { Authorization: string }
  let authHeaderRegister: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderSysAdmin = {
      Authorization: `Bearer ${sysAdminToken}`
    }
    const regsiterToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegister = {
      Authorization: `Bearer ${regsiterToken}`
    }
  })

  const modifyPayload = {
    event: 'birth',
    status: 'IN_PREVIEW'
  }

  it('modify birth form draft status to IN_PREVIEW for natlsysadmin', async () => {
    fetch.mockResponseOnce(JSON.stringify(modifyPayload), { status: 201 })

    const response = await resolvers.Mutation.modifyDraftStatus(
      {},
      { formDraft: modifyPayload },
      { headers: authHeaderSysAdmin }
    )

    expect(response).toEqual({
      event: 'birth',
      status: 'IN_PREVIEW'
    })
  })

  it('should throw error for register', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

    expect(
      resolvers.Mutation.modifyDraftStatus(
        {},
        { formDraft: modifyPayload },
        authHeaderRegister
      )
    ).rejects.toThrowError(
      'Modifying form draft status is only allowed for natlsysadmin'
    )
  })

  it('should throw error when /formDraftStatus sends anything but 201', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

    expect(
      resolvers.Mutation.modifyDraftStatus(
        {},
        { formDraft: modifyPayload },
        { headers: authHeaderSysAdmin }
      )
    ).rejects.toThrowError(
      "Something went wrong on config service. Couldn't update form draft status"
    )
  })
})
