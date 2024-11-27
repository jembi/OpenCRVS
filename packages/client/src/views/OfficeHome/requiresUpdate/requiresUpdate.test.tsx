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
  DOWNLOAD_STATUS,
  makeDeclarationReadyToDownload,
  storeDeclaration
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  resizeWindow,
  REGISTRATION_AGENT_DEFAULT_SCOPES,
  setScopes,
  REGISTRAR_DEFAULT_SCOPES
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import { ReactWrapper } from 'enzyme'
import { merge } from 'lodash'
import * as React from 'react'
import { RequiresUpdate } from './RequiresUpdate'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { formattedDuration } from '@client/utils/date-formatting'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { birthDeclarationForReview } from '@client/tests/mock-graphql-responses'
import { vi } from 'vitest'

const mockFetchUserDetails = vi.fn()
const mockListSyncController = vi.fn()

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
      role: {
        _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
        labels: [
          {
            lang: 'en',
            label: 'DISTRICT_REGISTRAR'
          }
        ]
      }
    }
  }
}

const TIME_STAMP = '1544188309380'

const mockUserData = {
  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
  type: EventType.Birth,
  registration: {
    status: 'REJECTED',
    contactNumber: '01622688231',
    trackingId: 'BW0UTHR',
    registrationNumber: null,
    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
    duplicates: null,
    createdAt: TIME_STAMP,
    modifiedAt: TIME_STAMP
  },
  dateOfBirth: '2010-10-10',
  childName: [
    {
      firstNames: 'Iliyas',
      familyName: 'Khan',
      use: 'en'
    },
    {
      firstNames: 'ইলিয়াস',
      familyName: 'খান',
      use: 'bn'
    }
  ],
  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
  child: {
    id: 'FAKE_ID',
    name: [
      {
        firstNames: 'Iliyas',
        familyName: 'Khan',
        use: 'en'
      },
      {
        firstNames: 'ইলিয়াস',
        familyName: 'খান',
        use: 'bn'
      }
    ],
    birthDate: '2010-10-10'
  },
  deceased: {
    name: [
      {
        use: '',
        firstNames: '',
        familyName: ''
      }
    ],
    deceased: {
      deathDate: ''
    }
  },
  informant: {
    individual: {
      telecom: [
        {
          system: '',
          use: '',
          value: ''
        }
      ]
    }
  },
  dateOfDeath: null,
  deceasedName: null,
  createdAt: '2018-05-23T14:44:58+02:00'
}
const userData: any = []
for (let i = 0; i < 14; i++) {
  userData.push(mockUserData)
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = vi.fn()
storage.setItem = vi.fn()

describe('OfficeHome sent for update tab related tests', () => {
  const { store, history } = createStore()
  const client = createClient(store)

  beforeAll(async () => {
    setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)
  })

  it('renders all items returned from graphql query in sent for update tab', async () => {
    const TIME_STAMP = '1544188309380'

    const birthEventRejectedDate = '2019-10-20T11:03:20.660Z'

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RequiresUpdate
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: EventType.Birth,
                registration: {
                  status: 'REJECTED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  duplicates: [null],
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP + 1
                },
                operationHistories: [
                  {
                    operationType: 'REJECTED',
                    operatedOn: '2021-10-20T11:03:20.660Z',
                    operatorRole: 'LOCAL_REGISTRAR',
                    operatorName: [
                      {
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful',
                        use: 'en'
                      },
                      {
                        firstNames: '',
                        familyName: '',
                        use: 'bn'
                      }
                    ],
                    operatorOfficeName: 'Alokbali Union Parishad',
                    operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ']
                  }
                ],
                dateOfBirth: '2010-10-10',
                childName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLBirthEventSearchSet,
              {
                id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                type: EventType.Death,
                registration: {
                  status: 'REJECTED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  contactNumber: '01622688231',
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                operationHistories: [
                  {
                    operationType: 'REJECTED',
                    operatedOn: birthEventRejectedDate,
                    operatorRole: 'LOCAL_REGISTRAR',
                    operatorName: [
                      {
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful',
                        use: 'en'
                      },
                      {
                        firstNames: '',
                        familyName: '',
                        use: 'bn'
                      }
                    ],
                    operatorOfficeName: 'Alokbali Union Parishad',
                    operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ']
                  }
                ],
                dateOfDeath: '2007-01-01',
                deceasedName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLDeathEventSearchSet
            ]
          }
        }}
      />,
      { store, history }
    )

    const table = await waitForElement(testComponent, Workqueue)
    const data = table.prop('content')
    const EXPECTED_DATE_OF_REJECTION = formattedDuration(
      new Date('2021-10-20T11:03:20.660Z')
    )

    expect(data.length).toBe(2)
    expect(data[1].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[1].contactNumber).toBe('01622688231')
    expect(data[1].sentForUpdates).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Birth')
    expect(data[1].actions).toBeDefined()
  })

  it('returns an empty array incase of invalid graphql query response', async () => {
    Date.now = vi.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RequiresUpdate
        queryData={{
          data: {
            totalItems: 2,
            results: []
          }
        }}
      />,
      { store, history }
    )

    const table = await waitForElement(testComponent, Workqueue)

    const data = table.prop('content')
    expect(data.length).toBe(0)
  })

  describe('handles download status', () => {
    let testComponent: ReactWrapper<{}, {}>
    let createdTestComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const TIME_STAMP = '1544188309380'
      Date.now = vi.fn(() => 1554055200000)

      mockListSyncController
        .mockReturnValueOnce({
          data: {
            inProgressTab: { totalItems: 0, results: [] },
            notificationTab: { totalItems: 0, results: [] },
            reviewTab: { totalItems: 0, results: [] },
            rejectTab: {
              totalItems: 2,
              results: [
                {
                  id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                  type: EventType.Birth,
                  registration: {
                    status: 'REJECTED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    eventLocationId: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP + 1
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: EventType.Death,
                  registration: {
                    status: 'REJECTED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    eventLocationId: null,
                    contactNumber: '01622688231',
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ]
                }
              ]
            },
            approvalTab: { totalItems: 0, results: [] },
            printTab: { totalItems: 0, results: [] },
            externalValidationTab: { totalItems: 0, results: [] }
          }
        })
        .mockReturnValueOnce({
          data: {
            fetchBirthRegistration: birthDeclarationForReview
          }
        })
      client.query = mockListSyncController

      createdTestComponent = await createTestComponent(
        // @ts-ignore
        <OfficeHome
          match={{
            params: {
              tabId: WORKQUEUE_TABS.requiresUpdate
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history, apolloClient: client }
      )
      testComponent = createdTestComponent
      setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)
    })

    it('downloads the declaration after clicking download button', async () => {
      const downloadButton = await waitForElement(
        testComponent,
        '#ListItemAction-0-icon'
      )

      downloadButton.hostNodes().simulate('click')

      testComponent.update()

      expect(testComponent.find('#assignment').hostNodes()).toHaveLength(1)
      testComponent.find('#assign').hostNodes().simulate('click')

      const action = await waitForElement(
        testComponent,
        '#ListItemAction-0-Update'
      )
      action.hostNodes().simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      expect(history.location.pathname).toBe(
        '/reviews/9a55d213-ad9f-4dcd-9418-340f3a7f6269/events/birth/parent/review'
      )
    })

    it('shows error when download is failed', async () => {
      const downloadedDeclaration = makeDeclarationReadyToDownload(
        EventType.Death,
        'bc09200d-0160-43b4-9e2b-5b9e90424e95',
        DownloadAction.LOAD_REVIEW_DECLARATION
      )
      downloadedDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
      store.dispatch(storeDeclaration(downloadedDeclaration))
      testComponent.update()
      expect(
        testComponent.find('#ListItemAction-1-icon-failed').hostNodes()
      ).toHaveLength(1)
    })
  })
})

describe('Tablet tests', () => {
  const { store, history } = createStore()

  beforeAll(async () => {
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
    resizeWindow(800, 1280)
  })

  afterEach(() => {
    resizeWindow(1024, 768)
  })

  it('redirects to recordAudit page if item is clicked', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = vi.fn(() => 1554055200000)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RequiresUpdate
        queryData={{
          data: {
            totalItems: 2,
            results: [
              {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                type: EventType.Birth,
                registration: {
                  status: 'REJECTED',
                  contactNumber: '01622688231',
                  trackingId: 'BW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  duplicates: [null],
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP + 1
                },
                dateOfBirth: '2010-10-10',
                childName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLBirthEventSearchSet,
              {
                id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                type: EventType.Death,
                registration: {
                  status: 'REJECTED',
                  trackingId: 'DW0UTHR',
                  registrationNumber: undefined,
                  eventLocationId: undefined,
                  contactNumber: '01622688231',
                  duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                  registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
                  createdAt: TIME_STAMP,
                  modifiedAt: TIME_STAMP
                },
                dateOfDeath: '2007-01-01',
                deceasedName: [
                  {
                    firstNames: 'Iliyas',
                    familyName: 'Khan',
                    use: 'en'
                  },
                  {
                    firstNames: 'ইলিয়াস',
                    familyName: 'খান',
                    use: 'bn'
                  }
                ]
              } as GQLDeathEventSearchSet
            ]
          }
        }}
      />,
      { store, history }
    )

    const element = await waitForElement(testComponent, '#name_0')
    element.hostNodes().simulate('click')

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.update()

    expect(window.location.href).toContain(
      '/record-audit/rejectTab/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    )
  })
})
