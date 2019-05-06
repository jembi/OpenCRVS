import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import { createTestComponent } from 'src/tests/util'
import { ProfileMenu } from './ProfileMenu'
import { userDetails } from 'src/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'

const { store } = createStore()

describe('when user opens profile menu without user details', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = createTestComponent(<ProfileMenu />, store)
    component = testComponent.component
  })

  it('open menu', () => {
    component
      .find('#ProfileMenuToggleButton')
      .hostNodes()
      .simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })
})

describe('when user opens profile menu with user details', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const testComponent = createTestComponent(<ProfileMenu />, store)
    component = testComponent.component
  })

  it('open menu', () => {
    component
      .find('#ProfileMenuToggleButton')
      .hostNodes()
      .simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })

  it('handle clicks', () => {
    component
      .find('#ProfileMenuToggleButton')
      .hostNodes()
      .simulate('click')

    // Settings click
    component
      .find('#ProfileMenuSubMenu')
      .hostNodes()
      .childAt(1)
      .simulate('click')

    component
      .find('#ProfileMenuSubMenu')
      .hostNodes()
      .childAt(2)
      .simulate('click')

    expect(component.find('#ProfileMenuSubMenu').hostNodes()).toHaveLength(1)
  })
})
