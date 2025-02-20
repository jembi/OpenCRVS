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
import { EventType } from '@client/utils/gateway'
import { constantsMessages } from '@client/i18n/messages'
import { IDataPoint, LineChart } from '@opencrvs/components/lib/LineChart'
import { ITheme } from '@opencrvs/components/lib/theme'
import React, { useState, useEffect, useCallback } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { CompletenessRateTime } from '@client/views/SysAdmin/Performance/utils'
import { messages } from '@client/i18n/messages/views/performance'
import type { LegendProps } from 'recharts'
import { Text } from '@opencrvs/components'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

interface IProps extends WrappedComponentProps {
  theme: ITheme
  data?: ILineDataPoint[]
  loading?: boolean
  eventType?: EventType
  completenessRateTime?: CompletenessRateTime
}

const CustomLegendContainer = styled.div<{
  marginLeft: number
  marginTop: number
}>`
  margin: ${({ marginTop, marginLeft }) =>
    `${marginTop}px 40px 8px ${marginLeft}px`};
  color: ${({ theme }) => theme.colors.copy};
`

const LegendHeader = styled(Text)`
  padding-bottom: 8px;
  margin-bottom: 8px;
`

const LegendDetails = styled.div`
  display: flex;
  flex-direction: row;
`

const LegendDataLabel = styled(Text)``

const LegendDataValue = styled(Text)``

const LegendData = styled.div`
  padding: 0 8px;
  width: 100%;
  ${({ theme }) => theme.fonts.reg12};
`

const TooltipContent = styled.div`
  ${({ theme }) => theme.fonts.bold16};
`

const LoadingIndicator = styled.div<{
  flexDirection: string
}>`
  padding: 10px 0;
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
`

const DesktopChartLoadingIndicator = styled.div`
  flex: 0 0 80%;
  background: ${({ theme }) => theme.colors.background};
  height: 500px;
`

const MobileChartLoadingIndicator = styled.div`
  background: ${({ theme }) => theme.colors.background};
  height: 200px;
`

const LegendLoadingIndicator = styled.div`
  flex: 1;
`

const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

interface ILineDataPoint {
  label: string
  registeredInTargetDays: number
  totalRegistered: number
  totalEstimate: number
  registrationPercentage: string
}

interface IActiveState {
  value: number
  stroke: string
}

interface IState {
  legendMarginTop: number
  legendMarginLeft: number
  chartTop: number
  chartRight: number
  chartBottom: number
  chartLeft: number
  maximizeXAxisInterval?: boolean
  legendLayout: LegendProps['layout']
  activeLabel: string
  activeRegisteredInTargetDays: IActiveState
  activeTotalRegistered: IActiveState
  activeTotalEstimate: IActiveState
}

function LegendDot(props: React.HTMLAttributes<SVGElement>) {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" {...props}>
      <rect width={10} height={10} rx={5} fill={props.color} />
    </svg>
  )
}

const RegRatesLineChartComponent = (props: IProps) => {
  const { theme, data, intl, eventType, completenessRateTime } = props

  const getStatePropertiesForSmallWindowChart = () => {
    return {
      legendMarginTop: -16,
      legendMarginLeft: 0,
      chartTop: 32,
      chartRight: 40,
      chartBottom: 40,
      chartLeft: 40,
      maximizeXAxisInterval: true,
      legendLayout: 'horizontal' as const
    }
  }

  const getStatePropertiesForLargeWindowChart = () => {
    return {
      legendMarginTop: -16,
      legendMarginLeft: 54,
      chartTop: 32,
      chartRight: 80,
      chartBottom: 40,
      chartLeft: 10,
      maximizeXAxisInterval: false,
      legendLayout: 'vertical' as const
    }
  }

  const getStatePropertiesForChart = useCallback(() => {
    if (window.innerWidth > theme.grid.breakpoints.md) {
      return getStatePropertiesForLargeWindowChart()
    }
    return getStatePropertiesForSmallWindowChart()
  }, [theme])

  const getLatestData = () => {
    const latestData = data && data[data.length - 1]
    return {
      activeLabel: (latestData && latestData.label) || '',
      activeRegisteredInTargetDays: {
        value: (latestData && latestData.registeredInTargetDays) || 0,
        stroke: theme.colors.teal
      },
      activeTotalRegistered: {
        value: (latestData && latestData.totalRegistered) || 0,
        stroke: theme.colors.tealLight
      },
      activeTotalEstimate: {
        value: (latestData && latestData.totalEstimate) || 0,
        stroke: theme.colors.grey300
      }
    }
  }

  const [state, setState] = useState<IState>(() => ({
    ...getStatePropertiesForChart(),
    ...getLatestData()
  }))
  const {
    chartTop,
    chartRight,
    chartBottom,
    chartLeft,
    maximizeXAxisInterval,
    legendLayout,
    legendMarginLeft,
    legendMarginTop
  } = state

  useEffect(() => {
    const recordWindowWidth = () => {
      const latesProperties = getStatePropertiesForChart()
      setState((prev) => ({
        ...prev,
        ...latesProperties
      }))
    }

    window.addEventListener('resize', recordWindowWidth)
    return () => {
      window.removeEventListener('resize', recordWindowWidth)
    }
  }, [getStatePropertiesForChart])

  const customizedLegend = () => {
    const {
      activeLabel,
      activeRegisteredInTargetDays,
      activeTotalRegistered,
      activeTotalEstimate
    } = state.activeLabel ? state : getLatestData()
    return (
      <CustomLegendContainer
        marginLeft={legendMarginLeft}
        marginTop={legendMarginTop}
      >
        <LegendHeader variant="bold16" element="span">
          {activeLabel}
        </LegendHeader>
        <LegendDetails>
          <div>
            <LegendDot color={activeTotalEstimate.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel variant="reg14" element="span">
              {intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
                eventType,
                lineBreak: <span key={'estimated-space'}>&nbsp;</span>
              })}
            </LegendDataLabel>
            <br />
            <LegendDataValue variant="h4" element="span">
              {activeTotalEstimate.value < 10
                ? activeTotalEstimate.value.toFixed(2)
                : Math.round(activeTotalEstimate.value)}
            </LegendDataValue>
          </LegendData>
        </LegendDetails>
        <LegendDetails>
          <div>
            <LegendDot color={activeTotalRegistered.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel variant="reg14" element="span">
              {intl.formatMessage(constantsMessages.totalRegistered, {
                lineBreak: <span key={'totalRegistered-break'}>&nbsp;</span>
              })}
            </LegendDataLabel>
            <br />
            <LegendDataValue variant="h4" element="span">
              {activeTotalRegistered.value}
            </LegendDataValue>
          </LegendData>
        </LegendDetails>
        <LegendDetails>
          <div>
            <LegendDot color={activeRegisteredInTargetDays.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel variant="reg14" element="span">
              {completenessRateTime === CompletenessRateTime.Within5Years
                ? intl.formatMessage(messages.performanceWithin5YearsLabel)
                : completenessRateTime === CompletenessRateTime.Within1Year
                ? intl.formatMessage(messages.performanceWithin1YearLabel)
                : intl.formatMessage(
                    messages.performanceWithinTargetDaysLabel,
                    {
                      target:
                        eventType === EventType.Birth
                          ? window.config.BIRTH.REGISTRATION_TARGET
                          : window.config.DEATH.REGISTRATION_TARGET,
                      withPrefix: false
                    }
                  )}
            </LegendDataLabel>
            <br />
            <LegendDataValue variant="h4" element="span">
              {activeRegisteredInTargetDays.value}
            </LegendDataValue>
          </LegendData>
        </LegendDetails>
      </CustomLegendContainer>
    )
  }

  const customizedTooltip = (dataPoint: IDataPoint) => {
    const wrapperPayload = dataPoint.payload[0]

    return (
      <TooltipContent>
        {wrapperPayload &&
          wrapperPayload.payload &&
          wrapperPayload.payload.registrationPercentage}
      </TooltipContent>
    )
  }

  const mouseMoveHandler: CategoricalChartFunc = (data) => {
    if (data && data.activePayload) {
      setState({
        ...state,
        activeLabel: data.activeLabel || '',
        activeRegisteredInTargetDays: {
          value: data.activePayload[2].value || 0,
          stroke: theme.colors.teal
        },
        activeTotalRegistered: {
          value: data.activePayload[1].value || 0,
          stroke: theme.colors.tealLight
        },
        activeTotalEstimate: {
          value: data.activePayload[0].value || 0,
          stroke: theme.colors.grey200
        }
      })
    }
  }
  const mouseLeaveHandler = () => {
    const latestState = getLatestData()
    setState((prev) => ({ ...prev, ...latestState }))
  }

  const getLoadingIndicatorForMobileView = () => (
    <LoadingIndicator id="reg-rates-line-chart-loader" flexDirection="column">
      <LegendLoadingIndicator>
        <CustomLegendContainer
          marginLeft={legendMarginLeft}
          marginTop={legendMarginTop}
        >
          <LegendHeader variant="bold16" element="span">
            <LoaderBox width={40} />
          </LegendHeader>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LoaderBox width={60} />
              <br />
              <LoaderBox width={20} />
            </LegendData>
          </LegendDetails>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LegendDataLabel variant="reg14" element="span">
                <LoaderBox width={60} />
              </LegendDataLabel>
              <br />
              <LegendDataValue variant="h4" element="span">
                <LoaderBox width={20} />
              </LegendDataValue>
            </LegendData>
          </LegendDetails>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LegendDataLabel variant="reg14" element="span">
                <LoaderBox width={60} />
              </LegendDataLabel>
              <br />
              <LegendDataValue variant="h4" element="span">
                <LoaderBox width={20} />
              </LegendDataValue>
            </LegendData>
          </LegendDetails>
        </CustomLegendContainer>
      </LegendLoadingIndicator>
      <MobileChartLoadingIndicator />
    </LoadingIndicator>
  )

  const getLoadingIndicatorForDesktopView = () => (
    <LoadingIndicator id="reg-rates-line-chart-loader" flexDirection="row">
      <DesktopChartLoadingIndicator />
      <LegendLoadingIndicator>
        <CustomLegendContainer
          marginLeft={legendMarginLeft}
          marginTop={legendMarginTop}
        >
          <LegendHeader variant="bold16" element="span">
            <LoaderBox width={60} />
          </LegendHeader>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LoaderBox width={80} />
              <br />
              <LoaderBox width={40} />
            </LegendData>
          </LegendDetails>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LegendDataLabel variant="reg14" element="span">
                <LoaderBox width={80} />
              </LegendDataLabel>
              <br />
              <LegendDataValue variant="h4" element="span">
                <LoaderBox width={40} />
              </LegendDataValue>
            </LegendData>
          </LegendDetails>
          <LegendDetails>
            <div>
              <LegendDot color={theme.colors.grey300} />
            </div>
            <LegendData>
              <LegendDataLabel variant="reg14" element="span">
                <LoaderBox width={80} />
              </LegendDataLabel>
              <br />
              <LegendDataValue variant="h4" element="span">
                <LoaderBox width={40} />
              </LegendDataValue>
            </LegendData>
          </LegendDetails>
        </CustomLegendContainer>
      </LegendLoadingIndicator>
    </LoadingIndicator>
  )

  const getLoadingIndicator = () => {
    if (window.innerWidth > theme.grid.breakpoints.md) {
      return getLoadingIndicatorForDesktopView()
    }
    return getLoadingIndicatorForMobileView()
  }

  if (data) {
    return (
      <LineChart
        data={data}
        dataKeys={[
          'totalEstimate',
          'totalRegistered',
          'registeredInTargetDays'
        ]}
        mouseMoveHandler={mouseMoveHandler}
        mouseLeaveHandler={mouseLeaveHandler}
        tooltipContent={customizedTooltip}
        legendContent={customizedLegend}
        chartTop={chartTop}
        chartRight={chartRight}
        chartBottom={chartBottom}
        chartLeft={chartLeft}
        maximizeXAxisInterval={maximizeXAxisInterval}
        legendLayout={legendLayout}
      />
    )
  }

  return getLoadingIndicator()
}

export const RegRatesLineChart = withTheme(
  injectIntl(RegRatesLineChartComponent)
)
