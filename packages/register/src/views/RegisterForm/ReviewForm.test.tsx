import * as React from 'react'
import { ReviewForm } from './ReviewForm'
import { GET_BIRTH_REGISTRATION_FOR_REVIEW } from 'views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_REVIEW } from 'views/DataProvider/death/queries'
import { createTestComponent, mockUserResponseWithName } from 'tests/util'
import { createStore } from 'store'
import { getReviewForm } from 'forms/register/review-selectors'
import {
  createReviewDraft,
  IDraft,
  getStorageDraftsSuccess,
  storeDraft
} from 'drafts'
import { v4 as uuid } from 'uuid'
import { REVIEW_EVENT_PARENT_FORM_TAB } from 'navigation/routes'
import { RegisterForm } from 'views/RegisterForm/RegisterForm'
import { checkAuth } from 'profile/profileActions'
import { Event } from 'forms'
import { queries } from 'profile/queries'

const declareScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponseWithName)
queries.fetchUserDetails = mockFetchUserDetails
describe('ReviewForm tests', async () => {
  const { store, history } = createStore()
  const scope = ['register']
  const mock: any = jest.fn()
  const form = getReviewForm(store.getState()).birth

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('it returns error while fetching', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        scope={scope}
        event={draft.event}
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
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#review-error-text')
        .children()
        .text()
    ).toBe('An error occurred while fetching birth registration')

    testComponent.component.unmount()
  })
  it('it returns birth registration', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: draft.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'আকাশ'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Akash'
                  }
                ],
                birthDate: '2001-01-01',
                gender: 'male',
                id: '16025284-bae2-4b37-ae80-e16745b7a6b9'
              },
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'ময়না'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Moyna'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                multipleBirth: 1,
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  },
                  {
                    system: 'email',
                    value: 'moyna@ocrvs.com'
                  }
                ],
                id: '20e9a8d0-907b-4fbd-a318-ec46662bf608'
              },
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'MOTHER',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: {
                address: {
                  country: 'BGD',
                  state: 'state4',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              },
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        scope={scope}
        staticContext={mock}
        event={draft.event}
        registerForm={form}
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
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.child).toEqual({
      _fhirID: '16025284-bae2-4b37-ae80-e16745b7a6b9',
      attendantAtBirth: 'NURSE',
      childBirthDate: '2001-01-01',
      familyName: 'আকাশ',
      familyNameEng: 'Akash',
      gender: 'male',
      placeOfBirth: 'PRIVATE_HOME',
      birthLocation: undefined,
      country: 'BGD',
      state: 'state4',
      district: 'district2',
      addressLine1: 'Rd #10',
      addressLine1CityOption: '',
      addressLine2: 'Akua',
      addressLine3: 'union1',
      addressLine3CityOption: '',
      addressLine4: 'upazila10',
      multipleBirth: 1,
      birthType: 'SINGLE',
      weightAtBirth: 2
    })

    testComponent.component.unmount()
  })
  it('Shared contact phone number should be set properly', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: draft.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              father: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'আজমল'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Azmol'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  }
                ],
                id: '526362a1-aa8e-4848-af35-41524f9e7e85'
              },
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'FATHER',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: {
                address: {
                  country: 'BGD',
                  state: 'state4',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              },
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={draft.event}
        registerForm={form}
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
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.registration.registrationPhone).toBe('01733333333')
    testComponent.component.unmount()
  })
  it('when registration has attachment', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: draft.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: null,
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'MOTHER',
                contactPhoneNumber: '01733333333',
                attachments: [
                  {
                    contentType: 'image/jpeg',
                    subject: 'MOTHER',
                    type: 'BIRTH_REGISTRATION',
                    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
                  }
                ],
                status: null,
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: {
                address: {
                  country: 'BGD',
                  state: 'state4',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              },
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={draft.event}
        registerForm={form}
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
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.documents.image_uploader).toEqual([
      {
        optionValues: ['Mother', 'Birth Registration'],
        type: 'image/jpeg',
        title: 'Mother',
        description: 'Birth Registration',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQECWAJYAAD'
      }
    ])

    testComponent.component.unmount()
  })
  it('check registration', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    const graphqlMock = [
      {
        request: {
          query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
          variables: { id: draft.id }
        },
        result: {
          data: {
            fetchBirthRegistration: {
              id: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
              _fhirIDMap: {
                composition: '9a55d213-ad9f-4dcd-9418-340f3a7f6269',
                encounter: 'dba420af-3d3a-46e3-817d-2fa5c37b7439',
                observation: {
                  birthType: '16643bcf-457a-4a5b-a7d2-328d57182476',
                  weightAtBirth: '13a75fdf-54d3-476e-ab0e-68fca7286686',
                  attendantAtBirth: 'add45cfa-8390-4792-a857-a1df587e45a6',
                  presentAtBirthRegistration:
                    'd43f9c01-bd4f-4df6-b38f-91f7a978a232'
                }
              },
              child: null,
              mother: {
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'ময়না'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Moyna'
                  }
                ],
                birthDate: '2001-01-01',
                maritalStatus: 'MARRIED',
                dateOfMarriage: '2001-01-01',
                educationalAttainment: 'PRIMARY_ISCED_1',
                nationality: ['BGD'],
                identifier: [{ id: '1233', type: 'PASSPORT', otherType: '' }],
                multipleBirth: 1,
                address: [
                  {
                    type: 'PERMANENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  },
                  {
                    type: 'CURRENT',
                    line: ['12', '', 'union1', 'upazila10'],
                    district: 'district2',
                    state: 'state2',
                    postalCode: '',
                    country: 'BGD'
                  }
                ],
                telecom: [
                  {
                    system: 'phone',
                    value: '01711111111'
                  }
                ],
                id: '20e9a8d0-907b-4fbd-a318-ec46662bf608'
              },
              father: null,
              registration: {
                id: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
                contact: 'MOTHER',
                contactPhoneNumber: '01733333333',
                attachments: null,
                status: [
                  {
                    comments: [
                      {
                        comment: 'This is a note'
                      }
                    ],
                    type: 'DECLARED'
                  }
                ],
                trackingId: 'B123456',
                registrationNumber: null,
                type: 'BIRTH'
              },
              attendantAtBirth: 'NURSE',
              weightAtBirth: 2,
              birthType: 'SINGLE',
              eventLocation: {
                address: {
                  country: 'BGD',
                  state: 'state4',
                  district: 'district2',
                  postalCode: '',
                  line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                  postCode: '1020'
                },
                type: 'PRIVATE_HOME',
                partOf: 'Location/upazila10'
              },
              presentAtBirthRegistration: 'MOTHER_ONLY'
            }
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={draft.event}
        registerForm={form}
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
        draftId={draft.id}
      />,
      store,
      graphqlMock
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()

    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data.registration).toEqual({
      _fhirID: 'c8dbe751-5916-4e2a-ba95-1733ccf699b6',
      whoseContactDetails: 'MOTHER',
      presentAtBirthRegistration: 'MOTHER_ONLY',
      registrationPhone: '01733333333',
      commentsOrNotes: 'This is a note',
      trackingId: 'B123456',
      type: 'birth'
    })

    testComponent.component.unmount()
  })
  it('it checked if review form is already in store and avoid loading from backend', async () => {
    const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
    draft.data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        presentAtBirthRegistration: 'MOTHER_ONLY',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    }
    store.dispatch(
      getStorageDraftsSuccess(
        JSON.stringify({
          userID: 'currentUser', // mock
          drafts: [draft]
        })
      )
    )
    store.dispatch(storeDraft(draft))

    const testComponent = createTestComponent(
      <ReviewForm
        location={mock}
        history={history}
        staticContext={mock}
        scope={scope}
        event={draft.event}
        registerForm={form}
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
        draftId={draft.id}
      />,
      store
    )
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })

    testComponent.component.update()
    const data = testComponent.component
      .find(RegisterForm)
      .prop('draft') as IDraft

    expect(data.data).toEqual({
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '2001-01-01',
        familyName: 'আকাশ',
        familyNameEng: 'Akash',
        firstNames: '',
        firstNamesEng: '',
        gender: 'male',
        birthType: 'SINGLE',
        weightAtBirth: '2'
      },
      registration: {
        presentAtBirthRegistration: 'MOTHER_ONLY',
        registrationPhone: '01741234567',
        whoseContactDetails: 'MOTHER',
        type: 'BIRTH'
      }
    })

    testComponent.component.unmount()
  })
  describe('Death review flow', () => {
    it('it returns death registration', async () => {
      const draft = createReviewDraft(uuid(), {}, Event.DEATH)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: draft.id }
          },
          result: {
            data: {
              fetchDeathRegistration: {
                id: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6',
                _fhirIDMap: {
                  composition: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6'
                },
                deceased: {
                  id: '50fbd713-c86d-49fe-bc6a-52094b40d8dd',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'অনিক',
                      familyName: 'অনিক'
                    },
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'anik'
                    }
                  ],
                  birthDate: '1983-01-01',
                  maritalStatus: 'MARRIED',
                  nationality: ['BGD'],
                  identifier: [
                    {
                      id: '123456789',
                      type: 'PASSPORT',
                      otherType: null
                    }
                  ],
                  gender: 'male',
                  deceased: {
                    deathDate: '2019-01-01'
                  },
                  address: [
                    {
                      type: 'PERMANENT',
                      line: [
                        '121',
                        '',
                        '12',
                        '1f06d980-e254-4e6b-b049-a9b4e7155180',
                        '',
                        '34c377a0-2223-4361-851c-5e230a96d957'
                      ],
                      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                      postalCode: '12',
                      country: 'BGD'
                    },
                    {
                      type: 'CURRENT',
                      line: [
                        '121',
                        '',
                        '12',
                        '1f06d980-e254-4e6b-b049-a9b4e7155180',
                        '',
                        '34c377a0-2223-4361-851c-5e230a96d957'
                      ],
                      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                      postalCode: '12',
                      country: 'BGD'
                    }
                  ]
                },
                informant: {
                  id: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
                  relationship: 'EXTENDED_FAMILY',
                  otherRelationship: 'Patternal uncle',
                  individual: {
                    id: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1',
                    identifier: [
                      {
                        id: '123456789',
                        type: 'PASSPORT',
                        otherType: null
                      }
                    ],
                    name: [
                      {
                        use: 'bn',
                        firstNames: 'অনিক',
                        familyName: 'অনিক'
                      },
                      {
                        use: 'en',
                        firstNames: 'Anik',
                        familyName: 'Anik'
                      }
                    ],
                    nationality: ['BGD'],
                    birthDate: '1996-01-01',
                    telecom: [
                      {
                        system: 'phone',
                        value: '01622688231'
                      }
                    ],
                    address: [
                      {
                        type: 'CURRENT',
                        line: [
                          '12',
                          '',
                          '12',
                          '1f06d980-e254-4e6b-b049-a9b4e7155180',
                          '',
                          '34c377a0-2223-4361-851c-5e230a96d957'
                        ],
                        district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                        state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                        postalCode: '12',
                        country: 'BGD'
                      },
                      {
                        type: 'PERMANENT',
                        line: [
                          '12',
                          '',
                          '12',
                          '1f06d980-e254-4e6b-b049-a9b4e7155180',
                          '',
                          '34c377a0-2223-4361-851c-5e230a96d957'
                        ],
                        district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                        state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                        postalCode: '12',
                        country: 'BGD'
                      }
                    ]
                  }
                },
                registration: {
                  id: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
                  attachments: null,
                  status: [
                    {
                      type: 'DECLARED'
                    }
                  ],
                  type: 'DEATH',
                  trackingId: 'DS8QZ0Z',
                  registrationNumber: null
                },
                eventLocation: {
                  id: 'fccf6eac-4dae-43d3-af33-2c977d1daf99',
                  type: 'CURRENT',
                  address: {
                    type: '',
                    line: ['', '', '', '', '', ''],
                    district: '',
                    state: '',
                    postalCode: '',
                    country: 'BGD'
                  }
                },
                mannerOfDeath: 'ACCIDENT',
                causeOfDeathMethod: null,
                causeOfDeath: null
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
          event={draft.event}
          registerForm={getReviewForm(store.getState()).death}
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
          draftId={draft.id}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()
      const data = testComponent.component
        .find(RegisterForm)
        .prop('draft') as IDraft

      expect(data.data.deceased).toEqual({
        iDType: 'PASSPORT',
        iD: '123456789',
        firstNames: 'অনিক',
        familyName: 'অনিক',
        firstNamesEng: 'Anik',
        familyNameEng: 'anik',
        nationality: 'BGD',
        gender: 'male',
        maritalStatus: 'MARRIED',
        birthDate: '1983-01-01',
        countryPermanent: 'BGD',
        statePermanent: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
        districtPermanent: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
        addressLine4Permanent: '34c377a0-2223-4361-851c-5e230a96d957',
        addressLine3Permanent: '1f06d980-e254-4e6b-b049-a9b4e7155180',
        addressLine3CityOptionPermanent: '',
        addressLine2Permanent: '12',
        addressLine1CityOptionPermanent: '',
        postCodeCityOptionPermanent: '12',
        addressLine1Permanent: '121',
        postCodePermanent: '12',
        currentAddressSameAsPermanent: true,
        country: 'BGD',
        state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
        district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
        addressLine4: '34c377a0-2223-4361-851c-5e230a96d957',
        addressLine3: '1f06d980-e254-4e6b-b049-a9b4e7155180',
        addressLine3CityOption: '',
        addressLine2: '12',
        addressLine1CityOption: '',
        postCodeCityOption: '12',
        addressLine1: '121',
        postCode: '12',
        _fhirID: '50fbd713-c86d-49fe-bc6a-52094b40d8dd'
      })

      testComponent.component.unmount()
    })
    it('populates proper casue of death section', async () => {
      const draft = createReviewDraft(uuid(), {}, Event.DEATH)
      const graphqlMock = [
        {
          request: {
            query: GET_DEATH_REGISTRATION_FOR_REVIEW,
            variables: { id: draft.id }
          },
          result: {
            data: {
              fetchDeathRegistration: {
                id: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6',
                _fhirIDMap: {
                  composition: '4f5ff6f7-cf61-42e1-9e1e-dc4b73517aa6'
                },
                deceased: {
                  id: '50fbd713-c86d-49fe-bc6a-52094b40d8dd',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'অনিক',
                      familyName: 'অনিক'
                    },
                    {
                      use: 'en',
                      firstNames: 'Anik',
                      familyName: 'anik'
                    }
                  ],
                  birthDate: '1983-01-01',
                  maritalStatus: 'MARRIED',
                  nationality: ['BGD'],
                  identifier: [
                    {
                      id: '123456789',
                      type: 'PASSPORT',
                      otherType: null
                    }
                  ],
                  gender: 'male',
                  deceased: {
                    deathDate: '2019-01-01'
                  },
                  address: [
                    {
                      type: 'PERMANENT',
                      line: [
                        '121',
                        '',
                        '12',
                        '1f06d980-e254-4e6b-b049-a9b4e7155180',
                        '',
                        '34c377a0-2223-4361-851c-5e230a96d957'
                      ],
                      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                      postalCode: '12',
                      country: 'BGD'
                    },
                    {
                      type: 'CURRENT',
                      line: [
                        '121',
                        '',
                        '12',
                        '1f06d980-e254-4e6b-b049-a9b4e7155180',
                        '',
                        '34c377a0-2223-4361-851c-5e230a96d957'
                      ],
                      district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                      state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                      postalCode: '12',
                      country: 'BGD'
                    }
                  ]
                },
                informant: {
                  id: 'c9e3e5cb-d483-4db4-afaa-625161826f00',
                  relationship: 'EXTENDED_FAMILY',
                  otherRelationship: null,
                  individual: {
                    id: 'cabeeea7-0f7d-41c3-84ed-8f88e4d617e1',
                    identifier: [
                      {
                        id: '123456789',
                        type: 'PASSPORT',
                        otherType: null
                      }
                    ],
                    name: [
                      {
                        use: 'bn',
                        firstNames: 'অনিক',
                        familyName: 'অনিক'
                      },
                      {
                        use: 'en',
                        firstNames: 'Anik',
                        familyName: 'Anik'
                      }
                    ],
                    nationality: ['BGD'],
                    birthDate: '1996-01-01',
                    telecom: [
                      {
                        system: 'phone',
                        value: '01622688231'
                      }
                    ],
                    address: [
                      {
                        type: 'CURRENT',
                        line: [
                          '12',
                          '',
                          '12',
                          '1f06d980-e254-4e6b-b049-a9b4e7155180',
                          '',
                          '34c377a0-2223-4361-851c-5e230a96d957'
                        ],
                        district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                        state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                        postalCode: '12',
                        country: 'BGD'
                      },
                      {
                        type: 'PERMANENT',
                        line: [
                          '12',
                          '',
                          '12',
                          '1f06d980-e254-4e6b-b049-a9b4e7155180',
                          '',
                          '34c377a0-2223-4361-851c-5e230a96d957'
                        ],
                        district: '0d6af8ef-2d24-4e7d-93a7-6c0085df2760',
                        state: 'ae181035-fbb4-472a-9222-ecd35b8bae31',
                        postalCode: '12',
                        country: 'BGD'
                      }
                    ]
                  }
                },
                registration: {
                  id: 'fccf6eac-4dae-43d3-af33-2c977d1daf08',
                  attachments: null,
                  status: [
                    {
                      type: 'DECLARED'
                    }
                  ],
                  type: 'DEATH',
                  trackingId: 'DS8QZ0Z',
                  registrationNumber: '2019123223DS8QZ0Z1'
                },
                eventLocation: {
                  id: 'fccf6eac-4dae-43d3-af33-2c977d1daf99',
                  type: 'CURRENT',
                  address: {
                    type: '',
                    line: ['', '', '', '', '', ''],
                    district: '',
                    state: '',
                    postalCode: '',
                    country: 'BGD'
                  }
                },
                mannerOfDeath: 'ACCIDENT',
                causeOfDeathMethod: 'Natural',
                causeOfDeath: '123'
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          scope={scope}
          staticContext={mock}
          event={draft.event}
          registerForm={getReviewForm(store.getState()).death}
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
          draftId={draft.id}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()
      const data = testComponent.component
        .find(RegisterForm)
        .prop('draft') as IDraft

      expect(data.data.causeOfDeath).toEqual({
        causeOfDeathEstablished: true,
        causeOfDeathCode: '123',
        methodOfCauseOfDeath: 'Natural'
      })

      testComponent.component.unmount()
    })
  })
  describe('ReviewForm tests for register scope', () => {
    beforeAll(() => {
      getItem.mockReturnValue(declareScope)
      store.dispatch(checkAuth({ '?token': declareScope }))
    })

    it('shows error message for user with declare scope', async () => {
      const draft = createReviewDraft(uuid(), {}, Event.BIRTH)
      const graphqlMock = [
        {
          request: {
            query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
            variables: { id: draft.id }
          },
          result: {
            data: {
              fetchBirthRegistration: {
                child: null,
                mother: null,
                father: null,
                registration: {
                  contact: 'MOTHER',
                  attachments: null,
                  status: null,
                  type: 'BIRTH'
                },
                attendantAtBirth: 'NURSE',
                weightAtBirth: 2,
                birthType: 'SINGLE',
                eventLocation: {
                  address: {
                    country: 'BGD',
                    state: 'state4',
                    district: 'district2',
                    postalCode: '',
                    line: ['Rd #10', '', 'Akua', 'union1', '', 'upazila10'],
                    postCode: '1020'
                  },
                  type: 'PRIVATE_HOME',
                  partOf: 'Location/upazila10'
                },
                presentAtBirthRegistration: 'MOTHER_ONLY'
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        <ReviewForm
          location={mock}
          history={history}
          staticContext={mock}
          scope={scope}
          event={draft.event}
          registerForm={form}
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
          draftId={draft.id}
        />,
        store,
        graphqlMock
      )
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      testComponent.component.update()

      expect(
        testComponent.component
          .find('#review-unauthorized-error-text')
          .children()
          .text()
      ).toBe('We are unable to display this page to you')

      testComponent.component.unmount()
    })
  })
})
