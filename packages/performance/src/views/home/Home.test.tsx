import * as React from 'react'
import { Home } from './Home'
import { ReactWrapper } from 'enzyme'
import { createStore } from 'src/store'
import {
  createTestComponent,
  mockUserResponse,
  userDetails
} from 'src/tests/util'
import { queries } from 'src/profile/queries'
import { setInitialUserDetails } from '@opencrvs/register/src/profile/profileActions'

const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

const { store } = createStore()

describe('when user is in the home page', () => {
  let homeComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const testComponent = createTestComponent(<Home />, store)
    store.dispatch(setInitialUserDetails(userDetails))
    homeComponent = testComponent.component
    homeComponent.update()
  })

  it('renders box title', () => {
    expect(
      homeComponent
        .find('#box_title')
        .hostNodes()
        .text()
    ).toBe('Birth Registration Key Figures')
  })

  it('renders bar chart box title', () => {
    expect(
      homeComponent
        .find('#bar_chart_box_title')
        .hostNodes()
        .text()
    ).toBe('At What Age Are Births Registered In Children Aged 0-10 Years')
  })

  it('renders line chart box title', () => {
    expect(
      homeComponent
        .find('#line_chart_box_title')
        .hostNodes()
        .text()
    ).toBe('Birth Rate For Registrations Within 45 Days')
  })

  it('renders footer text', () => {
    expect(
      homeComponent
        .find('#footer_text')
        .hostNodes()
        .text()
    ).toBe('Estimates provided using National Population Census data')
  })
})
