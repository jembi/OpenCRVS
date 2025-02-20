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
import { FormFieldGenerator } from '@client/components/form'
import { ISelectFormFieldWithOptions, UserSection } from '@client/forms'
import { roleQueries } from '@client/forms/user/query/queries'
import { formatUrl } from '@client/navigation'
import {
  CREATE_USER_ON_LOCATION,
  CREATE_USER_SECTION,
  REVIEW_USER_DETAILS,
  REVIEW_USER_FORM
} from '@client/navigation/routes'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore } from '@client/store'
import { GET_USER } from '@client/user/queries'
import {
  createTestComponent,
  flushPromises,
  loginAsFieldAgent,
  mockCompleteFormData,
  mockDataWithRegistarRoleSelected,
  mockOfflineData,
  mockOfflineDataDispatch,
  mockRoles,
  setScopes,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { modifyUserFormData } from '@client/user/userReducer'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { vi, Mock, describe, expect } from 'vitest'
import { GetUserQuery, Status } from '@client/utils/gateway'
import { SCOPES } from '@opencrvs/commons/client'
import { createMemoryRouter } from 'react-router-dom'

describe('create new user tests', () => {
  let store: AppStore
  let testComponent: ReactWrapper
  let testRouter: TestComponentWithRouteMock['router']

  beforeEach(async () => {
    const s = createStore()
    store = s.store

    setScopes([SCOPES.USER_CREATE], store)
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  describe('when user is in create new user form', () => {
    beforeEach(async () => {
      const component = await createTestComponent(<CreateNewUser />, {
        store,
        path: CREATE_USER_ON_LOCATION,
        initialEntries: [
          formatUrl(CREATE_USER_ON_LOCATION, {
            locationId: '0d8474da-0361-4d32-979e-af91f012340a',
            sectionId: mockOfflineData.userForms.sections[0].id
          })
        ]
      })

      testComponent = component.component
      testRouter = component.router

      loginAsFieldAgent(store)
    })

    it('clicking on confirm button with unfilled required fields shows validation errors', async () => {
      await waitForElement(testComponent, '#confirm_form')

      testComponent.find('#confirm_form').hostNodes().simulate('click')

      await flushPromises()
      testComponent.update()
      expect(
        testComponent
          .find(FormFieldGenerator)
          .find('#familyName_error')
          .hostNodes()
          .text()
      ).toBe('Required to register a new user')
    })

    it('clicking on confirm button with complete data takes user to review page', async () => {
      store.dispatch(modifyUserFormData(mockCompleteFormData))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()
      expect(testRouter.state.location.pathname).toContain(
        'preview/preview-registration-office'
      )
    })

    it('clicking on confirm by selecting registrar as role will go to signature form page', async () => {
      store.dispatch(modifyUserFormData(mockDataWithRegistarRoleSelected))
      await waitForElement(testComponent, '#confirm_form')
      testComponent.find('#confirm_form').hostNodes().simulate('click')
      await flushPromises()

      expect(testRouter.state.location.pathname).toContain(
        '/createUser/user/signature-attachment'
      )
    })
  })

  describe('when user in review page', () => {
    beforeEach(async () => {
      await flushPromises()

      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      store.dispatch(modifyUserFormData(mockCompleteFormData))

      await flushPromises()
      ;({ component: testComponent, router: testRouter } =
        await createTestComponent(<CreateNewUser />, {
          store,
          path: CREATE_USER_SECTION,
          initialEntries: [
            formatUrl(CREATE_USER_SECTION, {
              sectionId: mockOfflineData.userForms.sections[1].id,
              groupId: mockOfflineData.userForms.sections[1].groups[0].id
            })
          ]
        }))

      await waitForElement(testComponent, '#content-name')
    })

    it('renders review header', () => {
      expect(testComponent.find('#content-name').hostNodes().text()).toBe(
        'Please review the new users details'
      )
    })

    it('clicking change button on a field takes user back to form', async () => {
      testComponent
        .find('#btn_change_firstName')
        .hostNodes()
        .first()
        .simulate('click')
      await flushPromises()
      expect(testRouter.state.location.pathname).toBe(
        '/createUser/user/user-view-group'
      )
      expect(testRouter.state.location.hash).toBe('#firstName')
    })

    it('clicking submit button submits the form data', async () => {
      testComponent.find('#submit_user_form').hostNodes().simulate('click')

      await flushPromises()

      expect(store.getState().userForm.submitting).toBe(false)
    })
  })
})

describe('edit user tests', () => {
  const { store } = createStore()
  let component: ReactWrapper<{}, {}>
  let router: ReturnType<typeof createMemoryRouter>
  const submitMock: Mock = vi.fn()

  const graphqlMocks = [
    {
      request: {
        query: GET_USER,
        variables: { userId: '5e835e4d81fbf01e4dc554db' }
      },
      result: {
        data: {
          getUser: {
            id: '5e835e4d81fbf01e4dc554db',
            userMgntUserID: '5e835e4d81fbf01e4dc554db',
            name: [
              {
                use: 'bn',
                firstNames: 'Jeff',
                familyName: 'মায়ের পারিবারিক নাম ',
                __typename: 'HumanName'
              },
              {
                use: 'en',
                firstNames: 'Jeff',
                familyName: 'Shakib al Hasan',
                __typename: 'HumanName'
              }
            ],
            username: 'shakib1',
            mobile: '+8801662132163',
            email: 'jeff@gmail.com',
            role: {
              id: '63ef9466f708ea080777c27a',
              label: {
                defaultMessage: 'State Registrar',
                description: 'Name for user role State Registrar',
                id: 'userRole.stateRegistrar'
              }
            },
            status: Status.Active,
            underInvestigation: false,
            practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
            primaryOffice: {
              id: '895cc945-94a9-4195-9a29-22e9310f3385',
              name: 'Narsingdi Paurasabha',
              alias: ['নরসিংদী পৌরসভা'],
              __typename: 'Location'
            },
            // without signature confirm button stays disabled
            signature: new File(['(⌐□_□)'], 'chucknorris.png', {
              type: 'image/png'
            }),
            creationDate: '2019-03-31T18:00:00.000Z',
            __typename: 'User'
          } satisfies GetUserQuery['getUser']
        }
      }
    }
  ]

  beforeEach(async () => {
    setScopes([SCOPES.USER_CREATE], store)
    ;(roleQueries.fetchRoles as Mock).mockReturnValue(mockRoles)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
  })

  it('check user role update', async () => {
    const section = store
      .getState()
      .userForm.userForm?.sections.find((section) => section.id === 'user')
    const group = section!.groups.find(
      (group) => group.id === 'user-view-group'
    )!
    const field = group.fields.find(
      (field) => field.name === 'role'
    ) as ISelectFormFieldWithOptions
    expect(field.options).not.toEqual([])
  })

  describe('when user is in update form page', () => {
    beforeEach(async () => {
      const { component: testComponent, router: testRouter } =
        await createTestComponent(<CreateNewUser />, {
          store,
          graphqlMocks: graphqlMocks,
          path: REVIEW_USER_FORM,
          initialEntries: [
            formatUrl(REVIEW_USER_FORM, {
              userId: '5e835e4d81fbf01e4dc554db',
              sectionId: UserSection.User,
              groupId: 'user-view-group'
            })
          ]
        })

      component = testComponent
      router = testRouter
    })

    it('clicking on continue button takes user signature attachment page', async () => {
      const continueButtonElement = await waitForElement(
        component,
        '#confirm_form'
      )

      continueButtonElement.hostNodes().simulate('click')
      component.update()
      await flushPromises()

      // this will have to be updated after signature page is updated for new user roles structure
      expect(router.state.location.pathname).toContain(
        '/user/5e835e4d81fbf01e4dc554db/preview/preview-registration-office'
      )
    })
  })

  describe('when user is in review page', () => {
    beforeEach(async () => {
      ;({ component, router } = await createTestComponent(
        <CreateNewUser
          // @ts-ignore
          submitForm={submitMock}
        />,
        {
          store,
          graphqlMocks,
          path: REVIEW_USER_DETAILS,
          initialEntries: [
            formatUrl(REVIEW_USER_DETAILS, {
              userId: '5e835e4d81fbf01e4dc554db',
              sectionId: UserSection.Preview
            })
          ]
        }
      ))

      component.update()
    })

    it('loads page without crashing', async () => {
      const actionPageElement = await waitForElement(component, ActionPageLight)
      expect(actionPageElement.prop('title')).toBe('Edit details')
    })

    it('clicking on any change button takes user to form', async () => {
      const changeButtonOfType = await waitForElement(
        component,
        '#btn_change_device'
      )
      changeButtonOfType.hostNodes().first().simulate('click')
      await flushPromises()
      expect(router.state.location.hash).toBe('#device')
    })

    it('clicking confirm button starts submitting the form', async () => {
      const submitButton = await waitForElement(
        component,
        '#submit-edit-user-form'
      )

      submitButton.hostNodes().simulate('click')

      expect(store.getState().userForm.submitting).toBe(true)
    })
  })
})
