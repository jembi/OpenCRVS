import * as React from 'react'
import {
  createTestComponent,
  selectOption,
  mockApplicationData,
  mockDeathApplicationData,
  mockDeathApplicationDataWithoutFirstNames,
  wait
} from 'tests/util'
import { RegisterForm } from './RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createDraft,
  createReviewDraft,
  storeDraft,
  setInitialDrafts,
  IUserData,
  getCurrentUserID,
  getDraftsOfCurrentUser,
  writeDraftByUser
} from 'drafts'
import { v4 as uuid } from 'uuid'

import { createStore } from '../../store'
import {
  DRAFT_BIRTH_PARENT_FORM_TAB,
  REVIEW_EVENT_PARENT_FORM_TAB,
  DRAFT_DEATH_FORM_TAB
} from 'navigation/routes'
import { getRegisterForm } from 'forms/register/application-selectors'
import { getReviewForm } from 'forms/register/review-selectors'
import { Event, IFormData } from 'forms'
import { draftToGqlTransformer } from 'transformer'
import { IForm } from 'forms'
import { clone } from 'lodash'
import { FETCH_REGISTRATION } from 'forms/register/queries/registration'
import { FETCH_PERSON } from 'forms/register/queries/person'
import { storage } from 'storage'
import { IUserDetails } from 'utils/userUtils'

describe('when user logs in', async () => {
  // Some mock data

  const draft1 = createDraft(Event.BIRTH)
  const draft2 = createDraft(Event.DEATH)
  const draft3 = createDraft(Event.BIRTH)

  const currentUserData: IUserData = {
    userID: 'shakib75',
    drafts: [draft1, draft2]
  }

  const anotherUserData: IUserData = {
    userID: 'mortaza',
    drafts: [draft3]
  }

  const currentUserDetails: IUserDetails = {
    userMgntUserID: 'shakib75'
  }

  const indexedDB = {
    USER_DATA: JSON.stringify([currentUserData, anotherUserData]),
    USER_DETAILS: JSON.stringify(currentUserDetails)
  }

  // Mocking storage reading
  storage.getItem = jest.fn(
    (key: string): string => {
      switch (key) {
        case 'USER_DATA':
        case 'USER_DETAILS':
          return indexedDB[key]
        default:
          return 'undefined'
      }
    }
  )

  // Mocking storage writing
  storage.setItem = jest.fn((key: string, value: string) => {
    switch (key) {
      case 'USER_DATA':
      case 'USER_DETAILS':
        indexedDB[key] = value
      default:
        break
    }
  })

  it('should read userID correctly', async () => {
    const uID = await getCurrentUserID() // reads from USER_DETAILS and returns the userMgntUserID, if exists
    expect(uID).toEqual('shakib75')
  })

  it('should read only the drafts of the currently logged-in user', async () => {
    const details = await getDraftsOfCurrentUser()
    const currentUserDrafts = (JSON.parse(details) as IUserData).drafts
    expect(currentUserDrafts.length).toBe(2)
    expect(currentUserDrafts[0]).toEqual(draft1)
    expect(currentUserDrafts[1]).toEqual(draft2)
    expect(currentUserDrafts.find(draft => draft.id === draft3.id)).toBeFalsy()
  })

  it("should save the draft inside the current user's array of drafts", async () => {
    const draft4 = createDraft(Event.DEATH)
    await writeDraftByUser({
      userID: currentUserData.userID,
      initialDraftsLoaded: true,
      drafts: [...currentUserData.drafts, draft4]
    })

    // Now, let's check if the new draft is added
    const details = await getDraftsOfCurrentUser()
    const currentUserDrafts = (JSON.parse(details) as IUserData).drafts
    expect(currentUserDrafts.length).toBe(3)
    expect(currentUserDrafts.find(draft => draft.id === draft4.id)).toBeTruthy()
  })
})

describe('when there is no user-data saved', () => {
  it('should return an empty array', async () => {
    storage.getItem = jest.fn(
      (key: string): string => {
        switch (key) {
          case 'USER_DATA':
            return '[]'
          case 'USER_DETAILS':
            return '{ "userMgntUserID": "tamimIq" }'
          default:
            return ''
        }
      }
    )
    const str = await getDraftsOfCurrentUser()
    const drafts = (JSON.parse(str) as IUserData).drafts
    expect(drafts.length).toBe(0)
  })
})

describe('when user is in the register form before initial draft load', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  const draft = createDraft(Event.BIRTH)
  const form = getRegisterForm(store.getState())[Event.BIRTH]
  it('throws error when draft not found after initial drafts load', () => {
    try {
      createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: '', tabId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

describe('when user is in the register form for birth event', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.BIRTH)
  store.dispatch(storeDraft(draft))
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.BIRTH]

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'mother' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the page', () => {
      expect(
        component.find('#form_section_title_mother').hostNodes()
      ).toHaveLength(1)
    })
    it('changes the country select', async () => {
      const select = selectOption(
        component,
        '#countryPermanent',
        'United States of America'
      )
      expect(component.find(select).text()).toEqual('United States of America')
    })
    it('takes user to declaration submitted page when save button is clicked', () => {
      component
        .find('#save_draft')
        .hostNodes()
        .simulate('click')
      expect(history.location.pathname).toEqual('/confirm')
    })
  })
})

describe('when user is in the register form for death event', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.DEATH)
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.DEATH]

  describe('when user is in optional cause of death section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'causeOfDeath' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the optional label', () => {
      expect(
        component.find('#form_section_optional_label_causeOfDeath').hostNodes()
      ).toHaveLength(1)
    })

    it('renders the notice component', () => {
      expect(
        component.find('#form_section_notice_causeOfDeath').hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when user is in deceased section', () => {
    it('renders loader button when idType is Birth Registration Number', () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')
      expect(component.find('#fetchButton').hostNodes()).toHaveLength(1)
    })

    it('renders loader button when idType is National ID', () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')
      expect(component.find('#fetchButton').hostNodes()).toHaveLength(1)
    })

    it('fetches deceased information by entered BRN', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION,
            variables: {
              identifier: '2019333494BQNXOHJ2'
            }
          },
          result: {
            data: {
              queryRegistrationByIdentifier: {
                id: '47cc78a6-3d42-4253-8050-843b278d496b',
                child: {
                  id: 'e969527e-be14-4577-99b6-8e1f8000c274',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'গায়ত্রী',
                      familyName: 'স্পিভক'
                    },
                    {
                      use: 'en',
                      firstNames: 'Gayatri',
                      familyName: 'Spivak'
                    }
                  ],
                  birthDate: '2018-08-01',
                  gender: 'female'
                }
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '2019333494BQNXOHJ2' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('fetches deceased information by entered NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          result: {
            data: {
              queryPersonByIdentifier: {
                id: '26499e5c-72a2-42f6-b8e6-1ffc99b5311e',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female',
                address: [
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'PERMANENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  },
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'CURRENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '1234567898765' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('fetches informant information by entered NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          result: {
            data: {
              queryPersonByIdentifier: {
                id: '26499e5c-72a2-42f6-b8e6-1ffc99b5311e',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female',
                address: [
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'PERMANENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  },
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'CURRENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'informant' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      component.find('input#applicantID').simulate('change', {
        target: { id: 'applicantID', value: '1234567898765' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('displays error message if no registration found by BRN', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION,
            variables: {
              identifier: '2019333494BQNXOHJ2'
            }
          },
          error: new Error('boom')
        }
      ]
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')

      const input = component.find('input#iD')
      // @ts-ignore
      input
        .props()
        // @ts-ignore
        .onChange({
          // @ts-ignore
          target: {
            // @ts-ignore
            id: 'iD',
            value: '2019333494BQNXOHJ2'
          }
        })
      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()

      expect(component.find('#loader-button-error').hostNodes()).toHaveLength(1)
    })

    it('displays error message if no registration found by NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          error: new Error('boom')
        }
      ]
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      const input = component.find('input#iD')
      // @ts-ignore
      input
        .props()
        // @ts-ignore
        .onChange({
          // @ts-ignore
          target: {
            // @ts-ignore
            id: 'iD',
            value: '1234567898765'
          }
        })
      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()

      expect(component.find('#loader-button-error').hostNodes()).toHaveLength(1)
    })
  })
})

describe('when user is in the register form preview section', () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.BIRTH)
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.BIRTH]
  const testComponent = createTestComponent(
    <RegisterForm
      location={mock}
      scope={mock}
      history={history}
      staticContext={mock}
      registerForm={form}
      draft={draft}
      tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
      match={{
        params: { draftId: draft.id, tabId: 'preview' },
        isExact: true,
        path: '',
        url: ''
      }}
    />,
    store
  )
  component = testComponent.component

  it('submit button will be disabled when form is not fully filled-up', () => {
    expect(
      component
        .find('#submit_form')
        .hostNodes()
        .prop('disabled')
    ).toBe(true)
  })

  it('Do not displays submit confirm modal when disabled submit button is clicked', () => {
    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    expect(component.find('#submit_confirm').hostNodes()).toHaveLength(0)
  })

  it('Should be able to click the Delete application button', () => {
    // @ts-ignore
    global.window = { location: { pathname: null } }

    // @ts-ignore
    expect(global.window.location.pathname).toMatch('/confirm')

    const deleteBtn = component.find('#delete-application').hostNodes()
    deleteBtn.simulate('click')
    component.update()

    // @ts-ignore
    expect(global.window.location.pathname).toEqual('/')
  })

  describe('User in the Preview section for submitting the Form', () => {
    beforeEach(async () => {
      // @ts-ignore
      const nDraft = createReviewDraft(uuid(), mockApplicationData, Event.BIRTH)
      store.dispatch(setInitialDrafts())
      store.dispatch(storeDraft(nDraft))

      const nform = getRegisterForm(store.getState())[Event.BIRTH]
      const nTestComponent = createTestComponent(
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={nform}
          draft={nDraft}
          tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: nDraft.id, tabId: 'preview' },
            isExact: true,
            path: '',
            url: ''
          }}
          scope={[]}
        />,
        store
      )
      component = nTestComponent.component
    })

    it('Should be able to click the Save Draft button', () => {
      component
        .find('#submit_form')
        .hostNodes()
        .simulate('click')
      component.update()

      // @ts-ignore
      global.window = { location: { pathname: null } }

      // @ts-ignore
      expect(global.window.location.pathname).toMatch('/')

      const saveDraftButton = component.find('#save-draft').hostNodes()
      saveDraftButton.simulate('click')
      component.update()

      // @ts-ignore
      expect(global.window.location.pathname).toEqual('/')
    })

    it('should be able to submit the form', () => {
      const nextForChildSectionBtn = component
        .find('#next_button_child')
        .hostNodes()
      const nextForMotherSectionBtn = component
        .find('#next_button_mother')
        .hostNodes()
      const nextForFatherSectionBtn = component
        .find('#next_button_father')
        .hostNodes()

      nextForChildSectionBtn.simulate('click')
      nextForMotherSectionBtn.simulate('click')
      nextForFatherSectionBtn.simulate('click')

      component
        .find('#submit_form')
        .hostNodes()
        .simulate('click')
      component.update()

      const previewBtn = component.find('#cancel-btn').hostNodes()
      expect(previewBtn.length).toEqual(1)

      previewBtn.simulate('click')
      component.update()

      expect(component.find('#cancel-btn').hostNodes().length).toEqual(0)
    })
  })
})

describe('when user is in the register form review section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = createStore()
    // @ts-ignore
    const draft = createReviewDraft(uuid(), mockApplicationData, Event.BIRTH)
    store.dispatch(setInitialDrafts())
    store.dispatch(storeDraft(draft))
    const mock: any = jest.fn()
    const form = getReviewForm(store.getState()).birth
    const testComponent = createTestComponent(
      <RegisterForm
        location={mock}
        scope={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        draft={draft}
        tabRoute={REVIEW_EVENT_PARENT_FORM_TAB}
        match={{
          params: {
            draftId: draft.id,
            tabId: 'review',
            event: draft.event.toLowerCase()
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('clicking the reject button launches the reject form action page', () => {
    component
      .find('#next_button_child')
      .hostNodes()
      .simulate('click')

    component
      .find('#next_button_mother')
      .hostNodes()
      .simulate('click')

    component
      .find('#next_button_father')
      .hostNodes()
      .simulate('click')

    component
      .find('#rejectApplicationBtn')
      .hostNodes()
      .simulate('click')
    expect(
      component.find('#reject-registration-form-container').hostNodes()
    ).toHaveLength(1)
  })
})

describe('when user is in the register form for death event', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.DEATH)
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.DEATH]

  describe('when user is in optional cause of death section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_DEATH_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'causeOfDeath' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the optional label', () => {
      expect(
        component.find('#form_section_optional_label_causeOfDeath').hostNodes()
      ).toHaveLength(1)
    })

    it('renders the notice component', () => {
      expect(
        component.find('#form_section_notice_causeOfDeath').hostNodes()
      ).toHaveLength(1)
    })
  })
})

describe('When user is in Preview section death event', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.DEATH)
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm

  const mock: any = jest.fn()

  beforeEach(async () => {
    jest.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewDraft(
      uuid(),
      // @ts-ignore
      mockDeathApplicationData,
      Event.DEATH
    )
    store.dispatch(setInitialDrafts())
    store.dispatch(storeDraft(deathDraft))

    deathForm = getRegisterForm(store.getState())[Event.DEATH]
    const nTestComponent = createTestComponent(
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        draft={deathDraft}
        tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: deathDraft.id, tabId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
        scope={[]}
      />,
      store
    )
    component = nTestComponent.component
  })

  it('Check if death location type is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathApplicationData as IFormData)
        .eventLocation.type
    ).toBe('OTHER')
  })

  it('Check if death location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathApplicationData as IFormData)
        .eventLocation.partOf
    ).toBe('Location/upazila')
  })

  it('Should be able to submit the form', () => {
    component
      .find('#next_button_deceased')
      .hostNodes()
      .simulate('click')
    component
      .find('#next_button_informant')
      .hostNodes()
      .simulate('click')
    component
      .find('#next_button_deathEvent')
      .hostNodes()
      .simulate('click')

    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    const modalSubmitBtn = component.find('#submit_confirm').hostNodes()
    expect(modalSubmitBtn.length).toEqual(1)
  })
  it('Check if death location as hospital is parsed properly', () => {
    const hospitalLocatioMockDeathApplicationData = clone(
      mockDeathApplicationData
    )
    hospitalLocatioMockDeathApplicationData.deathEvent.placeOfDeath = 'HOSPITAL'
    hospitalLocatioMockDeathApplicationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'
    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathApplicationData as IFormData
      ).eventLocation.type
    ).toBe(undefined)
  })

  it('Check if death location as hospital _fhirID is parsed properly', () => {
    const hospitalLocatioMockDeathApplicationData = clone(
      mockDeathApplicationData
    )
    hospitalLocatioMockDeathApplicationData.deathEvent.placeOfDeath = 'HOSPITAL'
    hospitalLocatioMockDeathApplicationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'
    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathApplicationData as IFormData
      ).eventLocation._fhirID
    ).toBe('5e3736a0-090e-43b4-9012-f1cef399e123')
  })
})

describe('When user is in Preview section death event in offline mode', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.DEATH)
  store.dispatch(setInitialDrafts())
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm

  const mock: any = jest.fn()

  beforeEach(async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true
    })
    jest.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewDraft(
      uuid(),
      // @ts-ignore
      mockDeathApplicationDataWithoutFirstNames,
      Event.DEATH
    )
    store.dispatch(setInitialDrafts())
    store.dispatch(storeDraft(deathDraft))

    deathForm = getRegisterForm(store.getState())[Event.DEATH]
    const nTestComponent = createTestComponent(
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        draft={deathDraft}
        tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: deathDraft.id, tabId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
        scope={[]}
      />,
      store
    )
    component = nTestComponent.component
  })

  it('Should be able to submit the form', async () => {
    component
      .find('#next_button_deceased')
      .hostNodes()
      .simulate('click')
    component
      .find('#next_button_informant')
      .hostNodes()
      .simulate('click')
    component
      .find('#next_button_deathEvent')
      .hostNodes()
      .simulate('click')

    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    component
      .find('#submit_confirm')
      .hostNodes()
      .simulate('click')
    await wait()
    expect(history.location.pathname).toContain('confirm')
  })
})
