import * as React from 'react'
import { createTestComponent } from '../../tests/util'
import { SecureAccount } from './SecureAccountView'
import { createStore } from 'store'
import { ReactWrapper } from 'enzyme'

describe('Login app > Secure Account Page', () => {
  let component: ReactWrapper

  beforeEach(() => {
    const { store } = createStore()
    const testComponent = createTestComponent(
      <SecureAccount onComplete={() => null} />,
      store
    )
    component = testComponent.component
  })
  it('Renders the secure account page successfully', () => {
    const elem = component.find('#createPinBtn').hostNodes()
    expect(elem).toHaveLength(1)
  })
  it('Create pin button click takes user to create pin screen', async () => {
    component
      .find('#createPinBtn')
      .hostNodes()
      .simulate('click')
    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 50)
    })

    component.update()
    expect(component.find('#keypad-1').hostNodes()).toHaveLength(1)
  })
})
