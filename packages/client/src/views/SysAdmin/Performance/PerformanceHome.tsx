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
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { messages } from '@client/i18n/messages/views/performance'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { ISearchLocation } from '@opencrvs/components/lib/LocationSearch'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import React, { useState, useEffect, useCallback } from 'react'
import { parse } from 'query-string'
import { ITheme } from '@opencrvs/components/lib/theme'
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { DateRangePicker } from '@client/components/DateRangePicker'
import subMonths from 'date-fns/subMonths'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { LocationPicker } from '@client/components/LocationPicker'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { Query } from '@client/components/Query'
import {
  CORRECTION_TOTALS,
  PERFORMANCE_METRICS,
  PERFORMANCE_STATS
} from './metricsQuery'
import { ApolloError } from '@apollo/client'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { CompletenessReport } from '@client/views/SysAdmin/Performance/CompletenessReport'
import { RegistrationsReport } from '@client/views/SysAdmin/Performance/RegistrationsReport'
import type {
  GQLCorrectionMetric,
  GQLTotalMetricsResult
} from '@client/utils/gateway-deprecated-do-not-use'
import { GET_TOTAL_PAYMENTS } from '@client/views/SysAdmin/Performance/queries'
import { PaymentsAmountComponent } from '@client/views/SysAdmin/Performance/PaymentsAmountComponent'
import { CertificationRatesReport } from '@client/views/SysAdmin/Performance/CertificationRatesReport'
import {
  getAdditionalLocations,
  CompletenessRateTime,
  isCountry,
  NATIONAL_ADMINISTRATIVE_LEVEL,
  calculateTotal
} from '@client/views/SysAdmin/Performance/utils'
import { StatusMapping } from './WorkflowStatus'
import { constantsMessages } from '@client/i18n/messages/constants'
import { CorrectionsReport } from '@client/views/SysAdmin/Performance/CorrectionsReport'
import { AppSources } from './ApplicationSourcesReport'
import { LocationStatsView } from './LocationStatsView'
import {
  IStatusMapping,
  StatusWiseDeclarationCountView
} from './reports/operational/StatusWiseDeclarationCountView'
import {
  generateCompletenessRatesUrl,
  generatePerformanceHomeUrl,
  generateWorkflowStatusUrl
} from '@client/navigation'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { ICurrency } from '@client/utils/referenceApi'
import { Box } from '@opencrvs/components/lib/Box'
import startOfMonth from 'date-fns/startOfMonth'
import { UserDetails } from '@client/utils/userUtils'
import { Text as StyledText } from '@opencrvs/components'

const Layout = styled.div`
  display: flex;
  width: 100%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    flex-direction: column;
  }
  gap: 16px;
`
const LayoutLeft = styled.div`
  flex-grow: 1;
  & > div {
    min-height: 80vh;
    flex-grow: 1;
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
      width: auto;
      max-width: 720px;
      margin-bottom: 0;
    }
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
      max-width: none;
      margin-bottom: 24px;
    }
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
      min-height: 100vh;
    }
  }

  .performance-block {
    &:not(:last-child) {
      margin-bottom: 40px;
    }
  }
`
const LayoutRight = styled.div`
  margin: 24px auto;
  width: 335px;
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
    max-width: 720px;
    margin-top: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const ResponsiveModalContent = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`

const LocationStats = styled(Box)`
  margin: 0 auto;
  width: 100%;
  height: auto;
  flex-basis: 20vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`
const RegistrationStatus = styled(Box)`
  width: 100%;
  height: auto;
  flex-basis: 48vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`

const Devider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  margin-bottom: 16px;
`

const ConnectivityContainer = styled.div`
  justify-content: center;
  gap: 8px;
  display: flex;
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

interface IConnectProps {
  locations: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  currency: ICurrency
}

interface ISearchParams {
  /* TODO the event type should be changed because Event is birth/death.
  WorkflowStatus.tsx, StatusWiseDeclarationCountView requires BIRTH/DEATH.
  GraphQL Queries in PerformanceHome.tsx also require BIRTH/DEATH.
  Due to that we had to use toUpperCase where it is required.
  */
  event: EventType
  locationId: string
  timeStart: string
  timeEnd: string
}

interface IMetricsQueryResult {
  getTotalMetrics: GQLTotalMetricsResult
}

type IOnlineStatusProps = {
  isOnline: boolean
}

type Props = WrappedComponentProps &
  IOnlineStatusProps & {
    userDetails: UserDetails | null
    scopes: Scope[] | null
  } & IConnectProps & {
    theme: ITheme
  }

const selectLocation = (
  locationId: string,
  searchableLocations: ISearchLocation[]
) => {
  return searchableLocations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
}
interface ICorrectionsQueryResult {
  getTotalCorrections: Array<GQLCorrectionMetric>
}

const PerformanceHomeComponent = (props: Props) => {
  const { locations, offices, intl, isOnline, userDetails, currency } = props

  const navigate = useNavigate()
  const location = useLocation()

  const parsedSearch = parse(location.search) as unknown as ISearchParams

  const searchParams = {
    locationId: parsedSearch.locationId,
    timeStart:
      (parsedSearch.timeStart && new Date(parsedSearch.timeStart)) ||
      new Date(
        startOfMonth(subMonths(new Date(Date.now()), 11)).setHours(0, 0, 0, 0)
      ),
    timeEnd:
      (parsedSearch.timeEnd && new Date(parsedSearch.timeEnd)) ||
      new Date(new Date(Date.now()).setHours(23, 59, 59, 999)),
    event: parsedSearch.event || EventType.Birth
  }

  let { locationId } = searchParams

  // Defaults empty URL locationId to your primary office if you don't have access to all locations via scopes
  if (
    userDetails &&
    !locationId &&
    !props.scopes?.includes(SCOPES.ORGANISATION_READ_LOCATIONS)
  ) {
    locationId = userDetails.primaryOffice.id
  }

  const selectedLocation = !searchParams.locationId
    ? getAdditionalLocations(props.intl)[0]
    : selectLocation(
        searchParams.locationId,
        generateLocations({ ...locations, ...offices }, props.intl).concat(
          getAdditionalLocations(props.intl)
        )
      )

  const isOfficeSelected = useCallback(
    (selectedLocation?: ISearchLocation) => {
      if (selectedLocation) {
        return Object.keys(offices).some((id) => id === selectedLocation.id)
      }
      return false
    },
    [offices]
  )

  const isAccessibleOfficeSelected = useCallback(
    (selectedLocation?: ISearchLocation) => {
      if (
        selectedLocation &&
        isOfficeSelected(selectedLocation) &&
        userDetails
      ) {
        if (props.scopes?.includes(SCOPES.ORGANISATION_READ_LOCATIONS)) {
          return true
        } else if (
          props.scopes?.includes(
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
          ) &&
          userDetails.primaryOffice?.id === selectedLocation.id
        ) {
          return true
        }
      }
      return false
    },
    [isOfficeSelected, userDetails, props.scopes]
  )

  const [toggleStatus, setToggleStatus] = useState(false)
  const [officeSelected, setOfficeSelected] = useState(
    isOfficeSelected(selectedLocation)
  )
  const [isAccessibleOffice, setIsAccessibleOffice] = useState(
    isAccessibleOfficeSelected(selectedLocation)
  )

  useEffect(() => {
    setOfficeSelected(isOfficeSelected(selectedLocation))
    setIsAccessibleOffice(isAccessibleOfficeSelected(selectedLocation))
  }, [selectedLocation, isAccessibleOfficeSelected, isOfficeSelected])

  const togglePerformanceStatus = () => {
    setToggleStatus(!toggleStatus)
  }

  const onClickDetails = (time: CompletenessRateTime) => {
    navigate(
      generateCompletenessRatesUrl({
        time,
        locationId:
          selectedLocation && !isCountry(selectedLocation)
            ? selectedLocation.id
            : undefined,
        eventType: searchParams.event,
        timeStart: searchParams.timeStart,
        timeEnd: searchParams.timeEnd
      })
    )
  }

  const getFilter = (intl: IntlShape, selectedLocation: ISearchLocation) => {
    const { id: locationId } = selectedLocation

    return (
      <>
        <LocationPicker
          additionalLocations={getAdditionalLocations(intl)}
          selectedLocationId={locationId || NATIONAL_ADMINISTRATIVE_LEVEL}
          onChangeLocation={(newLocationId) => {
            const newLocation = selectLocation(
              newLocationId,
              generateLocations(
                {
                  ...locations,
                  ...offices
                },
                intl
              ).concat(getAdditionalLocations(intl))
            )

            navigate(
              generatePerformanceHomeUrl({
                timeStart: searchParams.timeStart,
                timeEnd: searchParams.timeEnd,
                event: searchParams.event,
                locationId: newLocation.id
              })
            )
          }}
        />
        <PerformanceSelect
          onChange={(option) => {
            navigate(
              generatePerformanceHomeUrl({
                timeStart: searchParams.timeStart,
                timeEnd: searchParams.timeEnd,
                event: option.value as EventType,
                locationId
              })
            )
          }}
          id="eventSelect"
          withLightTheme={true}
          defaultWidth={110}
          value={searchParams.event}
          options={[
            {
              label: intl.formatMessage(messages.eventOptionForBirths),
              value: EventType.Birth
            },
            {
              label: intl.formatMessage(messages.eventOptionForDeaths),
              value: EventType.Death
            }
          ]}
        />
        <DateRangePicker
          startDate={searchParams.timeStart}
          endDate={searchParams.timeEnd}
          onDatesChange={({ startDate, endDate }) => {
            navigate(
              generatePerformanceHomeUrl({
                timeStart: startDate,
                timeEnd: endDate,
                event: searchParams.event,
                locationId: searchParams.locationId
              })
            )
          }}
        />
      </>
    )
  }

  const onClickStatusDetails = (status?: keyof IStatusMapping) => {
    const { id: locationId } = selectedLocation
    navigate(
      generateWorkflowStatusUrl({
        locationId,
        timeStart: searchParams.timeStart,
        timeEnd: searchParams.timeEnd,
        status,
        event: searchParams.event
      })
    )
  }

  const queryVariablesWithoutLocationId = {
    timeStart: searchParams.timeStart.toISOString(),
    timeEnd: searchParams.timeEnd.toISOString(),
    event: searchParams.event.toUpperCase()
  }

  return (
    <SysAdminContentWrapper
      id="performanceHome"
      isCertificatesConfigPage={true}
      mapPerformanceClickHandler={togglePerformanceStatus}
      hideBackground={true}
    >
      <Layout>
        <LayoutLeft>
          <Content
            title={intl.formatMessage(navigationMessages.performance)}
            size={ContentSize.LARGE}
            filterContent={getFilter(intl, selectedLocation)}
          >
            {isOnline ? (
              <>
                <Query
                  query={PERFORMANCE_METRICS}
                  fetchPolicy="cache-and-network"
                  variables={
                    selectedLocation && !isCountry(selectedLocation)
                      ? {
                          ...queryVariablesWithoutLocationId,
                          locationId: selectedLocation.id
                        }
                      : queryVariablesWithoutLocationId
                  }
                >
                  {({
                    loading,
                    error,
                    data
                  }: {
                    loading: boolean
                    error?: ApolloError
                    data?: IMetricsQueryResult
                  }) => {
                    if (error) {
                      return <GenericErrorToast />
                    }

                    if (loading && !data) {
                      return <Spinner id="performance-home-loading" size={24} />
                    }

                    return (
                      <>
                        {!officeSelected && (
                          <CompletenessReport
                            data={data!.getTotalMetrics}
                            selectedEvent={
                              searchParams.event.toUpperCase() as
                                | 'BIRTH'
                                | 'DEATH'
                            }
                            onClickDetails={onClickDetails}
                          />
                        )}
                        <RegistrationsReport
                          data={data!.getTotalMetrics}
                          selectedEvent={
                            searchParams.event.toUpperCase() as
                              | 'BIRTH'
                              | 'DEATH'
                          }
                          timeStart={searchParams.timeStart.toISOString()}
                          timeEnd={searchParams.timeEnd.toISOString()}
                          locationId={selectedLocation.id}
                        />
                        <CertificationRatesReport
                          totalRegistrations={calculateTotal(
                            data?.getTotalMetrics.results || []
                          )}
                          {...(selectedLocation && !isCountry(selectedLocation)
                            ? {
                                ...queryVariablesWithoutLocationId,
                                locationId: selectedLocation.id
                              }
                            : queryVariablesWithoutLocationId)}
                        />
                        <AppSources
                          data={data!.getTotalMetrics}
                          isAccessibleOffice={isAccessibleOffice}
                          locationId={
                            isCountry(selectedLocation)
                              ? undefined
                              : selectedLocation.id
                          }
                          timeStart={searchParams.timeStart.toISOString()}
                          timeEnd={searchParams.timeEnd.toISOString()}
                          event={searchParams.event}
                        />
                      </>
                    )
                  }}
                </Query>
                <Query
                  fetchPolicy="cache-and-network"
                  query={CORRECTION_TOTALS}
                  variables={
                    selectedLocation && !isCountry(selectedLocation)
                      ? {
                          ...queryVariablesWithoutLocationId,
                          locationId: selectedLocation.id
                        }
                      : queryVariablesWithoutLocationId
                  }
                >
                  {({
                    loading,
                    error,
                    data
                  }: {
                    loading: boolean
                    error?: ApolloError
                    data?: ICorrectionsQueryResult
                  }) => {
                    if (error) {
                      return <GenericErrorToast />
                    }

                    if (loading) {
                      return null
                    }
                    return (
                      <CorrectionsReport data={data!.getTotalCorrections} />
                    )
                  }}
                </Query>
                <Query
                  fetchPolicy="cache-and-network"
                  query={GET_TOTAL_PAYMENTS}
                  variables={
                    selectedLocation && !isCountry(selectedLocation)
                      ? {
                          ...queryVariablesWithoutLocationId,
                          locationId: selectedLocation.id
                        }
                      : queryVariablesWithoutLocationId
                  }
                >
                  {({ loading, data, error }) => {
                    if (error) {
                      return <GenericErrorToast />
                    }
                    if (loading) {
                      return null
                    }
                    if (data && data.getTotalPayments) {
                      return (
                        <PaymentsAmountComponent
                          currency={currency}
                          data={data!.getTotalPayments}
                        />
                      )
                    }

                    return <></>
                  }}
                </Query>
              </>
            ) : (
              <ConnectivityContainer>
                <NoConnectivity />
                <Text id="no-connection-text" variant="reg16" element="span">
                  {intl.formatMessage(constantsMessages.noConnection)}
                </Text>
              </ConnectivityContainer>
            )}
          </Content>
        </LayoutLeft>
        <Query
          query={PERFORMANCE_STATS}
          variables={{
            locationId:
              selectedLocation && !isCountry(selectedLocation)
                ? selectedLocation.id
                : undefined,
            populationYear: searchParams.timeEnd.getFullYear(),
            event: searchParams.event,
            status: [
              'IN_PROGRESS',
              'DECLARED',
              'REJECTED',
              'VALIDATED',
              'WAITING_VALIDATION',
              'REGISTERED'
            ],
            officeSelected: officeSelected
          }}
          fetchPolicy="cache-and-network"
          key={Number(isOnline)} // To re-render when online
        >
          {({ loading, data, error }) => {
            if (error) {
              return <GenericErrorToast />
            }
            return (
              <>
                <ResponsiveModal
                  title={intl.formatMessage(constantsMessages.status)}
                  show={toggleStatus}
                  handleClose={togglePerformanceStatus}
                  actions={[]}
                >
                  <ResponsiveModalContent>
                    {loading && !data ? (
                      <Spinner id="modal-data-loading" size={24} />
                    ) : (
                      <>
                        {isOnline && (
                          <StatusWiseDeclarationCountView
                            selectedEvent={searchParams.event}
                            isAccessibleOffice={isAccessibleOffice}
                            statusMapping={StatusMapping}
                            data={data.fetchRegistrationCountByStatus}
                            onClickStatusDetails={onClickStatusDetails}
                          />
                        )}

                        {!officeSelected && isOnline && (
                          <>
                            <Devider />

                            <LocationStatsView
                              registrationOffices={
                                data.getLocationStatistics!.offices
                              }
                              totalRegistrars={
                                data.getLocationStatistics!.registrars
                              }
                              citizen={Math.round(
                                data.getLocationStatistics!.population /
                                  data.getLocationStatistics!.registrars
                              )}
                            />
                          </>
                        )}
                      </>
                    )}
                  </ResponsiveModalContent>
                </ResponsiveModal>
                <LayoutRight>
                  {!officeSelected && (
                    <LocationStats>
                      {!isOnline ? null : loading && !data ? (
                        <Spinner id="location-stats-loading" size={24} />
                      ) : (
                        <LocationStatsView
                          registrationOffices={
                            data.getLocationStatistics!.offices
                          }
                          totalRegistrars={
                            data.getLocationStatistics!.registrars
                          }
                          citizen={Math.round(
                            data.getLocationStatistics!.population /
                              data.getLocationStatistics!.registrars
                          )}
                        />
                      )}
                    </LocationStats>
                  )}

                  <RegistrationStatus>
                    {!isOnline ? (
                      <></>
                    ) : loading && !data ? (
                      <Spinner id="registration-status-loading" size={24} />
                    ) : (
                      <StatusWiseDeclarationCountView
                        selectedEvent={searchParams.event}
                        isAccessibleOffice={isAccessibleOffice}
                        statusMapping={StatusMapping}
                        data={data.fetchRegistrationCountByStatus}
                        onClickStatusDetails={onClickStatusDetails}
                      />
                    )}
                  </RegistrationStatus>
                </LayoutRight>
              </>
            )
          }}
        </Query>
      </Layout>
    </SysAdminContentWrapper>
  )
}

function mapStateToProps(state: IStoreState) {
  const offlineCountryConfiguration = getOfflineData(state)
  const scopes = getScope(state)
  const locations = offlineCountryConfiguration.locations
  const offices = offlineCountryConfiguration.offices

  return {
    locations,
    offices,
    userDetails: getUserDetails(state),
    currency: offlineCountryConfiguration.config.CURRENCY,
    scopes
  }
}

export const PerformanceHome = injectIntl(
  connect(mapStateToProps)(
    withTheme(withOnlineStatus(PerformanceHomeComponent))
  )
)
