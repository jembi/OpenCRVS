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
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import {
  createDeclaration,
  IDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS,
  makeDeclarationReadyToDownload,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import {
  REGISTRAR_HOME_TAB,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  resizeWindow,
  flushPromises,
  setScopes,
  REGISTRAR_DEFAULT_SCOPES
} from '@client/tests/util'
import { merge } from 'lodash'
import * as React from 'react'
import { InProgress, SELECTOR_ID } from './InProgress'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { formattedDuration } from '@client/utils/date-formatting'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { vi } from 'vitest'
import { History } from 'history'

const mockFetchUserDetails = vi.fn()

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

storage.getItem = vi.fn()
storage.setItem = vi.fn()

const { store, history } = createStore()

beforeAll(async () => {
  setScopes(REGISTRAR_DEFAULT_SCOPES, store)
})

describe('In Progress tab', () => {
  it('redirects to different route upon selection', async () => {
    const localDrafts = [
      {
        id: '1',
        event: EventType.Birth,
        data: {}
      },
      {
        id: '2',
        event: EventType.Birth,
        data: {}
      }
    ]
    const testComponent = await createTestComponent(
      <InProgress
        drafts={localDrafts}
        selectorId={SELECTOR_ID.ownDrafts}
        queryData={{
          inProgressData: {},
          notificationData: {}
        }}
        paginationId={{
          draftId: 1,
          fieldAgentId: 1,
          healthSystemId: 1
        }}
        pageSize={10}
        onPageChange={(pageId: number) => {}}
        loading={false}
        error={false}
      />,
      { store, history }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    const app = testComponent

    app.find(`#tab_${SELECTOR_ID.ownDrafts}`).hostNodes().simulate('click')
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toContain(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: WORKQUEUE_TABS.inProgress,
        selectorId: SELECTOR_ID.ownDrafts
      })
    )
    app
      .find(`#tab_${SELECTOR_ID.fieldAgentDrafts}`)
      .hostNodes()
      .simulate('click')
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toContain(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: WORKQUEUE_TABS.inProgress,
        selectorId: SELECTOR_ID.fieldAgentDrafts
      })
    )
  })

  it('renders two selectors with count for each', async () => {
    const localDrafts = [
      {
        id: '1',
        event: EventType.Birth,
        data: {}
      },
      {
        id: '2',
        event: EventType.Birth,
        data: {}
      }
    ]

    const testComponent = await createTestComponent(
      <InProgress
        drafts={localDrafts}
        selectorId={SELECTOR_ID.ownDrafts}
        queryData={{
          inProgressData: { totalItems: 5 },
          notificationData: { totalItems: 3 }
        }}
        paginationId={{
          draftId: 1,
          fieldAgentId: 1,
          healthSystemId: 1
        }}
        pageSize={10}
        onPageChange={(pageId: number) => {}}
      />,
      { store, history }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    const app = testComponent

    expect(app.find('#tab_you').hostNodes().text()).toContain('Yours (2)')
    expect(app.find('#tab_field-agents').hostNodes().text()).toContain(
      'Field agents (5)'
    )
  })

  describe('When the local drafts selector is selected', () => {
    it('renders all items returned from local storage in inProgress tab', async () => {
      const { store } = createStore()
      const TIME_STAMP = 1562912635549
      const drafts: IDeclaration[] = [
        {
          id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
          data: {
            registration: {
              informantType: 'MOTHER',
              informant: 'MOTHER_ONLY',
              registrationPhone: '01722222222',
              whoseContactDetails: 'MOTHER'
            },
            child: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: EventType.Birth,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        },
        {
          id: 'e6605607-92e0-4625-87d8-c168205bdde7',
          event: EventType.Birth,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            registration: {
              informantType: 'MOTHER',
              informant: 'MOTHER_ONLY',
              registrationPhone: '01722222222',
              whoseContactDetails: 'MOTHER'
            },
            child: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: EventType.Death,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        },

        {
          id: '607afa75-4fb0-4785-9388-724911d62809',
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: EventType.Death,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        }
      ]
      // @ts-ignore
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          queryData={{
            inProgressData: {},
            notificationData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      const data = testComponent
        .find(Workqueue)
        .prop<Array<Record<string, string>>>('content')
      const EXPECTED_DATE_OF_REJECTION = formattedDuration(TIME_STAMP)

      expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
      expect(data[0].name).toBe('anik hoque')
      expect(data[0].lastUpdated).toBe(EXPECTED_DATE_OF_REJECTION)
      expect(data[0].event).toBe('Birth')
      expect(data[0].actions).toBeDefined()
    })

    it('Should render pagination in progress tab if data is more than 10', async () => {
      vi.clearAllMocks()
      const drafts: IDeclaration[] = []
      for (let i = 0; i < 12; i++) {
        drafts.push(createDeclaration(EventType.Birth))
      }
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          queryData={{
            inProgressData: {},
            notificationData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const pagiBtn = testComponent.find('#pagination_container')

      expect(pagiBtn.hostNodes()).toHaveLength(1)
      testComponent
        .find('#pagination button')
        .last()
        .hostNodes()
        .simulate('click')
    })

    it('redirects user to detail page on update click', async () => {
      const TIME_STAMP = 1562912635549
      const drafts: IDeclaration[] = [
        {
          id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
          event: EventType.Birth,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            registration: {
              contactPoint: {
                value: 'MOTHER',
                nestedFields: {
                  registrationPhone: '01722222222'
                }
              }
            },
            child: {
              firstNamesEng: 'Anik',
              firstNames: 'অনিক',
              familyNameEng: 'Hoque',
              familyName: 'অনিক'
            }
          }
        },
        {
          id: 'bd22s7c5-ad87-4117-91c1-35eaf2ese32bw',
          event: EventType.Birth,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP,
          data: {
            child: {
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
          event: EventType.Death,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f2',
          event: EventType.Death,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            deceased: {
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f4',
          event: EventType.Death,
          modifiedOn: TIME_STAMP + 1,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            '': {}
          }
        }
      ]
      // @ts-ignore
      store.dispatch(storeDeclaration(drafts))
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          queryData={{
            inProgressData: {},
            notificationData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      expect(
        testComponent.find('#ListItemAction-0-Update').hostNodes()
      ).toHaveLength(1)
      testComponent
        .find('#ListItemAction-0-Update')
        .hostNodes()
        .simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      expect(history.location.pathname).toContain(
        '/drafts/cc66d69c-7f0a-4047-9283-f066571830f4'
      )
    })
  })

  describe('When the remote drafts selector is selected', () => {
    it('renders all items returned from graphql query in inProgress tab', async () => {
      const TIME_STAMP = '1562912635549'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: {
              totalItems: 1,
              results: [
                {
                  id: '956281c9-1f47-4c26-948a-970dd23c4094',
                  type: EventType.Death,
                  registration: {
                    status: 'IN_PROGRESS',
                    contactNumber: undefined,
                    trackingId: 'DG6PECX',
                    registrationNumber: undefined,
                    eventLocationId: undefined,
                    registeredLocationId:
                      'd8cfd240-4b5a-4557-9df7-b1591a11d843',
                    duplicates: [null],
                    createdAt: TIME_STAMP,
                    modifiedAt: undefined
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: '2019-10-20T11:03:20.660Z',
                      operatorRole: 'FIELD_AGENT',
                      operatorName: [
                        {
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful',
                          use: 'en'
                        },
                        {
                          firstNames: '',
                          familyName: null,
                          use: 'bn'
                        }
                      ],
                      operatorOfficeName: 'Alokbali Union Parishad',
                      operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ']
                    }
                  ],
                  dateOfDeath: '2019-01-18',
                  deceasedName: [
                    {
                      use: 'bn',
                      firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'K M Abdullah al amin',
                      familyName: 'Khan'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            },
            notificationData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      const data = testComponent
        .find(Workqueue)
        .prop<Array<Record<string, string>>>('content')
      const EXPECTED_DATE_OF_REJECTION = formattedDuration(Number(TIME_STAMP))
      expect(data[0].id).toBe('956281c9-1f47-4c26-948a-970dd23c4094')
      expect(data[0].name).toBe('k m abdullah al amin khan')
      expect(data[0].notificationSent).toBe(EXPECTED_DATE_OF_REJECTION)
      expect(data[0].event).toBe('Death')
    })

    it('Should render pagination in progress tab if data is more than 10', async () => {
      vi.clearAllMocks()
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: { totalItems: 12 },
            notificationData: { totalItems: 2 }
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const pagiBtn = testComponent.find('#pagination_container')

      expect(pagiBtn.hostNodes()).toHaveLength(1)
      testComponent
        .find('#pagination button')
        .last()
        .hostNodes()
        .simulate('click')
    })

    it('redirects to recordAudit page when item is clicked', async () => {
      vi.clearAllMocks()
      const TIME_STAMP = '1562912635549'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      // @ts-ignore
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.hospitalDrafts}
          queryData={{
            inProgressData: {},
            notificationData: {
              totalItems: 1,
              results: [
                {
                  id: '956281c9-1f47-4c26-948a-970dd23c4094',
                  type: EventType.Death,
                  registration: {
                    status: 'IN_PROGRESS',
                    contactNumber: undefined,
                    trackingId: 'DG6PECX',
                    registrationNumber: undefined,
                    eventLocationId: undefined,
                    registeredLocationId:
                      'd8cfd240-4b5a-4557-9df7-b1591a11d843',
                    duplicates: [null],
                    createdAt: TIME_STAMP,
                    modifiedAt: undefined
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: '2019-10-20T11:03:20.660Z',
                      operatorRole: 'FIELD_AGENT',
                      operatorName: [
                        {
                          firstNames: 'Mohammad',
                          familyName: 'Ashraful',
                          use: 'en'
                        },
                        {
                          firstNames: '',
                          familyName: null,
                          use: 'bn'
                        }
                      ],
                      operatorOfficeName: 'Alokbali Union Parishad',
                      operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                      notificationFacilityName:
                        'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar',
                      notificationFacilityAlias: [
                        'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar'
                      ]
                    }
                  ],
                  dateOfDeath: '2019-01-18',
                  deceasedName: [
                    {
                      use: 'bn',
                      firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                      familyName: 'খান'
                    },
                    {
                      use: 'en',
                      firstNames: 'K M Abdullah al amin',
                      familyName: 'Khan'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            }
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      testComponent.find('#name_0').hostNodes().simulate('click')

      await flushPromises()
      testComponent.update()

      expect(window.location.href).toContain(
        '/record-audit/notificationTab/956281c9-1f47-4c26-948a-970dd23c4094'
      )
    })

    describe('handles download status', () => {
      let store: AppStore
      let history: History
      const TIME_STAMP = '1562912635549'
      const declarationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      const inprogressProps = {
        drafts: [],
        selectorId: SELECTOR_ID.fieldAgentDrafts,
        registrarLocationId: '0627c48a-c721-4ff9-bc6e-1fba59a2332a',
        queryData: {
          inProgressData: {
            totalItems: 1,
            results: [
              {
                id: declarationId,
                type: EventType.Birth,
                registration: {
                  trackingId: 'BQ2IDOP',
                  modifiedAt: TIME_STAMP,
                  status: 'IN_PROGRESS'
                },
                childName: [
                  {
                    use: 'en',
                    firstNames: 'Anik',
                    familyName: 'Hoque'
                  }
                ]
              } as GQLBirthEventSearchSet
            ]
          },
          notificationData: {}
        },
        isFieldAgent: false,
        paginationId: {
          draftId: 1,
          fieldAgentId: 1,
          healthSystemId: 1
        },
        pageSize: 10,
        onPageChange: (pageId: number) => {}
      }

      beforeEach(() => {
        const newStore = createStore()
        store = newStore.store
        history = newStore.history
      })

      it('renders download button when not downloaded', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = undefined
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const testComponent = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store, history }
        )

        expect(
          testComponent.find('#ListItemAction-0-icon').hostNodes()
        ).toHaveLength(1)
      })
      it('renders loading indicator when declaration is being downloaded', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADING
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const testComponent = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store, history }
        )

        expect(
          testComponent.find('#action-loading-ListItemAction-0').hostNodes()
        ).toHaveLength(1)
      })
      it('renders update button when download succeeds', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADED
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const testComponent = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store, history }
        )

        expect(
          testComponent.find('#ListItemAction-0-Update').hostNodes()
        ).toHaveLength(1)

        testComponent
          .find('#ListItemAction-0-Update')
          .hostNodes()
          .simulate('click')

        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })
        testComponent.update()

        expect(history.location.pathname).toContain(
          formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
            declarationId,
            pageId: 'review',
            event: EventType.Birth
          })
        )
      })
      it('renders error when download fails', async () => {
        const downloadableDeclaration = makeDeclarationReadyToDownload(
          EventType.Birth,
          declarationId,
          DownloadAction.LOAD_REVIEW_DECLARATION
        )
        downloadableDeclaration.downloadStatus = DOWNLOAD_STATUS.FAILED
        store.dispatch(storeDeclaration(downloadableDeclaration))
        const testComponent = await createTestComponent(
          <InProgress {...inprogressProps} />,
          { store, history }
        )
        expect(
          testComponent.find('#ListItemAction-0-icon-failed').hostNodes()
        ).toHaveLength(1)
      })
    })
  })

  describe('When Notification (Hospital) tab is selected', () => {
    it('Should render all items returned from graphQL', async () => {
      const TIME_STAMP = '1562912635549'
      const birthNotificationSentDateStr = '2019-10-20T11:03:20.660Z'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.hospitalDrafts}
          queryData={{
            notificationData: {
              totalItems: 2,
              results: [
                {
                  id: 'f0a1ca2c-6a14-4b9e-a627-c3e2e110587e',
                  type: EventType.Birth,
                  registration: {
                    trackingId: 'BQ2IDOP',
                    modifiedAt: TIME_STAMP
                  },
                  operationHistories: [
                    {
                      operationType: 'IN_PROGRESS',
                      operatedOn: birthNotificationSentDateStr,
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
                  childName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLBirthEventSearchSet,
                {
                  id: '2f7828fd-24ac-49fd-a1fd-53cda4777aa0',
                  type: EventType.Death,
                  registration: {
                    trackingId: 'DZECJZC',
                    modifiedAt: TIME_STAMP
                  },
                  deceasedName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLDeathEventSearchSet
              ]
            },
            inProgressData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
        testComponent.update()
        const data = testComponent
          .find(Workqueue)
          .prop<Array<Record<string, string>>>('content')
        const EXPECTED_DATE_OF_REJECTION = formattedDuration(
          new Date(birthNotificationSentDateStr)
        )

        expect(data[0].id).toBe('f0a1ca2c-6a14-4b9e-a627-c3e2e110587e')
        expect(data[0].name).toBe('anik hoque')
        expect(data[0].notificationSent).toBe(EXPECTED_DATE_OF_REJECTION)
        expect(data[0].event).toBe('Birth')
      })
    })
  })

  describe('Tablet tests', () => {
    const { store } = createStore()

    beforeAll(async () => {
      setScopes(REGISTRAR_DEFAULT_SCOPES, store)
      resizeWindow(800, 1280)
    })

    afterEach(() => {
      resizeWindow(1024, 768)
    })

    it('redirects to recordAudit page if item is clicked', async () => {
      vi.clearAllMocks()
      const TIME_STAMP = '1562912635549'
      const drafts: IDeclaration[] = []
      drafts.push(createDeclaration(EventType.Birth))
      const declarationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'

      // @ts-ignore
      const testComponent = await createTestComponent(
        <InProgress
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          queryData={{
            inProgressData: {
              totalItems: 1,
              results: [
                {
                  id: declarationId,
                  type: EventType.Birth,
                  registration: {
                    trackingId: 'BQ2IDOP',
                    modifiedAt: TIME_STAMP
                  },
                  childName: [
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'Hoque'
                    }
                  ]
                } as GQLBirthEventSearchSet
              ]
            },
            notificationData: {}
          }}
          paginationId={{
            draftId: 1,
            fieldAgentId: 1,
            healthSystemId: 1
          }}
          pageSize={10}
          onPageChange={(pageId: number) => {}}
        />,
        { store, history }
      )

      setScopes(REGISTRAR_DEFAULT_SCOPES, store)

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()
      testComponent.find('#name_0').hostNodes().simulate('click')

      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      testComponent.update()

      expect(window.location.href).toContain(
        '/record-audit/inProgressTab/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      )
    })
  })
})
