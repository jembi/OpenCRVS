import * as moxios from 'moxios'
import * as actions from '@login/login/actions'
import { initialState } from '@login/login/reducer'
import { createStore, AppStore } from '@login/store'
import { resolve } from 'url'
import { client } from '@login/utils/authApi'

import {
  getSubmissionError,
  getResentSMS,
  getsubmitting
} from '@login/login/selectors'
import { mockState } from '@login/tests/util'

describe('actions', () => {
  describe('authenticate', () => {
    it('cleans mobile number by country and dispatch START_STEP_ONE action', () => {
      const action = {
        type: actions.AUTHENTICATE,
        payload: {
          mobile: '+8801711111111',
          password: 'test'
        }
      }
      expect(
        actions.authenticate({ mobile: '01711111111', password: 'test' })
      ).toEqual(action)
    })
  })
})

describe('reducer', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore()

    moxios.install(client)
    moxios.stubRequest(resolve(window.config.AUTH_API_URL, 'authenticate'), {
      status: 200,
      responseText: "{ nonce: '12345' }"
    })
  })

  afterEach(() => {
    moxios.uninstall(client)
  })

  it('updates the state with data ready to send to authorise service', async () => {
    const expectedState = {
      ...initialState,
      submitting: true,
      submissionError: false,
      resentSMS: false,
      stepOneDetails: {
        mobile: '+447111111111',
        password: 'test'
      }
    }

    const action = {
      type: actions.AUTHENTICATE,
      payload: {
        mobile: '+447111111111',
        password: 'test'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state when nonce is returned from the authorise service', () => {
    const expectedState = {
      ...initialState,
      submitting: false,
      submissionError: false,
      resentSMS: false,
      authenticationDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.AUTHENTICATION_COMPLETED,
      payload: {
        nonce: '1234'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })

  it('updates the state when resend SMS is requested', () => {
    const expectedState = {
      ...initialState,
      submitting: false,
      submissionError: false,
      resentSMS: false
    }
    const action = {
      type: actions.RESEND_SMS
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state when nonce is returned from the resendSMS service', () => {
    const expectedState = {
      ...initialState,
      submitting: false,
      submissionError: false,
      resentSMS: true,
      authenticationDetails: {
        nonce: '1234'
      }
    }
    const action = {
      type: actions.RESEND_SMS_COMPLETED,
      payload: {
        nonce: '1234'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('updates the state when resendSMS service failed', () => {
    const expectedState = {
      ...initialState,
      resentSMS: false,
      submissionError: true
    }
    const action = {
      type: actions.RESEND_SMS_FAILED,
      payload: 503
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })

  it('updates the state with data ready to send to verify sms code service', async () => {
    const expectedState = {
      ...initialState,
      submitting: true,
      submissionError: false,
      resentSMS: false
    }

    const action = {
      type: actions.VERIFY_CODE,
      payload: {
        code: '123456'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('validate mobile no and password field when not filled', async () => {
    const action = {
      type: actions.AUTHENTICATE_VALIDATE,
      payload: 500
    }
    expect(actions.authenticate({ mobile: '', password: 'test' })).toEqual(
      action
    )
  })
  it('return error code when validate mobile no format is checked', async () => {
    const action = {
      type: actions.AUTHENTICATE_VALIDATE,
      payload: 503
    }
    expect(
      actions.authenticate({ mobile: 'sd7111111111', password: 'test' })
    ).toEqual(action)
  })
  it('AUTHENTICATE_VALIDATE return errorCode', async () => {
    const expectedState = {
      ...initialState,
      submissionError: true,
      errorCode: 503
    }

    const action = {
      type: actions.AUTHENTICATE_VALIDATE,
      payload: 503
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
  it('succesfully logged in user with correct payload', async () => {
    const expectedState = {
      ...initialState,
      stepSubmitting: false,
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NTY3ODM5NDMsImV4cCI6MTU4ODMxOTk0MywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInNjb3BlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.ggXSgfcD_OJqEd8_pmzw_AoqiqIq5sWXKtReCx6YdbQ'
    }

    const action = {
      type: actions.VERIFY_CODE_COMPLETED,
      payload: {
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NTY3ODM5NDMsImV4cCI6MTU4ODMxOTk0MywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInNjb3BlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.ggXSgfcD_OJqEd8_pmzw_AoqiqIq5sWXKtReCx6YdbQ'
      }
    }
    store.dispatch(action)
    expect(store.getState().login).toEqual(expectedState)
  })
})

describe('selectors', () => {
  it('returns submission error boolean', () => {
    const submissionError = false
    expect(getSubmissionError(mockState)).toEqual(submissionError)
  })
  it('returns resentSMS boolean', () => {
    const resentSMS = false
    expect(getResentSMS(mockState)).toEqual(resentSMS)
  })
  it('returns submitting boolean', () => {
    const submitting = false
    expect(getsubmitting(mockState)).toEqual(submitting)
  })
})
