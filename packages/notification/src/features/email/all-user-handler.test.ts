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
import { createServer } from '@notification/server'
import { SCOPES } from '@opencrvs/commons/authentication'
import * as mockingoose from 'mockingoose'
import NotificationQueue from '@notification/model/notificationQueue'
import * as utils from '@notification/features/utils'

describe('Email all users handler', () => {
  let server: any

  const validPayload = {
    subject: 'email all users',
    body: 'this is an email sent to all active users',
    bcc: ['user1@test.com', 'user2@test.com'],
    locale: 'en',
    requestId: '123-abcd-456'
  }

  const mockUserResponse = {
    emailForNotification: 'admin@test.com'
  }

  const mockNotificationRecord = {
    ...validPayload,
    status: 'success'
  }

  beforeEach(async () => {
    server = await createServer()

    jest.spyOn(utils, 'getUserDetails').mockResolvedValueOnce(mockUserResponse)
    mockingoose(NotificationQueue).toReturn(mockNotificationRecord, 'create')
  })

  const generateToken = () => {
    return jwt.sign(
      { scope: [SCOPES.CONFIG_UPDATE_ALL] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )
  }

  describe('POST /allUsersEmail', () => {
    it('successfully sends email to all users', async () => {
      // Arrange
      const token = generateToken()

      // Act
      const response = await server.server.inject({
        method: 'POST',
        url: '/allUsersEmail',
        payload: validPayload,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({ success: true })
    })

    it('fails when invalid payload is provided', async () => {
      // Arrange
      const token = generateToken()
      const invalidPayload = { ...validPayload, subject: '' }

      // Act
      const response = await server.server.inject({
        method: 'POST',
        url: '/allUsersEmail',
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    it('fails when unauthorized', async () => {
      // Act
      const response = await server.server.inject({
        method: 'POST',
        url: '/allUsersEmail',
        payload: validPayload,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })
  })
})
