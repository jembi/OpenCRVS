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
import * as React from 'react'
import { ITheme } from '@opencrvs/components/lib/theme'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { SubHeader } from './utils'

const StatsRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 8px 0;
  & span:first-child {
    ${({ theme }) => theme.fonts.bold14}
    color: ${({ theme }) => theme.colors.copy};
  }
  & span:last-child {
    ${({ theme }) => theme.fonts.reg14}
    color: ${({ theme }) => theme.colors.grey500}
  }
`
interface IPerformanceStatsProps {
  registrationOffices: number
  totalRegistrars: number
  citizen: number
}

type Props = WrappedComponentProps &
  IPerformanceStatsProps & {
    theme: ITheme
  }

class LocationStatsViewComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale
  }

  render() {
    const {
      intl,
      registrationOffices,
      totalRegistrars,

      citizen
    } = this.props

    return (
      <>
        <SubHeader>{intl.formatMessage(messages.stats)}</SubHeader>
        <StatsRow>
          <span>{intl.formatMessage(messages.declarationsStartedOffices)}</span>
          <span>{registrationOffices || 0}</span>
        </StatsRow>
        <StatsRow>
          <span>
            {intl.formatMessage(
              messages.performanceRegistrarsApplicationsLabel
            )}
          </span>
          <span>{totalRegistrars || 0}</span>
        </StatsRow>
        {totalRegistrars > 0 && (
          <StatsRow>
            <span>{intl.formatMessage(messages.registrarsToCitizen)}</span>
            <span>
              {intl.formatMessage(messages.registrarsToCitizenValue, {
                citizen: citizen || 0
              })}
            </span>
          </StatsRow>
        )}
      </>
    )
  }
}

export const LocationStatsView = withTheme(
  injectIntl(LocationStatsViewComponent)
)
