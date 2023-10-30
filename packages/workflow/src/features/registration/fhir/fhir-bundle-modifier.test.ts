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
  setTrackingId,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes,
  validateDeceasedDetails
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  OPENCRVS_SPECIFICATION_URL,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import {
  testFhirBundle,
  testDeathFhirBundle,
  testMarriageFhirBundle,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock,
  mosipSuccessMock,
  mosipConfigMock,
  mosipDeceasedPatientMock,
  mosipBirthPatientBundleMock,
  mosipUpdatedDeceasedPatientMock
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify fhir bundle modifier functions', () => {
  describe('setTrackingId', () => {
    it('Successfully modified the provided fhirBundle with birth trackingid', async () => {
      fetch.mockResponses(['B123456'])
      const fhirBundle = await setTrackingId(testFhirBundle, '1234')
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        const task = fhirBundle.entry[1].resource as fhir.Task
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^B/)
          expect(composition.identifier.value.length).toBe(7)
          if (task && task.identifier && task.identifier[1]) {
            expect(task.identifier[1]).toEqual({
              system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
              value: composition.identifier.value
            })
          }
        }
      }
    })

    it('Successfully modified the provided fhirBundle with death trackingid', async () => {
      fetch.mockResponses(['D123456'])
      const fhirBundle = await setTrackingId(testDeathFhirBundle, '1234')
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[10].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        const task = fhirBundle.entry[10].resource as fhir.Task
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^D/)
          expect(composition.identifier.value.length).toBe(7)
          if (task && task.identifier && task.identifier[0]) {
            expect(task.identifier[0]).toEqual({
              system: `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id`,
              value: composition.identifier.value
            })
          }
        }
      }
    })

    it('Successfully modified the provided fhirBundle with marriage trackingid', async () => {
      fetch.mockResponses(['M123456'])
      const fhirBundle = await setTrackingId(testMarriageFhirBundle, '1234')
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[1].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        const task = fhirBundle.entry[1].resource as fhir.Task
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^M/)
          expect(composition.identifier.value.length).toBe(7)
          if (task && task.identifier && task.identifier[0]) {
            expect(task.identifier[1]).toEqual({
              system: `${OPENCRVS_SPECIFICATION_URL}id/marriage-tracking-id`,
              value: composition.identifier.value
            })
          }
        }
      }
    })

    it('Throws error if invalid fhir bundle is provided', async () => {
      const invalidData = { ...testFhirBundle, entry: [] }
      await expect(setTrackingId(invalidData, '1234')).rejects.toThrowError(
        'Invalid FHIR bundle found'
      )
    })

    it('Will push the composite resource identifier if it is missing on fhirDoc', async () => {
      fetch.mockResponses(['B123456'])
      const fhirBundle = await setTrackingId(
        {
          ...testFhirBundle,
          entry: [
            {
              resource: {
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/types',
                      code: 'BIRTH'
                    }
                  ]
                }
              }
            }
          ]
        },
        '1234'
      )

      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^B/)
          expect(composition.identifier.value.length).toBe(7)
        }
      }
    })
  })
  describe('SetupRegistrationType', () => {
    it('Will push the proper event type on fhirDoc', () => {
      const taskResource = setupRegistrationType(
        testFhirBundle.entry[1].resource as fhir.Task,
        EVENT_TYPE.BIRTH
      )
      if (
        taskResource &&
        taskResource.code &&
        taskResource.code.coding &&
        taskResource.code.coding[0] &&
        taskResource.code.coding[0].code
      ) {
        expect(taskResource.code.coding[0].code).toBeDefined()
        expect(taskResource.code.coding[0].code).toEqual(
          EVENT_TYPE.BIRTH.toString()
        )
      }
    })

    it('Will push code section with proper event type on fhirDoc if it is missing', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.code = undefined
      const taskResource = setupRegistrationType(
        fhirBundle.entry[1].resource as fhir.Task,
        EVENT_TYPE.BIRTH
      )

      expect(taskResource.code).toBeDefined()
      expect(taskResource.code).toEqual({
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}types`,
            code: EVENT_TYPE.BIRTH.toString()
          }
        ]
      })
    })
  })
  describe('SetupRegistrationWorkflow', () => {
    it('Will push the registration status on fhirDoc', async () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: '1573112965',
        sub: '',
        algorithm: '',
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const taskResource = await setupRegistrationWorkflow(
        testFhirBundle.entry[1].resource as fhir.Task,
        tokenPayload
      )

      if (
        taskResource &&
        taskResource.businessStatus &&
        taskResource.businessStatus.coding &&
        taskResource.businessStatus.coding[0] &&
        taskResource.businessStatus.coding[0].code
      ) {
        expect(taskResource.businessStatus.coding[0].code).toBeDefined()
        expect(taskResource.businessStatus.coding[0].code).toEqual('DECLARED')
      }
    })
    it('Will update existing registration status on fhirDoc', async () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: '1573112965',
        sub: '',
        algorithm: '',
        aud: '',
        subject: '1',
        scope: ['register']
      }
      const fhirBundle = cloneDeep(testFhirBundle)

      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        fhirBundle.entry[1].resource['businessStatus'] = {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}reg-status`,
              code: 'DECLARED'
            }
          ]
        }

        const taskResource = await setupRegistrationWorkflow(
          fhirBundle.entry[1].resource as fhir.Task,
          tokenPayload
        )

        if (
          taskResource &&
          taskResource.businessStatus &&
          taskResource.businessStatus.coding &&
          taskResource.businessStatus.coding[0] &&
          taskResource.businessStatus.coding[0].code
        ) {
          expect(taskResource.businessStatus.coding.length).toBe(1)
          expect(taskResource.businessStatus.coding[0].code).toEqual(
            'REGISTERED'
          )
        }
      }
    })
  })
  describe('SetupLastRegUser', () => {
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
    it('Will push the last modified by userinfo on fhirDoc', () => {
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource
      ) {
        const taskResource = setupLastRegUser(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[4] &&
          taskResource.extension[4].valueReference &&
          taskResource.extension[4].valueReference.reference
        ) {
          expect(
            taskResource.extension[4].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[4].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })

    it('Will push the last modified by userinfo even if no extension is defined yet on task resource', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        fhirBundle.entry[1].resource.extension = [{ url: '', valueString: '' }]
        const taskResource = setupLastRegUser(
          fhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )

        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[0] &&
          taskResource.extension[0].valueReference &&
          taskResource.extension[0].valueReference.reference
        ) {
          expect(
            taskResource.extension[0].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[0].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })

    it('Will update the last modified by userinfo instead of always adding a new extension', () => {
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource &&
        testFhirBundle.entry[1].resource.extension
      ) {
        const lengthOfTaskExtensions =
          testFhirBundle.entry[1].resource.extension.length
        const taskResource = setupLastRegUser(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[4] &&
          taskResource.extension[4].valueReference &&
          taskResource.extension[4].valueReference.reference
        ) {
          expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
          expect(taskResource.extension[4].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })
  })
  it('setupAuthorOnNotes will update the author name on notes', () => {
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
    const fhirBundle = cloneDeep(testFhirBundle)

    fhirBundle.entry[1].resource['note'] = [
      {
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      }
    ]
    const taskResource = setupAuthorOnNotes(
      fhirBundle.entry[1].resource as fhir.Task,
      practitioner
    )
    if (taskResource && taskResource.note && taskResource.note[0]) {
      expect(taskResource.note.length).toBe(1)
      expect(taskResource.note[0]).toEqual({
        authorString: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf',
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      })
    }
  })
  describe('setupLastRegLocation', () => {
    beforeEach(() => {
      fetch.mockResponses(
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
    it('set regLastLocation properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      if (taskResource && taskResource.extension && taskResource.extension[4]) {
        expect(taskResource.extension[3]).toEqual({
          url: 'http://opencrvs.org/specs/extension/regLastLocation',
          valueReference: {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
          }
        })
      }
    })
    it('set regLastOffice properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      if (taskResource && taskResource.extension && taskResource.extension[2]) {
        expect(taskResource.extension[2]).toEqual({
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd12yy'
          }
        })
      }
    })
    it('throws error if invalid practitioner is provided', async () => {
      const practitioner = JSON.parse(fieldAgentPractitionerMock)
      practitioner.id = undefined
      expect(
        setupLastRegLocation(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
      ).rejects.toThrowError('Invalid practitioner data found')
    })
  })
})

describe('validateDeceasedDetails functions', () => {
  let token: string
  let authHeader: { Authorization: string }
  beforeEach(async () => {
    fetch.resetMocks()
    token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    authHeader = {
      Authorization: `Bearer ${token}`
    }
  })
  it('Validates deceased details and modifies bundle', async () => {
    fetch.mockResponses(
      [mosipConfigMock, { status: 200 }],
      [mosipSuccessMock, { status: 200 }],
      [mosipBirthPatientBundleMock, { status: 200 }],
      [JSON.stringify({}), { status: 200 }]
    )
    const validateResponse = await validateDeceasedDetails(
      mosipDeceasedPatientMock,
      authHeader
    )
    expect(validateResponse).toEqual(mosipUpdatedDeceasedPatientMock)
  })
  afterAll(async () => {
    jest.clearAllMocks()
  })
})
