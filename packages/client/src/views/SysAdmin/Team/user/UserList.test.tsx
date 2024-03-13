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
import { AppStore, createStore } from '@client/store'
import {
  mockLocalSysAdminUserResponse,
  createTestComponent,
  flushPromises,
  mockOfflineDataDispatch,
  mockUserResponse
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { SEARCH_USERS } from '@client/user/queries'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { stringify } from 'query-string'
import * as React from 'react'
import { UserList } from './UserList'
import { userMutations } from '@client/user/mutations'
import * as actions from '@client/profile/profileActions'
import { offlineDataReady } from '@client/offline/actions'
import { vi, Mock } from 'vitest'

describe('user list without admin scope', () => {
  let store: AppStore
  let history: History<any>

  it('no add user button', async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store, history } = await createStore())
    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockUserResponse
    }
    await store.dispatch(action)
    await store.dispatch(offlineDataReady(mockOfflineDataDispatch))

    const userListMock = [
      {
        request: {
          query: SEARCH_USERS,
          variables: {
            primaryOfficeId: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
            count: 10
          }
        },
        result: {
          data: {
            searchUsers: {
              totalItems: 0,
              results: []
            }
          }
        }
      }
    ]

    const component = await createTestComponent(
      <UserList
        // @ts-ignore
        location={{
          search: stringify({
            locationId: '0d8474da-0361-4d32-979e-af91f012340a'
          })
        }}
      />,
      { store, history, graphqlMocks: userListMock }
    )
    component.update()
    expect(component.find('#add-user').length).toBe(0)
  })
})

describe('User list tests', () => {
  let store: AppStore
  let history: History<any>

  beforeAll(async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store, history } = await createStore())

    const action = {
      type: actions.SET_USER_DETAILS,
      payload: mockLocalSysAdminUserResponse
    }
    await store.dispatch(action)
    await store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  })

  describe('Header test', () => {
    it('add user button redirects to user form', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const component = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )
      component.update()
      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/createUserInLocation')
    })
    it('add user button redirects to office selection form for invalid location id', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const component = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )
      component.update()

      const addUser = await waitForElement(component, '#add-user')
      addUser.hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/createUser')
    })
  })

  describe('Table test', () => {
    it('renders no result text for empty user list in response', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const app = testComponent
      expect(app.find('#no-record').hostNodes()).toHaveLength(1)
    })

    describe('when there is a result from query', () => {
      userMutations.resendInvite = vi.fn()
      userMutations.usernameReminderSend = vi.fn()
      userMutations.sendResetPasswordInvite = vi.fn()
      let component: ReactWrapper<{}, {}>
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 5,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'pending',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'deactivated',
                    underInvestigation: true
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'disabled',
                    underInvestigation: false
                  }
                ]
              }
            }
          }
        }
      ]

      beforeEach(async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1100
        })
        const testComponent = await createTestComponent(
          <UserList
            // @ts-ignore
            location={{
              search: stringify({
                locationId: '0d8474da-0361-4d32-979e-af91f012340a'
              })
            }}
          />,
          { store, history, graphqlMocks: userListMock }
        )

        // wait for mocked data to load mockedProvider
        await new Promise((resolve) => {
          setTimeout(resolve, 100)
        })

        testComponent.update()
        component = testComponent
      })

      it('renders list of users', () => {
        expect(component.find('#user_list').hostNodes()).toHaveLength(1)
      })

      it('clicking on toggleMenu pops up menu options', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-0-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-0-menuItem0'
        )
        expect(menuOptionButton.hostNodes()).toHaveLength(1)
      })

      it('clicking on menu options takes to user review page', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-0-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-0-menuItem0'
        )
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        expect(history.location.pathname).toMatch(/.user\/(\w)+\/preview\/*/)
      })

      it('clicking on menu options Resend invite sends invite', async () => {
        ;(userMutations.resendInvite as Mock).mockResolvedValueOnce({
          data: { resendInvite: 'true' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-2-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-2-menuItem3'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Resend invite')
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        await waitForElement(component, '#resend_invite_success')
      })

      it('clicking on menu options Resend invite shows error if any submission error', async () => {
        ;(userMutations.resendInvite as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-2-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-2-menuItem3'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Resend invite')
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        await waitForElement(component, '#resend_invite_error')
      })

      it('clicking on menu options deactivate to user pops up audit action modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem3'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Deactivate')
        menuOptionButton.first().simulate('click')
        component.update()
        expect(component.exists('#user-audit-modal')).toBeTruthy()
      })

      it('clicking on menu options Send username reminder pop up confirmation modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem1'
        )

        expect(menuOptionButton.hostNodes().text()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
      })

      it('will send username after clicking on send button shows on modal', async () => {
        ;(userMutations.usernameReminderSend as Mock).mockResolvedValueOnce({
          data: { usernameReminder: 'iModupsy' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem1'
        )
        expect(menuOptionButton.hostNodes().text()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#username-reminder-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#username_reminder_success')
      })

      it('clicking username reminder send button shows error if any submission error', async () => {
        ;(userMutations.usernameReminderSend as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem1'
        )
        expect(menuOptionButton.hostNodes().text()).toBe(
          'Send username reminder'
        )
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#username-reminder-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#username-reminder-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#username_reminder_error')
      })

      it('clicking on menu options reactivate to user pops up audit action modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-3-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-3-menuItem1'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Reactivate')
        menuOptionButton.first().simulate('click')
        component.update()
        expect(component.exists('#user-audit-modal')).toBeTruthy()
      })

      it('clicking on menu options Reset Password pop up confirmation modal', async () => {
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem2'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Reset Password')
        menuOptionButton.hostNodes().simulate('click')
        await flushPromises()
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
      })

      it('will reset password after clicking on send button shows on modal', async () => {
        ;(userMutations.sendResetPasswordInvite as Mock).mockResolvedValueOnce({
          data: { resetPasswordInvite: 'sadman.anik' }
        })
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem2'
        )

        expect(menuOptionButton.hostNodes().text()).toBe('Reset Password')
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#reset-password-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#reset_password_success')
      })

      it('clicking reset password send button shows error if any submission error', async () => {
        ;(userMutations.sendResetPasswordInvite as Mock).mockRejectedValueOnce(
          new Error('Something went wrong')
        )
        const toggleButtonElement = await waitForElement(
          component,
          '#user-item-1-menuToggleButton'
        )

        toggleButtonElement.hostNodes().first().simulate('click')
        const menuOptionButton = await waitForElement(
          component,
          '#user-item-1-menuItem2'
        )
        expect(menuOptionButton.hostNodes().text()).toBe('Reset Password')
        menuOptionButton.hostNodes().simulate('click')
        component.update()
        expect(component.exists('#user-reset-password-modal')).toBeTruthy()
        const sendButton = await waitForElement(
          component,
          '#reset-password-send'
        )
        sendButton.hostNodes().simulate('click')
        component.update()
        await waitForElement(component, '#reset_password_error')
      })
    })
  })

  /* Todo: fix after adding pagination in ListView */

  /*describe('Pagination test', () => {
    it('renders no pagination block when the total amount of data is not applicable for pagination', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 5,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'pending',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'disabled',
                    underInvestigation: false
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const app = testComponent
      expect(app.find('#pagination').hostNodes()).toHaveLength(0)
    })
    it('renders pagination block with proper page value when the total amount of data is applicable for pagination', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 15,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b796',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'ma.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b797',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'l.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b794',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'ma.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b798',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 'ms.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b799',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'mj.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const app = testComponent
      expect(app.find('#load_more_button').hostNodes().text()).toContain(
        'Show next 10'
      )
    })
    it('renders next page of the user list when the next page button is pressed', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 10
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 15,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b796',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'ma.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b797',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'l.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b794',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'ma.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b798',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 'ms.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active',
                    underInvestigation: false
                  },
                  {
                    id: '5d08e102542c7a19fc55b799',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'mj.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active',
                    underInvestigation: false
                  }
                ]
              }
            }
          }
        },
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a',
              count: 20
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 15,
                results: [
                  {
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b796',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'ma.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b797',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'l.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b794',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'ma.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b798',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 'ms.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b799',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'mj.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b800',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'a.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b801',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Beauty',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'b.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b802',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'a.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b803',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 's.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b804',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'j.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        <UserList
          // @ts-ignore
          location={{
            search: stringify({
              locationId: '0d8474da-0361-4d32-979e-af91f012340a'
            })
          }}
        />,
        { store, history, graphqlMocks: userListMock }
      )

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      testComponent.update()
      const app = testComponent
      expect(app.find('#load_more_button').hostNodes()).toHaveLength(1)

      app.find('#load_more_button').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      expect(app.find('#load_more_button').hostNodes()).toHaveLength(0)
    })
  })*/
})
