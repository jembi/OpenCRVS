import * as React from 'react'
import { WorkQueue, FETCH_REGISTRATION_QUERY } from './WorkQueue'
import { createTestComponent, mockUserResponse } from 'src/tests/util'
import { createStore } from 'src/store'
import {
  Spinner,
  DataTable,
  ListItem
} from '@opencrvs/components/lib/interface'
import { checkAuth } from '@opencrvs/register/src/profile/profileActions'
import { queries } from 'src/profile/queries'
import { merge } from 'lodash'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'DISTRICT_REGISTRAR'
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

describe('WorkQueue tests', async () => {
  const { store, history } = createStore()
  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(Spinner)).toBe(true)

    testComponent.component.unmount()
  })

  it('renders all items returned from graphql query', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_QUERY,
          variables: {
            status: '',
            event: '',
            skip: 0,
            count: 10
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  registration: {
                    id: '123',
                    registrationNumber: null,
                    trackingId: 'B111111',
                    duplicates: null,
                    type: 'BIRTH',
                    status: [
                      {
                        id: '123',
                        timestamp: '2018-12-07T13:11:49.380Z',
                        user: {
                          id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Mohammad',
                              familyName: 'Ashraful'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: ''
                            }
                          ],
                          role: 'LOCAL_REGISTRAR'
                        },
                        location: {
                          id: '123',
                          name: 'Kaliganj Union Sub Center',
                          alias: ['']
                        },
                        office: {
                          id: '123',
                          name: 'Kaliganj Union Sub Center',
                          alias: [''],
                          address: {
                            district: '7876',
                            state: 'iuyiuy'
                          }
                        },
                        type: 'REGISTERED',
                        comments: [
                          {
                            comment: ''
                          }
                        ]
                      }
                    ]
                  },
                  child: {
                    id: '123',
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'অনিক'
                      }
                    ],
                    birthDate: null
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                },
                {
                  id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
                  registration: {
                    id: '123',
                    registrationNumber: null,
                    trackingId: 'B222222',
                    type: 'DEATH',
                    duplicates: null,
                    status: [
                      {
                        id: '123',
                        timestamp: '2018-12-07T13:11:49.380Z',
                        user: {
                          id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                          name: [
                            {
                              use: 'en',
                              firstNames: 'Mohammad',
                              familyName: 'Ashraful'
                            },
                            {
                              use: 'bn',
                              firstNames: '',
                              familyName: ''
                            }
                          ],
                          role: 'LOCAL_REGISTRAR'
                        },
                        location: {
                          id: '123',
                          name: 'Kaliganj Union Sub Center',
                          alias: ['']
                        },
                        office: {
                          id: '123',
                          name: 'Kaliganj Union Sub Center',
                          alias: [''],
                          address: {
                            district: '7876',
                            state: 'iuyiuy'
                          }
                        },
                        type: 'REGISTERED',
                        comments: [
                          {
                            comment: ''
                          }
                        ]
                      }
                    ]
                  },
                  deceased: {
                    id: '123',
                    name: [
                      {
                        use: 'bn',
                        firstNames: '',
                        familyName: 'মাসুম'
                      }
                    ],
                    deceased: {
                      deathDate: '2010-10-10'
                    }
                  },
                  createdAt: '2018-05-23T14:44:58+02:00'
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(declareScope)
    testComponent.store.dispatch(checkAuth({ '?token': declareScope }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(DataTable).prop('data')
    expect(data).toEqual([
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        name: 'অনিক',
        dob: '',
        dod: '',
        date_of_application: '23-05-2018',
        registrationNumber: '',
        tracking_id: 'B111111',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'BIRTH',
        duplicates: null,
        status: [
          {
            officeName: 'Kaliganj Union Sub Center',
            timestamp: '07-12-2018',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'Registrar'
          }
        ],
        rejection_reason: '',
        location: 'Kaliganj Union Sub Center'
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        name: 'মাসুম',
        dob: '',
        dod: '10-10-2010',
        date_of_application: '23-05-2018',
        registrationNumber: '',
        tracking_id: 'B222222',
        createdAt: '2018-05-23T14:44:58+02:00',
        declaration_status: 'REGISTERED',
        event: 'DEATH',
        duplicates: null,
        status: [
          {
            officeName: 'Kaliganj Union Sub Center',
            timestamp: '07-12-2018',
            type: 'REGISTERED',
            practitionerName: 'Mohammad Ashraful',
            practitionerRole: 'Registrar'
          }
        ],
        rejection_reason: '',
        location: 'Kaliganj Union Sub Center'
      }
    ])

    testComponent.component.unmount()
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: FETCH_REGISTRATION_QUERY,
          variables: {
            status: '',
            event: '',
            skip: 0,
            count: 10
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <WorkQueue />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#work-queue-error-text')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  describe('WorkQueue tests for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
    })
    it('renders review and register button for user with register scope', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              status: '',
              event: '',
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'DECLARED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  }
                ]
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#reviewAndRegisterBtn_B111111')
          .hostNodes().length
      ).toBe(1)
      testComponent.component
        .find(DataTable)
        .find('#reviewAndRegisterBtn_B111111')
        .hostNodes()
        .simulate('click')

      testComponent.component
        .find(DataTable)
        .find('button')
        .at(1)
        .hostNodes()
        .simulate('click')

      expect(
        testComponent.component
          .find('#new_registration')
          .hostNodes()
          .text()
      ).toContain('New registration')

      testComponent.component.unmount()
    })

    it('Should Render Print Certificate & Edit button', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              status: '',
              event: '',
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'REGISTERED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  }
                ]
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#editBtn_B111111')
          .hostNodes().length
      ).toBe(1)

      expect(
        testComponent.component
          .find(DataTable)
          .find('#printCertificate_B111111')
          .hostNodes().length
      ).toBe(1)

      testComponent.component.unmount()
    })

    it('Should Render Certificate Collection Screen', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              status: '',
              event: '',
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 4,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'REGISTERED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        },
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'APPLICATION',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        },
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'COLLECTED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        },
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'REJECTED',
                          comments: [
                            {
                              comment: 'reason=duplicate,other&comment=lol'
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  },
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be815',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B2222',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'APPLICATION',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  },
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be816',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B33333',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'REJECTED',
                          comments: [
                            {
                              comment:
                                'reason=misspelling,missing_supporting_doc,duplicate,other&comment=lol'
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  },
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be817',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B444444',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'COLLECTED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  }
                ]
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .at(0)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      const PrintBtn = testComponent.component
        .find(DataTable)
        .find('#printCertificate_B111111')
      expect(PrintBtn.hostNodes().length).toBe(1)

      PrintBtn.hostNodes().simulate('click')
      testComponent.component.update()

      expect(
        testComponent.component.find('#personCollectingCertificate_label')
          .length
      ).toBe(0)

      testComponent.component.unmount()
    })
  })

  describe('WorkQueue tests with duplicates for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth({ '?token': registerScopeToken }))
    })
    it('renders review duplicates button for user with register scope', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              status: '',
              event: '',
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: ['e302f7c5-ad87-4117-91c1-35eaf2ea7be8'],
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'DECLARED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  }
                ]
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#reviewDuplicatesBtn_B111111')
          .hostNodes().length
      ).toBe(1)

      testComponent.component
        .find(DataTable)
        .find('#reviewDuplicatesBtn_B111111')
        .hostNodes()
        .simulate('click')

      expect(history.location.pathname).toContain('duplicates')
    })
  })

  describe('WorkQueue tests for declare scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(declareScope)
      store.dispatch(checkAuth({ '?token': declareScope }))
    })
    it('does not render review and register button for user with declare scope', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION_QUERY,
            variables: {
              status: '',
              event: '',
              skip: 0,
              count: 10
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                    registration: {
                      id: '123',
                      registrationNumber: null,
                      trackingId: 'B111111',
                      type: 'BIRTH',
                      duplicates: null,
                      status: [
                        {
                          id: '123',
                          timestamp: null,
                          user: {
                            id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                            name: [
                              {
                                use: 'en',
                                firstNames: 'Mohammad',
                                familyName: 'Ashraful'
                              },
                              {
                                use: 'bn',
                                firstNames: '',
                                familyName: ''
                              }
                            ],
                            role: 'LOCAL_REGISTRAR'
                          },
                          location: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: ['']
                          },
                          office: {
                            id: '123',
                            name: 'Kaliganj Union Sub Center',
                            alias: [''],
                            address: {
                              district: '7876',
                              state: 'iuyiuy'
                            }
                          },
                          type: 'CERTIFIED',
                          comments: [
                            {
                              comment: ''
                            }
                          ]
                        }
                      ]
                    },
                    child: {
                      id: '123',
                      name: [
                        {
                          use: null,
                          firstNames: 'Baby',
                          familyName: 'Doe'
                        }
                      ],
                      birthDate: null
                    },
                    createdAt: '2018-05-23T14:44:58+02:00'
                  }
                ]
              }
            }
          }
        }
      ]

      const testComponent = createTestComponent(
        // @ts-ignore
        <WorkQueue />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()

      const instance = testComponent.component
        .find(DataTable)
        .find(ListItem)
        .instance() as any

      instance.toggleExpanded()
      testComponent.component.update()

      expect(
        testComponent.component
          .find(DataTable)
          .find('#reviewAndRegisterBtn_B111111')
          .hostNodes().length
      ).toBe(0)

      testComponent.component
        .find(DataTable)
        .find('button')
        .at(0)
        .simulate('click')

      expect(
        testComponent.component
          .find('#new_registration')
          .hostNodes()
          .text()
      ).toContain('New application')

      testComponent.component.unmount()
    })
  })
})
