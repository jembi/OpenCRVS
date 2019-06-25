import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import { createStore } from '@register/store'
import { CreatePassword } from './CreatePassword'
import { ReactWrapper } from 'enzyme'

const { store } = createStore()

describe('Settings page tests', async () => {
  let component: ReactWrapper
  beforeEach(async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <CreatePassword />,
      store
    )
    component = testComponent.component
  })

  it('it shows passwords missmatch error when Continue button is pressed', () => {
    // @ts-ignore
    component.find('input#NewPassword').simulate('change', {
      target: { id: 'NewPassword', value: '0crvsPassword' }
    })
    component.find('input#ConfirmPassword').simulate('change', {
      target: { id: 'ConfirmPassword', value: 'missmatch' }
    })
    component.find('button#Continue').simulate('click')
    expect(
      component
        .find('#GlobalError')
        .hostNodes()
        .text()
    ).toEqual('Passwords do not match')

    component.unmount()
  })
  it('it shows passwords required error when Continue button is pressed', () => {
    component.find('button#Continue').simulate('click')
    expect(
      component
        .find('#GlobalError')
        .hostNodes()
        .text()
    ).toEqual('New password is not valid')

    component.unmount()
  })
})
