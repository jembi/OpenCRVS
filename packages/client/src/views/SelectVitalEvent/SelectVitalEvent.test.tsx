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
import { SELECT_VITAL_EVENT } from '@client/navigation/routes'
import { createTestApp, flushPromises, waitForReady } from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { createMemoryRouter } from 'react-router-dom'

describe('when user is selecting the vital event', () => {
  let app: ReactWrapper
  let router: ReturnType<typeof createMemoryRouter>

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    router = testApp.router

    await waitForReady(app)
  })

  describe('when user is in vital event selection view', () => {
    beforeEach(async () => {
      await flushPromises()
      router.navigate(SELECT_VITAL_EVENT, { replace: true })
      await waitForElement(app, '#select_vital_event_view')
    })
    it('lists the options', () => {
      expect(app.find('#select_vital_event_view').hostNodes()).toHaveLength(1)
    })
    describe('when selects "Birth"', () => {
      beforeEach(async () => {
        await flushPromises()
        app.find('#select_birth_event').hostNodes().simulate('change')
        app.find('#continue').hostNodes().simulate('click')
        app.update()
      })
      it('takes user to the event info view', async () => {
        expect(app.find('#content-name').hostNodes().first().text()).toBe(
          'Introduce the birth registration process to the informant'
        )
      })
    })

    describe('when selects "Death"', () => {
      beforeEach(async () => {
        await flushPromises()
        app.find('#select_death_event').hostNodes().simulate('change')
        app.find('#continue').hostNodes().simulate('click')
      })
      it('takes user to the death registration form', () => {
        expect(router.state.location.pathname).toContain('events/death')
      })
    })

    describe('when no event is selected', () => {
      beforeEach(async () => {
        await flushPromises()
        app.find('#continue').hostNodes().simulate('click')
      })
      it('shows the required error to user', () => {
        expect(app.find('#require-error').hostNodes().length).toBe(1)
      })
    })

    describe('when clicked on cross button', () => {
      beforeEach(async () => {
        app.find('#goBack').hostNodes().simulate('click')
        await flushPromises()
        app.update()
      })
      it('go back to home page', async () => {
        expect(window.location.href).toContain('/')
      })
    })
  })
})
