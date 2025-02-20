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
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import React from 'react'
import {
  PerformanceTitle,
  PerformanceValue,
  PerformanceListHeader,
  ListContainer,
  calculateTotal,
  ReportContainer,
  TotalDisplayWithPercentage,
  PerformanceListSubHeader
} from '@client/views/SysAdmin/Performance/utils'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/performance'
import type { GQLTotalMetricsResult } from '@client/utils/gateway-deprecated-do-not-use'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { SCOPES } from '@opencrvs/commons/client'

interface ApplicationSourcesProps {
  data: GQLTotalMetricsResult
  locationId?: string
  event?: string
  isAccessibleOffice: boolean
  timeStart: string
  timeEnd: string
}

function ApplicationSourcesReport(props: ApplicationSourcesProps) {
  const { data, isAccessibleOffice } = props
  const navigate = useNavigate()
  const intl = useIntl()
  const userRoles = useSelector(
    (state: IStoreState) => state.userForm.userRoles
  )

  const fieldAgentRoles = userRoles
    .filter((role) => role.scopes.includes(SCOPES.RECORD_SUBMIT_FOR_REVIEW))
    .map((role) => role.id)

  const registrationAgentRoles = userRoles
    .filter((role) => role.scopes.includes(SCOPES.RECORD_SUBMIT_FOR_APPROVAL))
    .map((role) => role.id)

  const registrarRoles = userRoles
    .filter((role) => role.scopes.includes(SCOPES.RECORD_REGISTER))
    .map((role) => role.id)

  return (
    <ListContainer>
      <ReportContainer>
        <ListViewItemSimplified
          label={
            <div>
              <PerformanceListHeader>
                {intl.formatMessage(
                  messages.performanceApplicationSourcesHeader
                )}
              </PerformanceListHeader>
              <PerformanceListSubHeader>
                {intl.formatMessage(
                  messages.performanceApplicationSourcesSubHeader
                )}
              </PerformanceListSubHeader>
            </div>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceTotalLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>{calculateTotal(data.results)}</PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(
                messages.performanceFieldAgentsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter((item) =>
                    fieldAgentRoles.includes(item.practitionerRole)
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
          actions={
            isAccessibleOffice && (
              <LinkButton
                id="field-agent-list-view"
                onClick={() =>
                  navigate({
                    pathname: routes.PERFORMANCE_FIELD_AGENT_LIST,
                    search: stringify({
                      locationId: props.locationId,
                      timeStart: props.timeStart,
                      timeEnd: props.timeEnd,
                      event: props.event
                    })
                  })
                }
              >
                {intl.formatMessage(buttonMessages.view)}
              </LinkButton>
            )
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceHospitalApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter(
                    (item) => item.practitionerRole === 'AUTOMATED'
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceRegistrationAgentsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter((item) =>
                    registrationAgentRoles.includes(item.practitionerRole)
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {' '}
              {intl.formatMessage(
                messages.performanceRegistrarsApplicationsLabel
              )}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <TotalDisplayWithPercentage
                total={calculateTotal(
                  data.results.filter((item) =>
                    registrarRoles.includes(item.practitionerRole)
                  )
                )}
                ofNumber={calculateTotal(data.results)}
              ></TotalDisplayWithPercentage>
            </PerformanceValue>
          }
        />
      </ReportContainer>
    </ListContainer>
  )
}
export const AppSources = ApplicationSourcesReport
