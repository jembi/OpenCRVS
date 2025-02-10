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
import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { IDataPoint, ICategoryDataPoint } from '../chart-datapoint-types'
import { ITheme } from '../theme'
import { Text } from '@opencrvs/components/src/Text'

interface ILegendDataPoint extends IDataPoint {
  percentage: number
}
export interface ILegendProps {
  data: ILegendDataPoint[]
  smallestToLargest: boolean
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Column = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 1em;
  margin-top: 30px;
`

const LegendItemBase = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
  &::after {
    content: ':';
  }
`
const LegendItem = styled(LegendItemBase)<{ colour: string }>`
  &::before {
    background: ${({ colour }) => colour};
  }
`

const EstimateLegendItem = styled(LegendItemBase)`
  &::before {
    height: 8px;
    border: 2px dotted ${({ theme }) => theme.colors.secondary};
    background: transparent;
  }
`

const DataLabel = styled.label`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 1em;
  margin-bottom: auto;
`
const DataTitle = styled(Text)<{ description?: string }>`
  margin: ${({ description }) => (description ? `0` : `0 0 23px 0`)};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
  }
`

const DataDescription = styled(Text)``

const FooterContainer = styled.div`
  display: flex;
  border-top: 1px solid ${({ theme }) => theme.colors.background};
  margin-top: 10px;
  padding-top: 10px;
`
const FooterData = styled.div`
  flex-direction: column;
  flex: 1;
  display: flex;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
`
const FooterDataLabel = styled(Text)``
const FooterIconTitle = styled.div`
  margin-top: 5px;
  display: flex;
`
const FooterIcon = styled.div`
  margin: 0 8px;
`

function LegendHeader({
  dataPoint,
  colour
}: {
  dataPoint: ILegendDataPoint
  colour: string
}) {
  if (dataPoint.estimate) {
    return <EstimateLegendItem>{dataPoint.label}</EstimateLegendItem>
  }

  return <LegendItem colour={colour}>{dataPoint.label}</LegendItem>
}

function LegendBody({ dataPoint }: { dataPoint: ILegendDataPoint }) {
  let title = `${dataPoint.percentage}%`

  if (dataPoint.total) {
    title = dataPoint.value.toString()
  }

  return (
    <DataLabel>
      <DataTitle
        description={dataPoint.description}
        variant="reg18"
        color="secondary"
        element="span"
      >
        {title}
      </DataTitle>
      {!dataPoint.total && dataPoint.description && (
        <DataDescription variant="reg12" element="span">
          {dataPoint.description}
        </DataDescription>
      )}
    </DataLabel>
  )
}

function LegendFooter({
  dataPoints,
  total,
  isTotal
}: {
  dataPoints: ICategoryDataPoint[]
  total: number
  isTotal: boolean | undefined
}) {
  return (
    <FooterContainer>
      {dataPoints.map((dataPoint: ICategoryDataPoint, i) => {
        let title = `${
          total === 0 ? 0 : Math.round((dataPoint.value / total) * 100)
        }%`

        if (isTotal) {
          title = dataPoint.value.toString()
        }
        return (
          <FooterData key={i}>
            <FooterDataLabel variant="reg12" element="span">
              {dataPoint.label}
            </FooterDataLabel>
            <FooterIconTitle>
              <FooterIcon>{dataPoint.icon()}</FooterIcon>
              {title}
            </FooterIconTitle>
          </FooterData>
        )
      })}
    </FooterContainer>
  )
}

export const Legend = withTheme(
  ({ data, theme, smallestToLargest }: ILegendProps & { theme: ITheme }) => {
    const dataPointsWithoutEstimates = data.filter(
      (dataPoint) => !dataPoint.estimate
    )

    let sortedData = data
    if (smallestToLargest) {
      sortedData = [...data].sort((a, b) => a.value - b.value)
    }

    const colours = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiary
    ]

    return (
      <div>
        <Row>
          {sortedData.map((dataPoint, i) => {
            const colour =
              colours[dataPointsWithoutEstimates.indexOf(dataPoint)]
            return (
              <Column key={i}>
                <LegendHeader dataPoint={dataPoint} colour={colour} />
                <LegendBody dataPoint={dataPoint} />
                {dataPoint.categoricalData && (
                  <LegendFooter
                    dataPoints={dataPoint.categoricalData}
                    total={dataPoint.value}
                    isTotal={dataPoint.total}
                  />
                )}
              </Column>
            )
          })}
        </Row>
      </div>
    )
  }
)
