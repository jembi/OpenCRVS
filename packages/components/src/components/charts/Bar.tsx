import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { IDataPoint } from './datapoint'
import { ITheme } from '../theme'

export interface IBarChartProps {
  data: IDataPoint[]
}

const Container = styled.div`
  position: relative;
  width: 100%;
`

const Estimate = styled.div`
  height: 60px;
  width: 100%;
  box-sizing: border-box;
  border: 2px dashed ${({ theme }: any) => theme.colors.accent};
  padding: 6px;
`

const Total = styled.div.attrs<{ size: number; colour: string }>({})`
  width: ${({ size }) => size * 100}%;
  background: ${({ colour }) => colour};
  height: 42px;
  top: 50%;
  margin-top: -21px;
  position: absolute;
`

const SectionContainer = styled.div`
  height: 42px;
  display: flex;
  z-index: 1;
  width: 100%;
`

const Section = styled.div.attrs<{ size: number; colour: string }>({})`
  width: ${({ size }) => size * 100}%;
  height: 24px;
  top: 50%;
  position: relative;
  margin-top: -12px;
  background: ${({ colour }) => colour};
  z-index: 1;
`

const calculateSum = (points: IDataPoint[]) =>
  points.reduce((sum, item) => sum + item.value, 0)

export const Bar = withTheme((props: IBarChartProps & { theme: ITheme }) => {
  const { data, theme } = props
  const fromSmallest = [...data].sort((a, b) => a.value - b.value)

  const estimatePoint = fromSmallest.find(({ estimate }) => Boolean(estimate))

  const allTotalPoints = fromSmallest.filter(({ total }) => !total)
  const allOtherPoints = fromSmallest.filter(({ estimate }) => !estimate)

  const otherPointsValue = calculateSum(allOtherPoints)
  const sumOfTotalPoints = calculateSum(allTotalPoints)

  const totalValue =
    allTotalPoints.length > 0 ? sumOfTotalPoints : otherPointsValue

  const colours = [
    theme.colors.chartPrimary,
    theme.colors.chartSecondary,
    theme.colors.chartTertiary
  ]

  if (estimatePoint) {
    return (
      <Container>
        <Estimate>
          <SectionContainer>
            {allOtherPoints.map((dataPoint, i) => {
              if (dataPoint.total) {
                return (
                  <Total
                    key={i}
                    size={dataPoint.value / estimatePoint.value}
                    colour={colours[i]}
                  />
                )
              }
              return (
                <Section
                  key={i}
                  size={dataPoint.value / totalValue}
                  colour={colours[i]}
                />
              )
            })}
          </SectionContainer>
        </Estimate>
      </Container>
    )
  }

  return (
    <Container>
      <SectionContainer>
        {allOtherPoints.map((dataPoint, i) => {
          if (dataPoint.total) {
            return <Total key={i} size={1} colour={colours[i]} />
          }
          return (
            <Section
              key={i}
              size={dataPoint.value / totalValue}
              colour={colours[i]}
            />
          )
        })}
      </SectionContainer>
    </Container>
  )
})
