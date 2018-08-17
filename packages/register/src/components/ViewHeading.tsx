import * as React from 'react'
import styled from '../styled-components'

export interface IViewHeadingProps {
  title: string
  description?: string
  breadcrump?: string
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }) => theme.grid.margin}px 50px;
`

const Breadcrumb = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  letter-spacing: 2.14px;
  font-size: 15px;
  text-transform: uppercase;
  margin-bottom: 20px;
`

const ViewTitle = styled.h2`
  font-size: 32px;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
  font-weight: 100;
`

const ViewDescription = styled.p`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
  margin-top: 5px;
`

export function ViewHeading({
  title,
  description,
  breadcrump
}: IViewHeadingProps) {
  return (
    <ViewHeadingContainer>
      {breadcrump && <Breadcrumb>{breadcrump}</Breadcrumb>}
      <ViewTitle id="view_title">{title}</ViewTitle>
      {description && <ViewDescription>{description}</ViewDescription>}
    </ViewHeadingContainer>
  )
}
