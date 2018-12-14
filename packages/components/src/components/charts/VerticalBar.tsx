import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'
import { ITheme } from '../theme'
import { IDataPoint } from './datapoint'
import { CustomizedXAxisTick } from './AxisTick'

const Container = styled.div`
  margin-top: 30px;
  box-sizing: border-box;
  height: 250px;
  width: 100%;
  align-items: center;
`

interface IVerticalBarProps {
  data: IDataPoint[]
  xAxisLabel: string
  yAxisLabel: string
}

const sumUpAllValues = (data: IDataPoint[]) =>
  data.reduce((sum: number, item: IDataPoint) => sum + item.value, 0)

export const VerticalBar = withTheme(
  (props: IVerticalBarProps & { theme: ITheme }) => {
    const { data, theme, xAxisLabel, yAxisLabel } = props
    const colours = [
      theme.colors.chartPrimary,
      theme.colors.chartSecondary,
      theme.colors.chartTertiary
    ]

    return (
      <Container>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            width={600}
            height={250}
            data={data}
            margin={{ top: 0, right: 0, bottom: 40, left: 20 }}
            barCategoryGap={0}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colours[1]} stopOpacity={0.9} />
                <stop offset="95%" stopColor={colours[2]} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <XAxis
              height={80}
              tick={(tickProps: {
                stroke: number
                x: number
                y: number
                payload: { value: string }
              }) => {
                const { payload } = tickProps
                const dataPoint = data.find(
                  ({ label }) => label === payload.value
                )

                return (
                  <CustomizedXAxisTick
                    {...tickProps}
                    totalValue={sumUpAllValues(data)}
                    payload={{
                      label: payload.value,
                      value: dataPoint ? dataPoint.value : 0
                    }}
                  />
                )
              }}
              tickLine={false}
              axisLine={false}
              dataKey="label"
            >
              <Label
                fill={theme.colors.secondary}
                fontFamily={theme.fonts.lightFont}
                offset={20}
                value={xAxisLabel}
                position="bottom"
              />
            </XAxis>
            <YAxis width={30} tickLine={false} axisLine={false} tick={false}>
              <Label
                fill={theme.colors.secondary}
                fontFamily={theme.fonts.lightFont}
                transform="rotate(-90)"
                dy={-40}
                offset={20}
                value={yAxisLabel}
                position="left"
              />
            </YAxis>
            <CartesianGrid
              vertical={false}
              horizontal={false}
              fillOpacity="0.05"
              fill={theme.colors.accentLight}
            />

            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell
                  cursor="pointer"
                  fill={index % 2 === 0 ? colours[0] : 'url(#colorUv)'}
                  key={`cell-${index}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Container>
    )
  }
)
