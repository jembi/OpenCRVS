import {
  setTrackingId,
  pushRN,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  OPENCRVS_SPECIFICATION_URL,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import {
  testFhirBundle,
  testDeathFhirBundle,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify fhir bundle modifier functions', () => {
  describe('setTrackingId', () => {
    it('Successfully modified the provided fhirBundle with birth trackingid', () => {
      const fhirBundle = setTrackingId(testFhirBundle)
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

    it('Successfully modified the provided fhirBundle with death trackingid', () => {
      const fhirBundle = setTrackingId(testDeathFhirBundle)
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

    it('Throws error if invalid fhir bundle is provided', () => {
      const invalidData = { ...testFhirBundle, entry: [] }
      expect(() => setTrackingId(invalidData)).toThrowError(
        'Invalid FHIR bundle found'
      )
    })

    it('Will push the composite resource identifier if it is missing on fhirDoc', () => {
      const fhirBundle = setTrackingId({
        ...testFhirBundle,
        entry: [{ resource: {} }]
      })

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
    it('Will push the registration status on fhirDoc', () => {
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
      const taskResource = setupRegistrationWorkflow(
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
    it('Will update existing registration status on fhirDoc', () => {
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
      /* tslint:disable:no-string-literal */
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
        /* tslint:enable:no-string-literal */
        const taskResource = setupRegistrationWorkflow(
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
          taskResource.extension[2] &&
          taskResource.extension[2].valueReference &&
          taskResource.extension[2].valueReference.reference
        ) {
          expect(
            taskResource.extension[2].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[2].valueReference.reference).toEqual(
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
          taskResource.extension[2] &&
          taskResource.extension[2].valueReference &&
          taskResource.extension[2].valueReference.reference
        ) {
          expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
          expect(taskResource.extension[2].valueReference.reference).toEqual(
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
    /* tslint:disable:no-string-literal */
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
    /* tslint:enable:no-string-literal */
  })
  describe('pushRN', () => {
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
    it('Successfully modified the provided fhirBundle with birth registration number', async () => {
      const birthTrackingId = 'B5WGYJE'
      const brnChecksum = 1

      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource &&
        testFhirBundle.entry[1].resource.identifier &&
        testFhirBundle.entry[1].resource.identifier[1] &&
        testFhirBundle.entry[1].resource.identifier[1].value
      ) {
        testFhirBundle.entry[1].resource.identifier[1].value = birthTrackingId

        const task = await pushRN(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner,
          'birth-registration-number'
        )
        if (
          task &&
          task.identifier &&
          task.identifier[2] &&
          task.identifier[2].value &&
          task.identifier[2].system
        ) {
          expect(task.identifier[2].system).toEqual(
            `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
          )
          expect(task.identifier[2].value).toBeDefined()
          expect(task.identifier[2].value).toMatch(
            new RegExp(
              `^${new Date().getFullYear()}103421${birthTrackingId}${brnChecksum}`
            )
          )
        }
      }
    })

    it('Successfully modified the provided fhirBundle with death registration number', async () => {
      const deathTrackingId = 'D5WGYJE'
      const brnChecksum = 4
      if (
        testDeathFhirBundle &&
        testDeathFhirBundle.entry &&
        testDeathFhirBundle.entry[10] &&
        testDeathFhirBundle.entry[10].resource &&
        testDeathFhirBundle.entry[10].resource.identifier &&
        testDeathFhirBundle.entry[10].resource.identifier[0] &&
        testDeathFhirBundle.entry[10].resource.identifier[0].value
      ) {
        testDeathFhirBundle.entry[10].resource.identifier[0].value = deathTrackingId
        const taskConversion = testDeathFhirBundle.entry[10].resource as unknown
        const task = await pushRN(
          taskConversion as fhir.Task,
          practitioner,
          'death-registration-number'
        )

        if (
          task &&
          task.identifier &&
          task.identifier[1] &&
          task.identifier[1].value &&
          task.identifier[1].system
        ) {
          expect(task.identifier[1].system).toEqual(
            `${OPENCRVS_SPECIFICATION_URL}id/death-registration-number`
          )
          expect(task.identifier[1].value).toBeDefined()
          expect(task.identifier[1].value).toMatch(
            new RegExp(
              `^${new Date().getFullYear()}103421${deathTrackingId}${brnChecksum}`
            )
          )
        }
      }
    })

    it('Throws error if invalid fhir bundle is provided', async () => {
      const invalidDataConversion = undefined as unknown
      const invalidData = invalidDataConversion as fhir.Task
      expect(
        pushRN(invalidData, practitioner, 'birth-registration-number')
      ).rejects.toThrowError('Invalid Task resource found for registration')
    })
    it('If fhirBundle already have a brn then it will update the exiting one instead of creating a new one', async () => {
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource
      ) {
        const oldTask = testFhirBundle.entry[1].resource as fhir.Task

        if (
          oldTask &&
          oldTask.identifier &&
          oldTask.identifier[2] &&
          oldTask.identifier[2].value
        ) {
          oldTask.identifier[2].value = 'DUMMYBRN'
          const indentifierLength = oldTask.identifier.length

          const fhirBundle = cloneDeep(testFhirBundle)

          const birthTrackingId = 'B5WGYJE'
          const brnChecksum = 1
          if (
            fhirBundle.entry[1].resource.identifier &&
            fhirBundle.entry[1].resource.identifier[1] &&
            fhirBundle.entry[1].resource.identifier[1].value
          ) {
            fhirBundle.entry[1].resource.identifier[1].value = birthTrackingId
            const newTask = await pushRN(
              fhirBundle.entry[1].resource as fhir.Task,
              practitioner,
              'birth-registration-number'
            )
            if (
              newTask &&
              newTask.identifier &&
              newTask.identifier[2] &&
              newTask.identifier[2].system &&
              newTask.identifier[2].value
            ) {
              expect(newTask.identifier.length).toBe(indentifierLength)
              expect(newTask.identifier[2].system).toEqual(
                `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
              )
              expect(newTask.identifier[2].value).toBeDefined()
              expect(newTask.identifier[2].value).toMatch(
                new RegExp(
                  `^${new Date().getFullYear()}103421${birthTrackingId}${brnChecksum}`
                )
              )
              expect(newTask.identifier[2].value).not.toEqual(
                oldTask.identifier[2].value
              )
            }
          }
        }
      }
    })
  })
  describe('setupLastRegLocation', () => {
    it('set regLastLocation properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      if (taskResource && taskResource.extension && taskResource.extension[3]) {
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
      if (taskResource && taskResource.extension && taskResource.extension[4]) {
        expect(taskResource.extension[4]).toEqual({
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
