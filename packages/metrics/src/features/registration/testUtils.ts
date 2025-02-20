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

export const testDeclaration = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:0256278e-f4b0-4c0b-9785-655d787069e9',
      resource: {
        identifier: { system: 'urn:ietf:rfc:3986', value: 'BMPG0QJ' },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-declaration'
            }
          ],
          text: 'Birth Declaration'
        },
        class: {
          coding: [
            { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
          ],
          text: 'CRVS Document'
        },
        title: 'Birth Declaration',
        section: [
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              { reference: 'urn:uuid:e9ebc455-6737-401a-bbd3-0c76044547db' }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              { reference: 'urn:uuid:cd9b2686-a284-4011-b651-f849565060f6' }
            ]
          },
          {
            title: 'Birth encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'birth-encounter'
                }
              ],
              text: 'Birth encounter'
            },
            entry: [
              { reference: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f' }
            ]
          }
        ],
        subject: {},
        date: '2019-11-30T15:48:42.833Z',
        author: [],
        id: '9f24f539-8126-4261-baa0-243eea374004'
      }
    },
    {
      fullUrl: 'urn:uuid:5a53d591-5588-4bfc-a3e0-6efe94c2460f',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: { reference: 'urn:uuid:0256278e-f4b0-4c0b-9785-655d787069e9' },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '9a6cad9b-7cf2-4929-95ad-2d5d9b8322e8'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BMPG0QJ'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801916546544'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 44392
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cae39955-557d-49d3-bc79-521f86f9a182'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3'
            }
          }
        ],
        lastModified: '2019-11-30T15:48:43.149Z',
        businessStatus: {
          coding: [
            { system: 'http://opencrvs.org/specs/reg-status', code: 'DECLARED' }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e9ebc455-6737-401a-bbd3-0c76044547db',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          { use: 'bn', family: ['অনিল'] },
          { use: 'en', family: ['eavgser'] }
        ],
        gender: 'male',
        birthDate: '2018-02-02',
        multipleBirthInteger: 5
      }
    },
    {
      fullUrl: 'urn:uuid:cd9b2686-a284-4011-b651-f849565060f6',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [{ value: '6546546544654', type: 'NATIONAL_ID' }],
        name: [
          { use: 'bn', family: ['অনিল'] },
          { use: 'en', family: ['sevg'] }
        ],
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '0644dd0d-9d91-4e35-ba6e-922486e5859d'],
            district: '8a268726-375d-4919-abb4-b43ef1296261',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', '0644dd0d-9d91-4e35-ba6e-922486e5859d'],
            district: '8a268726-375d-4919-abb4-b43ef1296261',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'Location/f94e0802-a621-4287-946d-ac49e66d2d3e'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:bbe5c333-cd1e-4933-b52f-38dc15b2b1f8',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: { reference: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f' },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'present-at-birth-reg',
              display: 'Present at birth registration'
            }
          ]
        },
        valueString: 'MOTHER'
      }
    }
  ],
  meta: { lastUpdated: '2019-11-30T15:48:42.833Z' }
}

export const testPayload = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '31dcd26b-a500-483a-b8a1-c2083c1248ee'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-declaration'
            }
          ],
          text: 'Birth Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        title: 'Birth Declaration',
        section: [
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              {
                reference: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a'
              }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              {
                reference: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-05T11:38:06.846Z',
        author: [],
        id: 'b2fbb82c-a68d-4793-98e1-87484fc785c4'
      }
    },
    {
      fullUrl: 'urn:uuid:13f293bd-4265-4885-b810-9b8e1e22dc6a',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee'
        },
        id: '4b11f298-8bd4-4de0-b02d-f229c3faca9c',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLVEXNF'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2019333494BLVEXNF0'
          }
        ],
        lastModified: '2019-03-05T11:38:15.844Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a',
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '3b5c1496-2794-4deb-aba0-c3c034695029',
        name: [
          {
            use: 'bn',
            family: ['মকবুলনিউ']
          }
        ],
        gender: 'male',
        birthDate: '2018-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '6e33c50b-7e68-405e-a3a4-c8337c04a2f3',
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['মকবুলনিউমা']
          }
        ],
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'urn:iso:std:iso:3166',
                      code: 'BGD'
                    }
                  ]
                }
              },
              {
                url: 'period',
                valuePeriod: {
                  start: '',
                  end: ''
                }
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'Location/f05c6382-4781-4fa4-98f2-72c4433dc2f7'
            }
          }
        ],
        id: '039bcc8e-bb36-4ab1-97fb-95b92b07b7c1'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-03-05T11:38:06.846Z'
  }
}

export const testDeathPayload = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82',
      resource: {
        identifier: { system: 'urn:ietf:rfc:3986', value: 'DWMWZ9X' },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        title: 'Death Declaration',
        section: [
          {
            title: 'Deceased details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'deceased-details'
                }
              ],
              text: 'Deceased details'
            },
            entry: [
              { reference: 'urn:uuid:42c8acf3-dcd9-45b1-9390-12f6b289be38' }
            ]
          },
          {
            title: "Informant's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'informant-details'
                }
              ],
              text: "Informant's details"
            },
            entry: [
              { reference: 'urn:uuid:f2945611-5af6-4946-bd67-16f571cbc979' }
            ]
          },
          {
            title: 'Death encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'death-encounter'
                }
              ],
              text: 'Death encounter'
            },
            entry: [
              { reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d' }
            ]
          }
        ],
        subject: {},
        date: '2019-11-30T13:01:33.651Z',
        author: [],
        id: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
      }
    },
    {
      fullUrl: 'urn:uuid:a37f7259-2272-4e1e-bdfd-616ec1224a6a',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'DEATH' }]
        },
        focus: {
          reference: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '914d7ad6-addb-430d-a08d-b225635e9860'
          },
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DWMWZ9X'
          },
          {
            system: 'http://opencrvs.org/specs/id/death-registration-number',
            value: '20196816020000113'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'INFORMANT'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-relationship',
            valueString: ''
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801916543214'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 63445
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/ec1f4476-182f-408f-9da2-aff0c9bd1f26'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3'
            }
          }
        ],
        lastModified: '2019-11-30T13:01:34.559Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:42c8acf3-dcd9-45b1-9390-12f6b289be38',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [{ value: '6546546546544', type: 'NATIONAL_ID' }],
        name: [
          { use: 'bn', family: ['অমর'] },
          { use: 'en', family: ['svzsdfv'] }
        ],
        gender: 'male',
        birthDate: '1976-02-02',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
            district: '1091de2f-5368-41fc-83da-a8a145f191fc',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
            district: '1091de2f-5368-41fc-83da-a8a145f191fc',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-05-05',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:f2945611-5af6-4946-bd67-16f571cbc979',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'SPOUSE'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:52c01564-9fc0-4a68-85b7-1f0a93bfc326'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:52c01564-9fc0-4a68-85b7-1f0a93bfc326',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [{ value: '9516546546544', type: 'NATIONAL_ID' }],
        name: [
          { use: 'bn', family: ['অমর'] },
          { use: 'en', family: ['scad'] }
        ],
        address: [
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'f79c57a5-6249-4a88-adff-699f6170f956'],
            district: '866781e6-de24-417d-99b5-d6b2e37f8f70',
            state: 'd247df4f-ff82-4c64-8899-1628d30bd8a0',
            country: 'BGD'
          },
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'f79c57a5-6249-4a88-adff-699f6170f956'],
            district: '866781e6-de24-417d-99b5-d6b2e37f8f70',
            state: 'd247df4f-ff82-4c64-8899-1628d30bd8a0',
            country: 'BGD'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b65c01fc-0f27-45e6-aec1-14d466522d0f'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b65c01fc-0f27-45e6-aec1-14d466522d0f',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/11e737ab-1569-4f0a-8100-669cd3f461e7'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
          district: '1091de2f-5368-41fc-83da-a8a145f191fc',
          state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:33ae7ca1-0fb8-4685-bcd3-80ced7dde3cc',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'uncertified-manner-of-death',
              display: 'Uncertified manner of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/icd-10',
              code: 'NATURAL_CAUSES'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:02e69cae-e68e-4264-99d2-2e0bd44d090e',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'ICD10',
              display: 'Cause of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            { system: 'http://hl7.org/fhir/ValueSet/icd-10', code: 'Old age' }
          ]
        }
      }
    }
  ],
  meta: { lastUpdated: '2019-11-30T13:01:33.651Z' }
}

export const testDeathCertPayload = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/PaymentReconciliation/75a7d7c1-ab9e-43d9-bdb5-8ba14f46cc4a/_history/94d9feab-78f9-4de7-9b4b-a4bcbef04a57',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '75a7d7c1-ab9e-43d9-bdb5-8ba14f46cc4a'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        title: 'Death Declaration',
        section: [
          {
            title: 'Certificates',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'certificates'
                }
              ],
              text: 'Certificates'
            },
            entry: [
              { reference: 'urn:uuid:3a3e788e-abfe-4ec7-9774-ed30a96bd89b' }
            ]
          },
          {
            title: 'Deceased details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'deceased-details'
                }
              ],
              text: 'Deceased details'
            },
            entry: [
              { reference: 'urn:uuid:39044844-b0f5-44b9-98f6-7400a0fd6c06' }
            ]
          },
          {
            title: "Informant's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'informant-details'
                }
              ],
              text: "Informant's details"
            },
            entry: [
              { reference: 'urn:uuid:3c0d77ab-0637-4318-9b04-d1eae4bcb408' }
            ]
          },
          {
            title: 'Death encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'death-encounter'
                }
              ],
              text: 'Death encounter'
            },
            entry: [
              { reference: 'urn:uuid:75486f3e-61be-4b98-85de-460112f9d6a4' }
            ]
          }
        ],
        subject: {},
        date: '2019-11-30T15:19:53.423Z',
        author: [],
        id: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
      }
    },
    {
      fullUrl: 'urn:uuid:0e4842d8-5e61-4fb5-af6b-ff3065adb8c5',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'DEATH' }]
        },
        focus: {
          reference:
            'PaymentReconciliation/75a7d7c1-ab9e-43d9-bdb5-8ba14f46cc4a'
        },
        id: 'a633299b-1738-4acc-aad8-a3220f910499',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
          },
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DWMWZ9X'
          },
          {
            system: 'http://opencrvs.org/specs/id/death-registration-number',
            value: '20196816020000113'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'INFORMANT'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-relationship',
            valueString: ''
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801916543214'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/ec1f4476-182f-408f-9da2-aff0c9bd1f26'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/paymentDetails',
            valueReference: {
              reference: 'urn:uuid:2aead0f3-55a4-4e7c-a7ac-720f36580f66'
            }
          }
        ],
        lastModified: '2019-11-30T15:19:54.168Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'CERTIFIED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3a3e788e-abfe-4ec7-9774-ed30a96bd89b',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '3a3e788e-abfe-4ec7-9774-ed30a96bd89b'
        },
        status: 'current',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/certificate-type',
              code: 'DEATH'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/collector',
            valueReference: {
              reference: 'urn:uuid:1abc1fb1-14f2-4b5d-b9b3-2e555c8a4f30'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
            valueString: false
          },
          {
            url: 'http://opencrvs.org/specs/extension/payment',
            valueReference: {
              reference: 'urn:uuid:2aead0f3-55a4-4e7c-a7ac-720f36580f66'
            }
          }
        ],
        content: [
          {
            attachment: {
              contentType: 'application/pdf',
              data: 'khjgkjhg'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:1abc1fb1-14f2-4b5d-b9b3-2e555c8a4f30',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'INFORMANT'
            }
          ]
        },
        patient: {
          reference: 'RelatedPerson/71cf7b97-015a-4316-9059-b60c4846f8f5'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:2aead0f3-55a4-4e7c-a7ac-720f36580f66',
      resource: {
        resourceType: 'PaymentReconciliation',
        status: 'active',
        detail: [
          {
            type: { coding: [{ code: 'MANUAL' }] },
            amount: 25,
            date: 1575127120540
          }
        ],
        total: { value: 25 },
        outcome: { coding: [{ code: 'COMPLETED' }] }
      }
    },
    {
      fullUrl: 'urn:uuid:39044844-b0f5-44b9-98f6-7400a0fd6c06',
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'aad292dd-47c6-4860-be4d-eb9ce62410f6',
        identifier: [{ value: '6546546546544', type: 'NATIONAL_ID' }],
        name: [
          { use: 'bn', family: ['অমর'] },
          { use: 'en', family: ['svzsdfv'] }
        ],
        gender: 'male',
        birthDate: '1976-02-02',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
            district: '1091de2f-5368-41fc-83da-a8a145f191fc',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
            district: '1091de2f-5368-41fc-83da-a8a145f191fc',
            state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-05-05',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:3c0d77ab-0637-4318-9b04-d1eae4bcb408',
      resource: {
        resourceType: 'RelatedPerson',
        id: '71cf7b97-015a-4316-9059-b60c4846f8f5',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'SPOUSE'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:63499fb4-9f44-4cc7-90e8-c4d7e1a160c6'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:63499fb4-9f44-4cc7-90e8-c4d7e1a160c6',
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '7154aa20-0e72-4531-9aff-003cdbdb7e80',
        identifier: [{ value: '9516546546544', type: 'NATIONAL_ID' }],
        name: [
          { use: 'bn', family: ['অমর'] },
          { use: 'en', family: ['scad'] }
        ],
        address: [
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'f79c57a5-6249-4a88-adff-699f6170f956'],
            district: '866781e6-de24-417d-99b5-d6b2e37f8f70',
            state: 'd247df4f-ff82-4c64-8899-1628d30bd8a0',
            country: 'BGD'
          },
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'f79c57a5-6249-4a88-adff-699f6170f956'],
            district: '866781e6-de24-417d-99b5-d6b2e37f8f70',
            state: 'd247df4f-ff82-4c64-8899-1628d30bd8a0',
            country: 'BGD'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:75486f3e-61be-4b98-85de-460112f9d6a4',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:079f7869-8700-44e5-afec-c34f31b8076c'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:079f7869-8700-44e5-afec-c34f31b8076c',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/11e737ab-1569-4f0a-8100-669cd3f461e7'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', '11e737ab-1569-4f0a-8100-669cd3f461e7'],
          district: '1091de2f-5368-41fc-83da-a8a145f191fc',
          state: '35d2b632-e920-4ea5-afde-5d2b8a607b19',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:0adcc579-8cf5-4b7f-81cc-53abc5f1ce39',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:75486f3e-61be-4b98-85de-460112f9d6a4'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'uncertified-manner-of-death',
              display: 'Uncertified manner of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/icd-10',
              code: 'NATURAL_CAUSES'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:484332d3-72a5-4265-835e-66d54c5df7a6',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:75486f3e-61be-4b98-85de-460112f9d6a4'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: 'ICD10',
              display: 'Cause of death'
            }
          ]
        },
        valueCodeableConcept: {
          coding: [
            { system: 'http://hl7.org/fhir/ValueSet/icd-10', code: 'blah' }
          ]
        }
      }
    }
  ],
  meta: { lastUpdated: '2019-11-30T15:19:53.423Z' }
}
