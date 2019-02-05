import { buildFHIRBundle } from 'src/features/registration/fhir-builders'

test('should build a minimal FHIR registration document without error', async () => {
  const fhir = await buildFHIRBundle(
    {
      deceased: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: 'female',
        birthDate: '2000-01-28',
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'en' }],
        deceased: false,
        multipleBirth: 1,
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_3'
      },
      informant: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: 'male',
        birthDate: '2000-01-28',
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'John', familyName: 'Doe', use: 'en' }],
        deceased: false,
        multipleBirth: 1,
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_4'
      },
      informantRelationship: 'SON',
      // otherInformantRelationship: 'OTHER',
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        contact: 'MOTHER',
        paperFormID: '12345678',
        trackingId: 'B123456',
        registrationNumber: '201923324512345671',
        status: [
          {
            comments: [
              {
                comment: 'This is just a test data',
                createdAt: '2018-10-31T09:45:05+10:00'
              }
            ],
            timestamp: '2018-10-31T09:45:05+10:00'
          }
        ],
        attachments: [
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce11',
            contentType: 'image/jpeg',
            data: 'SampleData',
            status: 'final',
            originalFileName: 'original.jpg',
            systemFileName: 'system.jpg',
            type: 'NATIONAL_ID',
            createdAt: '2018-10-21'
          },
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce22',
            contentType: 'image/png',
            data: 'ExampleData',
            status: 'deleted',
            originalFileName: 'original.png',
            systemFileName: 'system.png',
            type: 'PASSPORT',
            createdAt: '2018-10-22',
            subject: 'MOTHER'
          }
        ],
        certificates: [
          {
            collector: {
              relationship: 'OTHER',
              individual: {
                name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
                identifier: [{ id: '123456', type: 'PASSPORT' }]
              }
            },
            hasShowedVerifiedDocument: true,
            payments: [
              {
                paymentId: '1234',
                type: 'MANUAL',
                total: 50.0,
                amount: 50.0,
                outcome: 'COMPLETED',
                date: '2018-10-22'
              }
            ],
            data: 'DUMMY-DATA'
          }
        ]
      },
      deathLocation: '123',
      deathLocationType: 'PRIVATE_HOME',
      placeOfDeath: {
        type: 'PRIVATE_HOME',
        partOf: '456',
        address: {
          type: 'BIRTH_PLACE',
          country: '789',
          state: '101112',
          district: '131415',
          postalCode: 'sw11',
          line: [
            'addressLine1',
            'addressLine1CityOption',
            'addressLine2',
            '123',
            '456',
            '789'
          ]
        }
      },
      mannerOfDeath: 'NATURAL_CAUSES',
      causeOfDeathMethod: 'MEDICALLY_CERTIFIED',
      causeOfDeath: 'age',
      createdAt: new Date(),
      _fhirIDMap: {
        composition: '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd',
        encounter: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsakelske'
      }
    },
    'DEATH'
  )
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(5)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[0].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd'
  )
  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[1].resource.name[0].given[0]).toEqual('Jane')

  expect(fhir.entry[2].resource.resourceType).toEqual('RelatedPerson')
  expect(fhir.entry[2].resource.relationship.coding[0].code).toEqual('SON')
  expect(fhir.entry[2].resource.patient.reference).toEqual(
    fhir.entry[3].fullUrl
  )
})
