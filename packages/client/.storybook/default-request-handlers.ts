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

/* eslint-disable import/no-relative-parent-imports */
import { http, graphql, HttpResponse } from 'msw'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { mockOfflineData } from '../src/tests/mock-offline-data'
import forms from '../src/tests/forms.json'
import { AppRouter } from '../src/v2-events/trpc'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventIndex
} from '../src/v2-events/features/events/fixtures'
import { tennisClubMembershipCertifiedCertificateTemplate } from './tennisClubMembershipCertifiedCertificateTemplate'
import { birthEvent } from '@client/v2-events/components/forms/inputs/FileInput/fixtures'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const handlers = {
  events: [
    tRPCMsw.event.config.get.query(() => {
      return [tennisClubMembershipEvent, birthEvent]
    }),
    tRPCMsw.event.list.query(() => {
      return [tennisClubMembershipEventIndex]
    })
  ],
  registrationHome: [
    graphql.query('registrationHome', () => {
      return HttpResponse.json({
        data: {
          inProgressTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          notificationTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          reviewTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          rejectTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          approvalTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          externalValidationTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          printTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          },
          issueTab: {
            totalItems: 0,
            results: [],
            __typename: 'EventSearchResultSet'
          }
        }
      })
    })
  ],
  corrections: [
    graphql.query('getTotalCorrections', () => {
      return HttpResponse.json({
        data: {
          getTotalCorrections: []
        }
      })
    })
  ],
  metrics: [
    graphql.query('getTotalMetrics', () => {
      return HttpResponse.json({
        data: {
          getTotalMetrics: {
            estimated: {
              totalEstimation: 0,
              maleEstimation: 0,
              femaleEstimation: 0,
              locationId: null,
              locationLevel: null,
              __typename: 'EstimatedMetrics'
            },
            results: [],
            __typename: 'TotalMetrics'
          }
        }
      })
    })
  ],
  systemRoles: [
    graphql.query('getSystemRoles', () => {
      return HttpResponse.json({
        data: {
          getSystemRoles: [
            {
              id: '677e3de85315af4a26542652',
              value: 'FIELD_AGENT',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b55',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Field Agent',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Agent de terrain',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                },
                {
                  _id: '677e3eb03a423676c3af1b56',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Police Officer',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Officier de police',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                },
                {
                  _id: '677e3eb03a423676c3af1b57',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Social Worker',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Travailleur social',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                },
                {
                  _id: '677e3eb03a423676c3af1b58',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Healthcare Worker',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Personnel de santé',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                },
                {
                  _id: '677e3eb03a423676c3af1b59',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Local Leader',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Leader local',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542653',
              value: 'REGISTRATION_AGENT',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b5f',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Registration Agent',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: "Agent d'enregistrement",
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542655',
              value: 'LOCAL_SYSTEM_ADMIN',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b68',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Local System Admin',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Administrateur système local',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542656',
              value: 'NATIONAL_SYSTEM_ADMIN',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b6f',
                  labels: [
                    {
                      lang: 'en',
                      label: 'National System Admin',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Administrateur système national',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542657',
              value: 'PERFORMANCE_MANAGEMENT',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b71',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Performance Manager',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Gestion des performances',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542654',
              value: 'LOCAL_REGISTRAR',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b73',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Local Registrar',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Registraire local',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            },
            {
              id: '677e3de85315af4a26542658',
              value: 'NATIONAL_REGISTRAR',
              roles: [
                {
                  _id: '677e3eb03a423676c3af1b79',
                  labels: [
                    {
                      lang: 'en',
                      label: 'National Registrar',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Registraire national',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            }
          ]
        }
      })
    })
  ],
  locationsStatistics: [
    graphql.query('getLocationStatistics', () => {
      return HttpResponse.json({
        data: {
          getLocationStatistics: {
            population: 0,
            offices: [],
            registrars: [],
            __typename: 'LocationStatistics'
          },
          fetchRegistrationCountByStatus: {
            results: [],
            total: 0,
            __typename: 'RegistrationCountByStatus'
          }
        }
      })
    })
  ],
  user: [
    graphql.query('fetchUser', () => {
      return HttpResponse.json({
        data: {
          getUser: {
            id: '679397db138339c63cdc24e1',
            userMgntUserID: '679397db138339c63cdc24e1',
            creationDate: '1737725915295',
            username: 'k.mweene',
            practitionerId: '6f672b75-ec29-4bdc-84f6-4cb3ff9bb529',
            mobile: '+260933333333',
            email: 'kalushabwalya1.7@gmail.com',
            role: {
              label: {
                id: 'userRole.localRegistrar',
                defaultMessage: 'Local Registrar',
                description: 'Name for user role Local Registrar',
                __typename: 'I18nMessage'
              },
              __typename: 'UserRole'
            },
            status: 'active',
            name: [
              {
                use: 'en',
                firstNames: 'Kennedy',
                familyName: 'Mweene',
                __typename: 'HumanName'
              }
            ],
            primaryOffice: {
              id: 'dfcd1cbc-30c7-41a4-afd2-020515b4d78b',
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              status: 'active',
              __typename: 'Location'
            },
            localRegistrar: {
              name: [
                {
                  use: 'en',
                  firstNames: 'Kennedy',
                  familyName: 'Mweene',
                  __typename: 'HumanName'
                }
              ],
              role: 'LOCAL_REGISTRAR',
              signature: null,
              __typename: 'LocalRegistrar'
            },
            avatar: null,
            searches: [],
            __typename: 'User'
          }
        }
      })
    })
  ],
  locations: [
    http.get('http://localhost:7070/location', () => {
      return HttpResponse.json({
        resourceType: 'Bundle',
        id: '109636d2-09f0-4444-b42c-e22edce0539e',
        meta: { lastUpdated: '2025-01-17T05:18:12.105+00:00' },
        type: 'searchset',
        total: 17,
        link: [
          {
            relation: 'self',
            url: 'http://config:2021/location?type=CRVS_OFFICE&_count=0'
          },
          {
            relation: 'next',
            url: 'http://config:2021/location?type=CRVS_OFFICE&_count=0&_getpagesoffset=0'
          }
        ],
        entry: [
          {
            fullUrl:
              'http://localhost:2021/location/a45b982a-5c7b-4bd9-8fd8-a42d0994054c/_history/115c7e08-cefe-4640-8818-15d904211e77',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/statistical-code',
                  value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
                },
                {
                  system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                  value: 'STATE'
                }
              ],
              name: 'Central',
              alias: ['Central'],
              description: 'AWn3s2RqgAN',
              status: 'active',
              mode: 'instance',
              partOf: { reference: 'Location/0' },
              type: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/location-type',
                    code: 'ADMIN_STRUCTURE'
                  }
                ]
              },
              physicalType: {
                coding: [{ code: 'jdn', display: 'Jurisdiction' }]
              },
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
                  valueAttachment: {
                    contentType: 'application/geo+json',
                    data: '<base64>'
                  }
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-male-populations',
                  valueString:
                    '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-female-populations',
                  valueString:
                    '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-total-populations',
                  valueString:
                    '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
                  valueString:
                    '[{"2007":10},{"2008":10},{"2009":10},{"2010":10},{"2011":10},{"2012":10},{"2013":10},{"2014":10},{"2015":10},{"2016":10},{"2017":10},{"2018":10},{"2019":10},{"2020":10},{"2021":10},{"2022":15},{"2023":20}]'
                }
              ],
              meta: {
                lastUpdated: '2025-02-05T07:52:42.266+00:00',
                versionId: '115c7e08-cefe-4640-8818-15d904211e77'
              },
              id: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
            },
            request: {
              method: 'PUT',
              url: 'Location/a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
            }
          },
          {
            fullUrl:
              'http://localhost:2021/location/5ef450bc-712d-48ad-93f3-8da0fa453baa/_history/8ae119de-682a-40fa-be03-9de10fc07d53',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/statistical-code',
                  value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
                },
                {
                  system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                  value: 'DISTRICT'
                }
              ],
              name: 'Ibombo',
              alias: ['Ibombo'],
              description: 'oEBf29y8JP8',
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
              },
              type: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/location-type',
                    code: 'ADMIN_STRUCTURE'
                  }
                ]
              },
              physicalType: {
                coding: [{ code: 'jdn', display: 'Jurisdiction' }]
              },
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
                  valueAttachment: {
                    contentType: 'application/geo+json',
                    data: '<base64>'
                  }
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-male-populations',
                  valueString:
                    '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-female-populations',
                  valueString:
                    '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-total-populations',
                  valueString:
                    '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
                },
                {
                  url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
                  valueString:
                    '[{"2007":10},{"2008":10},{"2009":10},{"2010":10},{"2011":10},{"2012":10},{"2013":10},{"2014":10},{"2015":10},{"2016":10},{"2017":10},{"2018":10},{"2019":10},{"2020":10},{"2021":10},{"2022":15},{"2023":20}]'
                }
              ],
              meta: {
                lastUpdated: '2025-02-05T07:52:42.267+00:00',
                versionId: '8ae119de-682a-40fa-be03-9de10fc07d53'
              },
              id: '5ef450bc-712d-48ad-93f3-8da0fa453baa'
            },
            request: {
              method: 'PUT',
              url: 'Location/5ef450bc-712d-48ad-93f3-8da0fa453baa'
            }
          },
          {
            fullUrl:
              'http://config:2021/location/92ab695b-9362-4682-a861-ddce87a3a905/_history/f11c3af0-b945-4082-8902-c66e4f9b43da',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_2OKicPQMNI'
                }
              ],
              name: 'HQ Office',
              alias: ['HQ Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/5ef450bc-712d-48ad-93f3-8da0fa453baa'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:11:38.743+00:00',
                versionId: 'f11c3af0-b945-4082-8902-c66e4f9b43da'
              },
              id: '92ab695b-9362-4682-a861-ddce87a3a905'
            },
            request: {
              method: 'PUT',
              url: 'Location/92ab695b-9362-4682-a861-ddce87a3a905'
            }
          },
          {
            fullUrl:
              'http://config:2021/location/6c0bde80-100b-446d-9a6e-8587761bf4c4/_history/19cdc852-1360-4e03-90dc-82155581d927',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_JEhYJ82xRI'
                }
              ],
              name: 'Isamba District Office',
              alias: ['Isamba District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/b2991802-bd06-4e0c-9ec3-b6069f0cfc73'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.915+00:00',
                versionId: '19cdc852-1360-4e03-90dc-82155581d927'
              },
              id: '6c0bde80-100b-446d-9a6e-8587761bf4c4'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/028d2c85-ca31-426d-b5d1-2cef545a4902/_history/eadfd8c3-d869-4394-8d74-b1fc4ea620a3',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_JWMRGwDBXK'
                }
              ],
              name: 'Ibombo District Office',
              alias: ['Ibombo District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/e76fbe62-bd35-44cf-ad0b-9242db1d3085'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-15T08:04:40.311+00:00',
                versionId: 'eadfd8c3-d869-4394-8d74-b1fc4ea620a3'
              },
              id: '028d2c85-ca31-426d-b5d1-2cef545a4902'
            },
            request: {
              method: 'PUT',
              url: 'Location/028d2c85-ca31-426d-b5d1-2cef545a4902'
            }
          },
          {
            fullUrl:
              'http://config:2021/location/27614343-3709-41a7-bf2e-e81356322980/_history/af06e089-462b-4a55-8396-a6d9056d39b0',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_HKASqwkASD'
                }
              ],
              name: 'Itambo District Office',
              alias: ['Itambo District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/7e136ce5-4912-4263-a905-a49856b73db4'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.921+00:00',
                versionId: 'af06e089-462b-4a55-8396-a6d9056d39b0'
              },
              id: '27614343-3709-41a7-bf2e-e81356322980'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/8b1f31e3-f119-4844-9566-2cba2fa55b9a/_history/f164ccd8-4a7f-4b7e-9b39-99407f330825',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_eaBXhNiLMp'
                }
              ],
              name: 'Ezhi District Office',
              alias: ['Ezhi District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/a4095970-285b-43c8-9f42-cca6d15c8b13'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.924+00:00',
                versionId: 'f164ccd8-4a7f-4b7e-9b39-99407f330825'
              },
              id: '8b1f31e3-f119-4844-9566-2cba2fa55b9a'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/c5545f76-1888-49e1-8147-71f3c316f6dd/_history/88ff674b-987e-4ada-aec7-f59a4d7ae6f5',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_okQp4uKCz0'
                }
              ],
              name: 'Ilanga District Office',
              alias: ['Ilanga District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/20ecc580-1f66-4489-8aea-08e386af624b'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.926+00:00',
                versionId: '88ff674b-987e-4ada-aec7-f59a4d7ae6f5'
              },
              id: 'c5545f76-1888-49e1-8147-71f3c316f6dd'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/a83da9a2-16af-416c-ab44-cf4f60b5603a/_history/76072e03-8c51-43f3-a02a-f7ed2ac6407f',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_R5n2eHaSpB'
                }
              ],
              name: 'Irundu District Office',
              alias: ['Irundu District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/a97af8a8-a531-4229-bf5e-c30b78c31561'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.928+00:00',
                versionId: '76072e03-8c51-43f3-a02a-f7ed2ac6407f'
              },
              id: 'a83da9a2-16af-416c-ab44-cf4f60b5603a'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/eaeb093d-e548-4848-b7d6-bc8fd029a8c1/_history/ebfbd22d-cbbe-4486-9624-c94e899ab3b3',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_GzanivmNaP'
                }
              ],
              name: 'Zobwe District Office',
              alias: ['Zobwe District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/d16d86dc-019d-46a4-9904-53775c16f6ae'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.930+00:00',
                versionId: 'ebfbd22d-cbbe-4486-9624-c94e899ab3b3'
              },
              id: 'eaeb093d-e548-4848-b7d6-bc8fd029a8c1'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/72e3de8d-cb9c-4f92-833e-d6889eac1d72/_history/b697a197-49e2-4aea-aa2a-5dab80195f7a',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_2stAtvOCwl'
                }
              ],
              name: 'Afue District Office',
              alias: ['Afue District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/67ad6b78-2419-4bb1-bc05-28498a72ea03'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.932+00:00',
                versionId: 'b697a197-49e2-4aea-aa2a-5dab80195f7a'
              },
              id: '72e3de8d-cb9c-4f92-833e-d6889eac1d72'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/6510890e-610d-4805-94da-82164ceadc42/_history/cef5fa77-229c-4260-8b34-930ab82a9d40',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_p9TC08l373'
                }
              ],
              name: 'Embe District Office',
              alias: ['Embe District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/5ef450bc-712d-48ad-93f3-8da0fa453baa'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.934+00:00',
                versionId: 'cef5fa77-229c-4260-8b34-930ab82a9d40'
              },
              id: '6510890e-610d-4805-94da-82164ceadc42'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/9f764b20-ad33-4714-a572-a7731b24b183/_history/44fbdc19-0de1-4953-b453-2470b8467229',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_Hal1YwlBw7'
                }
              ],
              name: 'Ienge District Office',
              alias: ['Ienge District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/0a25463f-675c-4600-a685-c090ebd8ce0e'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.936+00:00',
                versionId: '44fbdc19-0de1-4953-b453-2470b8467229'
              },
              id: '9f764b20-ad33-4714-a572-a7731b24b183'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/79738b3f-f31a-40d1-8b55-63e08ceb213c/_history/39e25b27-fd98-4e12-8186-502ada7a6f93',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_OgMqVlKHoN'
                }
              ],
              name: 'Funabuli District Office',
              alias: ['Funabuli District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/2ad5e894-0a25-4fc6-b0a1-a0ac35be7c5d'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.938+00:00',
                versionId: '39e25b27-fd98-4e12-8186-502ada7a6f93'
              },
              id: '79738b3f-f31a-40d1-8b55-63e08ceb213c'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/9ec401ec-0de1-4bec-96bc-a2846a61419a/_history/22705052-e7d5-4b52-b519-1120fd3a3ed3',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_FHTLilSEgD'
                }
              ],
              name: 'Pili District Office',
              alias: ['Pili District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/4c6cbac1-7b94-4dcb-b8ba-4c69cd474e6a'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.940+00:00',
                versionId: '22705052-e7d5-4b52-b519-1120fd3a3ed3'
              },
              id: '9ec401ec-0de1-4bec-96bc-a2846a61419a'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/db07dc32-2280-4705-8b5f-54044b29f8b2/_history/d88c3572-ad7f-42d9-a0ed-eff8019744eb',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_jMEPmtRKQ9'
                }
              ],
              name: 'Ama District Office',
              alias: ['Ama District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/6ae4ce7e-3a50-4813-af7e-66da42a0c96e'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.942+00:00',
                versionId: 'd88c3572-ad7f-42d9-a0ed-eff8019744eb'
              },
              id: 'db07dc32-2280-4705-8b5f-54044b29f8b2'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/8eefa8d1-c13d-4a56-9965-bdc73b263432/_history/366ddcd7-2174-487b-8469-fc7289051421',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_hfFdA2JI3T'
                }
              ],
              name: 'Nsali District Office',
              alias: ['Nsali District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/6cb00437-29d7-44a8-ad8a-15a2866fef03'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.945+00:00',
                versionId: '366ddcd7-2174-487b-8469-fc7289051421'
              },
              id: '8eefa8d1-c13d-4a56-9965-bdc73b263432'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/97151a9d-3223-449f-8115-f4361fc1a6f2/_history/3128d669-3a4b-441e-8667-054da265e503',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_mNCAv7oKj8'
                }
              ],
              name: 'Soka District Office',
              alias: ['Soka District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/dc249283-09d7-47f4-bfeb-df366cfc1d04'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.947+00:00',
                versionId: '3128d669-3a4b-441e-8667-054da265e503'
              },
              id: '97151a9d-3223-449f-8115-f4361fc1a6f2'
            },
            request: { method: 'POST', url: 'Location' }
          },
          {
            fullUrl:
              'http://config:2021/location/e8d52f39-6792-4f61-b247-9a1177fe074c/_history/93cf6fea-ac50-45e5-8314-292b299bb165',
            resource: {
              resourceType: 'Location',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/internal-id',
                  value: 'CRVS_OFFICE_H0EaOnzz0a'
                }
              ],
              name: 'Chibiya District Office',
              alias: ['Chibiya District Office'],
              status: 'active',
              mode: 'instance',
              partOf: {
                reference: 'Location/678fe2f7-c77c-4681-9348-681ab2351162'
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
                coding: [{ code: 'bu', display: 'Building' }]
              },
              meta: {
                lastUpdated: '2025-01-08T09:00:36.949+00:00',
                versionId: '93cf6fea-ac50-45e5-8314-292b299bb165'
              },
              id: 'e8d52f39-6792-4f61-b247-9a1177fe074c'
            },
            request: { method: 'POST', url: 'Location' }
          }
        ]
      })
    })
  ],
  modules: [
    http.get('http://localhost:3040/conditionals.js', () => {
      return HttpResponse.text('', { status: 404 })
    }),
    http.get('http://localhost:3040/handlebars.js', () => {
      return HttpResponse.text('', { status: 404 })
    }),
    http.get('http://localhost:3040/validators.js', () => {
      return HttpResponse.text('export function noop() {}', {
        status: 200,
        headers: {
          'content-type': 'application/javascript'
        }
      })
    })
  ],
  config: [
    http.get(
      'http://localhost:6006/api/countryconfig/certificates/tennis-club-membership-certificate.svg',
      () => {
        return HttpResponse.text(
          tennisClubMembershipCertifiedCertificateTemplate
        )
      }
    ),
    http.get(
      'http://localhost:6006/api/countryconfig/certificates/tennis-club-membership-certified-certificate.svg',
      () => {
        return HttpResponse.text(
          tennisClubMembershipCertifiedCertificateTemplate
        )
      }
    ),

    http.get(
      'http://localhost:6006/api/countryconfig/fonts/NotoSans-Regular.ttf',
      async () => {
        const fontResponse = await fetch(
          'http://localhost:3040/fonts/NotoSans-Regular.ttf'
        )
        const fontArrayBuffer = await fontResponse.arrayBuffer()
        return HttpResponse.arrayBuffer(fontArrayBuffer)
      }
    ),

    http.get('http://localhost:2021/config', () => {
      return HttpResponse.json({
        systems: [],
        config: mockOfflineData.config,
        certificates: [
          {
            id: 'tennis-club-membership-certificate',
            event: 'TENNIS_CLUB_MEMBERSHIP',
            label: {
              id: 'certificates.tennis-club-membership.certificate.copy',
              defaultMessage: 'Tennis Club Membership Certificate copy',
              description: 'The label for a tennis-club-membership certificate'
            },
            isDefault: false,
            fee: {
              onTime: 7,
              late: 10.6,
              delayed: 18
            },
            svgUrl:
              '/api/countryconfig/certificates/tennis-club-membership-certificate.svg',
            fonts: {
              'Noto Sans': {
                normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
                bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
                italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
                bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
              }
            }
          },
          {
            id: 'tennis-club-membership-certified-certificate',
            event: 'TENNIS_CLUB_MEMBERSHIP',
            label: {
              id: 'certificates.tennis-club-membership.certificate.certified-copy',
              defaultMessage:
                'Tennis Club Membership Certificate certified copy',
              description: 'The label for a tennis-club-membership certificate'
            },
            isDefault: false,
            fee: {
              onTime: 7,
              late: 10.6,
              delayed: 18
            },
            svgUrl:
              '/api/countryconfig/certificates/tennis-club-membership-certified-certificate.svg',
            fonts: {
              'Noto Sans': {
                normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
                bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
                italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
                bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
              }
            }
          }
        ]
      })
    })
  ],
  localisations: [
    http.get('http://localhost:3040/content/client', () => {
      return HttpResponse.json({
        languages: [
          {
            lang: 'en',
            messages: {}
          },
          {
            lang: 'fr',
            messages: {}
          }
        ]
      })
    })
  ],
  forms: [
    http.get('http://localhost:2021/forms', () => {
      return HttpResponse.json(forms.forms)
    })
  ]
}
