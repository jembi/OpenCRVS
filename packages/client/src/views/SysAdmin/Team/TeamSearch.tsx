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
import { messages } from '@client/i18n/messages/views/performance'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'

import { IOfflineData, ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Header } from '@client/views/SysAdmin/Performance/utils'
import {
  ISearchLocation,
  LocationSearch
} from '@opencrvs/components/lib/LocationSearch'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { constantsMessages } from '@client/i18n/messages/constants'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { Text as StyledText } from '@opencrvs/components/lib/Text'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'

type IOnlineStatusProps = {
  isOnline: boolean
}

type Props = WrappedComponentProps &
  IOnlineStatusProps &
  RouteComponentProps<IOnlineStatusProps> & {
    offlineCountryConfiguration: IOfflineData
  }

interface State {
  selectedLocation: ISearchLocation | undefined
}

const ConnectivityContainer = styled.div`
  justify-content: center;
  gap: 8px;
  display: flex;
  margin-top: 5vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 12px;
  }
`
const NoConnectivity = styled(NoWifi)`
  width: 24px;
`
const Text = styled(StyledText)`
  text-align: center;
`

class TeamSearchComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const historyState = props.router.location.state
    this.state = {
      selectedLocation:
        (historyState && historyState.selectedLocation) || undefined
    }
  }

  searchHandler = (item: ISearchLocation) => {
    this.setState({
      selectedLocation: item
    })
  }

  searchButtonHandler = () => {
    if (this.state.selectedLocation) {
      this.props.router.navigate({
        pathname: routes.TEAM_USER_LIST,
        search: stringify({
          locationId: this.state.selectedLocation.id
        })
      })
    }
  }

  render() {
    const { intl, offlineCountryConfiguration, isOnline } = this.props

    return (
      <SysAdminContentWrapper>
        {isOnline ? (
          <>
            <Header>
              {intl.formatMessage(messages.sysAdminTeamHomeHeader)}
            </Header>

            <LocationSearch
              selectedLocation={this.state.selectedLocation}
              buttonLabel={intl.formatMessage(buttonMessages.search)}
              locationList={Object.values(
                offlineCountryConfiguration.offices
              ).map((location: ILocation) => {
                return {
                  id: location.id,
                  searchableText: location.name,
                  displayLabel: location.name
                }
              })}
              searchHandler={this.searchHandler}
              searchButtonHandler={this.searchButtonHandler}
              errorMessage={intl.formatMessage(messagesSearch.locationNotFound)}
            />
          </>
        ) : (
          <ConnectivityContainer>
            <NoConnectivity />
            <Text id="no-connection-text" variant="reg16" element="span">
              {intl.formatMessage(constantsMessages.noConnection)}
            </Text>
          </ConnectivityContainer>
        )}
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const TeamSearch = withRouter(
  connect(mapStateToProps)(injectIntl(withOnlineStatus(TeamSearchComponent)))
)
