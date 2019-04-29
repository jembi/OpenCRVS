import {
  createTestApp,
  mockOfflineData,
  userDetails,
  assign,
  validToken,
  getItem,
  flushPromises,
  setItem
} from 'tests/util'
import { HOME } from 'navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { getStorageUserDetailsSuccess } from '/profile/profileActions'
import { getOfflineDataSuccess } from 'offline/actions'
import * as fetch from 'jest-fetch-mock'
import { storage } from 'storage'
import * as CommonUtils from 'utils/commonUtils'

storage.getItem = jest.fn()
storage.setItem = jest.fn()
jest.spyOn(CommonUtils, 'isMobileDevice').mockReturnValue(true)

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

describe('when the home page loads for a field worker', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    fetch.mockResponses(
      [JSON.stringify({ data: mockOfflineData.locations }), { status: 200 }],
      [JSON.stringify({ data: mockOfflineData.facilities }), { status: 200 }]
    )
    const testApp = createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))
  })

  describe('when user is in home view', () => {
    const registerUserDetails = Object.assign({}, userDetails)
    registerUserDetails.role = 'LOCAL_REGISTRAR'
    beforeEach(async () => {
      store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
      history.replace(HOME)
      app.update()
      app
        .find('#createPinBtn')
        .hostNodes()
        .simulate('click')
      await flushPromises()
      app.update()
      Array.apply(null, { length: 8 }).map(() => {
        app
          .find('#keypad-1')
          .hostNodes()
          .simulate('click')
      })
      await flushPromises()
      app.update()
    })
    it('lists the actions', () => {
      expect(app.find('#home_action_list').hostNodes()).toHaveLength(1)
    })
    describe('when user clicks the "Declare a new vital event" button', () => {
      beforeEach(() => {
        app
          .find('#new_event_declaration')
          .hostNodes()
          .simulate('click')
      })
      it('changes to new vital event screen', () => {
        expect(app.find('#select_birth_event').hostNodes()).toHaveLength(1)
      })
    })
    describe('when user has a register scope they are redirected to the work-queue', () => {
      beforeEach(async () => {
        store.dispatch(
          getStorageUserDetailsSuccess(JSON.stringify(registerUserDetails))
        )
        app.update()
      })

      it('search result view renders to load list', () => {
        expect(app.find('#search-result-spinner').hostNodes()).toHaveLength(1)
      })
    })
  })
})
