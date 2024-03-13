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
import { createTestApp } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { Store } from 'redux'
import * as actions from '@client/notification/actions'
import { TOAST_MESSAGES } from '@client/user/userReducer'
import { AUDIT_ACTION } from '@client/views/SysAdmin/Team/user/UserAuditActionModal'
import { waitForElement } from '@client/tests/wait-for-element'

describe('when app notifies the user', () => {
  let app: ReactWrapper
  let store: Store

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    store = testApp.store
  })

  describe('When user is reconnected', () => {
    beforeEach(() => {
      const action = actions.showUserReconnectedToast()
      store.dispatch(action)
      app.update()
    })

    it('Should display notification', () => {
      expect(store.getState().notification.userReconnectedToast).toEqual(true)
    })

    describe('When user clicks the close button', () => {
      beforeEach(() => {
        app
          .find('#userOnlineReconnectedToastCancel')
          .hostNodes()
          .simulate('click')
        app.update()
      })

      it('Should hide the notification', () => {
        expect(store.getState().notification.userReconnectedToast).toEqual(
          false
        )
      })
    })
  })

  describe('When user submits a form', () => {
    describe('In case of successful submission', () => {
      beforeEach(() => {
        const action = actions.showSubmitFormSuccessToast(
          TOAST_MESSAGES.SUCCESS
        )
        store.dispatch(action)
        app.update()
      })

      it('shows submit success toast', () => {
        expect(app.find('#submissionSuccessToast').hostNodes()).toHaveLength(1)
      })

      it('clicking cancel button should hide the toast', () => {
        app.find('#submissionSuccessToastCancel').hostNodes().simulate('click')
        app.update()
        expect(store.getState().notification.submitFormSuccessToast).toBe(null)
      })
    })

    describe('In case of successful update submission', () => {
      beforeEach(() => {
        const action = actions.showSubmitFormSuccessToast(
          TOAST_MESSAGES.UPDATE_SUCCESS
        )
        store.dispatch(action)
        app.update()
      })
      it('Shows different message for update submission', () => {
        expect(app.find('#submissionSuccessToast').hostNodes().text()).toBe(
          'User details have been updated'
        )
      })
    })

    describe('In case of failed submission', () => {
      beforeEach(() => {
        const action = actions.showSubmitFormErrorToast('userFormFail')
        store.dispatch(action)
        app.update()
      })

      it('shows submit fail toast', () => {
        expect(app.find('#submissionErrorToast').hostNodes()).toHaveLength(1)
      })

      it('clicking cancel button should hide the toast', () => {
        app.find('#submissionErrorToastCancel').hostNodes().simulate('click')
        app.update()
        expect(store.getState().notification.submitFormErrorToast).toBe(null)
      })
    })
    describe('In case of user audit successful submission', () => {
      beforeEach(() => {
        const action = actions.showUserAuditSuccessToast(
          'John Doe',
          AUDIT_ACTION.DEACTIVATE
        )
        store.dispatch(action)
        app.update()
      })

      it('shows submit success toast', () => {
        expect(app.find('#userAuditSuccessToast').hostNodes().text()).toBe(
          'John Doe was deactivated'
        )
        expect(app.find('#userAuditSuccessToast').hostNodes()).toHaveLength(1)
      })

      it('clicking cancel button should hide the toast', () => {
        app.find('#userAuditSuccessToastCancel').hostNodes().simulate('click')
        app.update()
        expect(
          store.getState().notification.userAuditSuccessToast.visible
        ).toBe(false)
      })
    })
  })

  describe('when user successfully updates PIN', () => {
    beforeEach(() => {
      store.dispatch(actions.showPINUpdateSuccessToast())
    })
    it('shows PIN update success notification', async () => {
      expect(await waitForElement(app, '#PINUpdateSuccessToast')).toBeDefined()
    })

    it('clicking cancel button hides PIN update success notification', async () => {
      const cancelButtonElement = await waitForElement(
        app,
        '#PINUpdateSuccessToastCancel'
      )
      cancelButtonElement.hostNodes().simulate('click')
      app.update()
      expect(app.find('#PINUpdateSuccessToast').hostNodes().length).toBe(0)
    })
  })
})
