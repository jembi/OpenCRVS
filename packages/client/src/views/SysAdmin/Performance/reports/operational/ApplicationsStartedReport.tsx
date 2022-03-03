/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { messages } from '@client/i18n/messages/views/performance'
import {
  Description,
  SubHeader,
  ReportHeader,
  getJurisdictionLocationIdFromUserDetails,
  isUnderJurisdictionOfUser,
  getPrimaryLocationIdOfOffice
} from '@opencrvs/client/src/views/SysAdmin/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { GQLApplicationsStartedMetrics } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'
import { getOfflineData } from '@client/offline/selectors'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getJurisidictionType } from '@client/utils/locationUtils'
import { goToFieldAgentList } from '@client/navigation'
import moment from 'moment'
import { getUserDetails } from '@client/profile/profileSelectors'
import { SYS_ADMIN_ROLES } from '@client/utils/constants'

const Report = styled.div<{
  total?: boolean
}>`
  ${({ total, theme }) =>
    total ? `background: ${theme.colors.background}; border-radius: 2px;` : ''}
  width: 25%;
  height: 109px;
  padding: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin-bottom: 24px;
  }
`

const ApplicationsStartedReportHeader = styled(ReportHeader)<
  Pick<IStateProps, 'isOfficeSelected'>
>`
  border-top: ${({ isOfficeSelected }) => (!isOfficeSelected ? '1' : '0')}px
    solid ${({ theme }) => theme.colors.grey300};
`

const ApplicationsStartedSubHeader = styled(SubHeader)`
  margin-top: 24px;
`

const Reports = styled.div<{ loading?: boolean }>`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ loading }) => {
      return loading
        ? `${Report}:nth-child(2) {
          display: none;
        }`
        : `{
          width: 100%;
          margin-bottom: 24px;
        }`
    }}
  }
`

const KeyNumber = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2Style};
  position: relative;
  width: 100%;
  height: 100%;
`

const KeyPercentage = styled.span`
  color: ${({ theme }) => theme.colors.placeholderCopy};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin: 16px 10px;
`

const PerformanceLink = styled(LinkButton)<{ disabled: boolean }>`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  ${({ disabled }) =>
    disabled
      ? `
    cursor: default;
    text-decoration-line: none;
    &:hover {
      opacity: 1;
      text-decoration-line: none;
    }`
      : ''}
  &:disabled {
    color: ${({ theme }) => theme.colors.copy};
    background-color: none;
  }
`

const ReportTitle = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

type Props = WrappedComponentProps & BaseProps & IStateProps & IDispatchProps

interface BaseProps {
  data?: GQLApplicationsStartedMetrics
  loading?: boolean
  reportTimeFrom: moment.Moment
  reportTimeTo: moment.Moment
  locationId: string
}

interface IStateProps {
  disableFieldAgentLink: boolean
  isOfficeSelected: boolean
}

interface IDispatchProps {
  goToFieldAgentList: typeof goToFieldAgentList
}

interface States {}

class ApplicationsStartedReportComponent extends React.Component<
  Props,
  States
> {
  getTotal(applicationMetrics: GQLApplicationsStartedMetrics): number {
    return (
      applicationMetrics.fieldAgentApplications +
      applicationMetrics.hospitalApplications +
      applicationMetrics.officeApplications
    )
  }

  getPercentage(
    totalMetrics: GQLApplicationsStartedMetrics,
    value: number
  ): number {
    return value && value > 0
      ? Math.round((value / this.getTotal(totalMetrics)) * 100)
      : 0
  }

  getLoader() {
    const { intl } = this.props
    return (
      <>
        <ReportHeader>
          <SubHeader>
            {intl.formatMessage(messages.applicationsStartedTitle)}
          </SubHeader>
          <LoaderBox width={60} />
        </ReportHeader>

        <Reports id="applications-started-reports-loader">
          <Report total={true}>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
        </Reports>
      </>
    )
  }

  getReport(data: GQLApplicationsStartedMetrics) {
    const {
      intl,
      reportTimeFrom,
      reportTimeTo,
      disableFieldAgentLink,
      isOfficeSelected,
      locationId
    } = this.props
    const { fieldAgentApplications, hospitalApplications, officeApplications } =
      data
    return (
      <>
        <ApplicationsStartedReportHeader isOfficeSelected={isOfficeSelected}>
          <ApplicationsStartedSubHeader>
            {intl.formatMessage(messages.applicationsStartedTitle)}
          </ApplicationsStartedSubHeader>
          <Description>
            {intl.formatMessage(messages.applicationsStartedDescription)}
            {reportTimeFrom.format()} - {reportTimeTo.format()}
          </Description>
        </ApplicationsStartedReportHeader>
        <Reports id="applications-started-reports">
          <Report total={true}>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedTotal)}
            </ReportTitle>
            <KeyNumber id="total-applications">
              {intl.formatNumber(this.getTotal(data))}
            </KeyNumber>
          </Report>
          <Report>
            <PerformanceLink
              disabled={disableFieldAgentLink || false}
              onClick={() => {
                this.props.goToFieldAgentList(
                  locationId,
                  reportTimeFrom.toISOString(),
                  reportTimeTo.toISOString()
                )
              }}
            >
              {intl.formatMessage(messages.applicationsStartedFieldAgents)}
            </PerformanceLink>
            <KeyNumber>
              {intl.formatNumber(fieldAgentApplications)}

              <KeyPercentage id="field-agent-percentage">
                (
                {intl.formatNumber(
                  this.getPercentage(data, fieldAgentApplications)
                )}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedHospitals)}
            </ReportTitle>
            <KeyNumber>
              {intl.formatNumber(hospitalApplications)}

              <KeyPercentage>
                (
                {intl.formatNumber(
                  this.getPercentage(data, hospitalApplications)
                )}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedOffices)}
            </ReportTitle>
            <KeyNumber>
              {intl.formatNumber(officeApplications)}

              <KeyPercentage>
                (
                {intl.formatNumber(
                  this.getPercentage(data, officeApplications)
                )}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
        </Reports>
      </>
    )
  }

  render() {
    const { data, loading } = this.props
    return (
      <>
        {loading && this.getLoader()}
        {data && this.getReport(data)}
      </>
    )
  }
}

export const ApplicationsStartedReport = connect<
  IStateProps,
  IDispatchProps,
  BaseProps,
  IStoreState
>(
  (state: IStoreState, ownProps: BaseProps) => {
    const offlineLocations = getOfflineData(state).locations
    const offlineOffices = getOfflineData(state).offices

    const isOfficeSelected = !!offlineOffices[ownProps.locationId]

    let disableFieldAgentLink = !(
      isOfficeSelected ||
      window.config.FIELD_AGENT_AUDIT_LOCATIONS.includes(
        getJurisidictionType(offlineLocations, ownProps.locationId) as string
      )
    )
    const userDetails = getUserDetails(state)
    if (
      userDetails &&
      userDetails.role &&
      !SYS_ADMIN_ROLES.includes(userDetails.role)
    ) {
      const jurisdictionLocation =
        getJurisdictionLocationIdFromUserDetails(userDetails)
      disableFieldAgentLink = !isUnderJurisdictionOfUser(
        offlineLocations,
        isOfficeSelected
          ? getPrimaryLocationIdOfOffice(
              offlineLocations,
              offlineOffices[ownProps.locationId]
            )
          : ownProps.locationId,
        jurisdictionLocation
      )
    }
    return {
      isOfficeSelected: isOfficeSelected,
      disableFieldAgentLink
    }
  },
  {
    goToFieldAgentList
  }
)(injectIntl(ApplicationsStartedReportComponent))
