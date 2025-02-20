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

import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockOfflineDataDispatch,
  selectOption
} from '@client/tests/util'
import { SystemList } from '@client/views/SysAdmin/Config/Systems/Systems'

import { describe } from 'vitest'
import {
  activateSystem,
  deactivateSystem,
  deleteSystem,
  registerSystem
} from '@client/views/SysAdmin/Config/Systems/mutations'
import { waitForElement } from '@client/tests/wait-for-element'
import { offlineDataReady } from '@client/offline/actions'

describe('render system integration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    ;({ component } = await createTestComponent(<SystemList />, {
      store
    }))
  })

  it('Render system integrations properly ', async () => {
    expect(component.exists('SystemList')).toBeTruthy()
  })
})

describe('render create system integrations', () => {
  let component: ReactWrapper<{}, {}>

  const mocks = [
    {
      request: {
        query: registerSystem,
        variables: {
          system: {
            name: 'Sweet Health Org',
            type: 'HEALTH'
          }
        }
      },
      result: {
        data: {
          registerSystem: {
            __typename: 'registerSystem',
            system: {
              client: '4090df15-f4e5-4f16-ae7e-bb518129d493',
              name: 'Sweet Health Org',
              type: 'HEALTH'
            }
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    const { store } = createStore()

    const { component: testComponent } = await createTestComponent(
      <SystemList />,
      {
        store,
        graphqlMocks: mocks
      }
    )
    component = testComponent
  })

  it('should show the system creation modal after click the create button', async () => {
    component.find('#createClientButton').hostNodes().simulate('click')
    expect(component.exists('ResponsiveModal')).toBeTruthy()
  })

  it('should show the registered system modal ', async () => {
    component.find('#createClientButton').hostNodes().simulate('click')

    component
      .find('#client_name')
      .hostNodes()
      .simulate('change', {
        target: { value: 'Sweet Health Org' }
      })

    component
      .find('#permissions-selectors')
      .hostNodes()
      .simulate('change', {
        target: { value: 'HEALTH' }
      })

    component.find('#submitClientForm').hostNodes().simulate('click')
    component.update()

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    const modal = await waitForElement(component, '#createClientModal')
    expect(modal.first().props().title).toEqual('Sweet Health Org')
  })
})

describe('render create webhook system integrations', () => {
  let component: ReactWrapper<{}, {}>

  const mocks = [
    {
      request: {
        query: registerSystem,
        variables: {
          system: {
            type: 'WEBHOOK',
            name: 'Sweet Webhook',
            settings: {
              dailyQuota: 0,
              webhook: [
                {
                  event: 'birth',
                  permissions: ['child-details', 'mother-details']
                },
                {
                  event: 'death',
                  permissions: ['deceased-details', 'death-encounter']
                }
              ]
            }
          }
        }
      },
      result: {
        data: {
          registerSystem: {
            __typename: 'registerSystem',
            system: {
              client: '4090df15-f4e5-4f16-ae7e-bb518129d493',
              name: 'Sweet Webhook',
              type: 'WEBHOOK'
            }
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    const { store } = createStore()

    const { component: testComponent } = await createTestComponent(
      <SystemList />,
      {
        store,
        graphqlMocks: mocks
      }
    )
    component = testComponent
  })

  it('should show the system creation modal after click the create button', async () => {
    component.find('#createClientButton').hostNodes().simulate('click')
    expect(component.exists('ResponsiveModal')).toBeTruthy()
  })

  it('should show the registered system modal ', async () => {
    component.find('#createClientButton').hostNodes().simulate('click')

    component
      .find('#client_name')
      .hostNodes()
      .simulate('change', {
        target: { value: 'Sweet Webhook' }
      })
    component
      .find('#permissions-selectors')
      .hostNodes()
      .simulate('change', {
        target: { value: 'WEBHOOK' }
      })

    selectOption(component, '#permissions-selectors', 'Webhook')
    ;['child-details', 'mother-details'].forEach((it) => {
      component
        .find(`#birthCheckboxGroup${it}`)
        .hostNodes()
        .simulate('change', {
          checked: true
        })
    })

    component.find('#tab_death').hostNodes().simulate('click')
    component.update()

    selectOption(component, '#permissions-selectors', 'Webhook')
    ;['deceased-details', 'death-encounter'].forEach((it) => {
      component
        .find(`#deathCheckboxGroup${it}`)
        .hostNodes()
        .simulate('change', {
          checked: true
        })
    })
    component.find('#submitClientForm').hostNodes().simulate('click')

    component.update()
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    const modal = await waitForElement(component, '#createClientModal')

    expect(modal.first().props().title).toEqual('Sweet Webhook')
  })
})

describe('render toggle settings', () => {
  let component: ReactWrapper<{}, {}>

  describe('delete system integration', () => {
    beforeEach(async () => {
      const { store } = createStore()
      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      await flushPromises()

      const mocks = [
        {
          request: {
            query: deleteSystem,
            variables: {
              clientId: '4a7ba5bc-46c7-469e-8d61-20dd4d86e79a'
            }
          },
          result: {
            data: {
              deleteSystem: {
                __typename: 'deleteSystem',
                clientId: '4a7ba5bc-46c7-469e-8d61-20dd4d86e79a',
                name: 'WebHook 1'
              }
            }
          }
        }
      ]

      const { component: testComponent } = await createTestComponent(
        <SystemList />,
        {
          store,
          graphqlMocks: mocks
        }
      )
      component = testComponent
    })

    it('should delete system successfully', async () => {
      component
        .find('#toggleMenu-4a7ba5bc-46c7-469e-8d61-20dd4d86e79a-dropdownMenu')
        .hostNodes()
        .first()
        .simulate('click')

      component
        .find(
          '#toggleMenu-4a7ba5bc-46c7-469e-8d61-20dd4d86e79a-Dropdown-Content'
        )
        .find('li')
        .hostNodes()
        .at(3)
        .simulate('click')

      component.find('#delete').hostNodes().simulate('click')
      component.update()
      const modal = await waitForElement(component, '#systemToDeleteSuccess')
      expect(modal.first().text()).toBe('System has been deleted successfully')
    })
  })

  describe('deactivate system integration', () => {
    beforeEach(async () => {
      const { store } = createStore()
      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      await flushPromises()

      const mocks = [
        {
          request: {
            query: deactivateSystem,
            variables: {
              clientId: '4a7ba5bc-46c7-469e-8d61-20dd4d86e79a'
            }
          },
          result: {
            data: {
              deactivateSystem: {
                __typename: 'deactivateSystem',
                clientId: '4a7ba5bc-46c7-469e-8d61-20dd4d86e79a',
                status: 'deactivated'
              }
            }
          }
        }
      ]

      const { component: testComponent } = await createTestComponent(
        <SystemList />,
        {
          store,
          graphqlMocks: mocks
        }
      )
      component = testComponent
    })

    it('should deactivated system successfully', async () => {
      component
        .find('#toggleMenu-4a7ba5bc-46c7-469e-8d61-20dd4d86e79a-dropdownMenu')
        .hostNodes()
        .first()
        .simulate('click')

      component
        .find(
          '#toggleMenu-4a7ba5bc-46c7-469e-8d61-20dd4d86e79a-Dropdown-Content'
        )
        .find('li')
        .hostNodes()
        .at(2)
        .simulate('click')
      component.find('#confirm').hostNodes().simulate('click')
      component.update()
      const modal = await waitForElement(
        component,
        '#toggleClientDeActiveStatusToast'
      )
      expect(modal.first().text()).toBe('Client deactivated')
    })
  })

  describe('active system integration', () => {
    beforeEach(async () => {
      const { store } = createStore()
      store.dispatch(offlineDataReady(mockOfflineDataDispatch))
      await flushPromises()

      const mocks = [
        {
          request: {
            query: activateSystem,
            variables: {
              clientId: '5923118f-c633-40c6-ba97-c3e3cbb412aa'
            }
          },
          result: {
            data: {
              reactivateSystem: {
                __typename: 'reactivateSystem',
                clientId: '5923118f-c633-40c6-ba97-c3e3cbb412aa'
              }
            }
          }
        }
      ]

      const { component: testComponent } = await createTestComponent(
        <SystemList />,
        {
          store,
          graphqlMocks: mocks
        }
      )
      component = testComponent
    })

    it('should active system successfully', async () => {
      component
        .find('#toggleMenu-5923118f-c633-40c6-ba97-c3e3cbb412aa-dropdownMenu')
        .hostNodes()
        .last()
        .simulate('click')

      component
        .find(
          '#toggleMenu-5923118f-c633-40c6-ba97-c3e3cbb412aa-Dropdown-Content'
        )
        .hostNodes()
        .last()
        .find('li')
        .hostNodes()
        .at(1)
        .simulate('click')

      component.find('#confirm').hostNodes().simulate('click')
      component.update()
      const modal = await waitForElement(
        component,
        '#toggleClientActiveStatusToast'
      )
      expect(modal.first().text()).toBe('Client activated')
    })
  })
})
