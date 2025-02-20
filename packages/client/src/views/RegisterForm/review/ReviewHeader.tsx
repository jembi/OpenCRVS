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
import styled from 'styled-components'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Text } from '@opencrvs/components'

interface IReviewHeaderProps {
  id?: string
  logoSource?: string
  title?: string
  subject?: string
}

const HeaderContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 16px;
  align-items: center;
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
`

const TitleContainer = styled(Text)`
  text-transform: uppercase;
`

const SubjectContainer = styled(Text)`
  overflow-wrap: anywhere;
`

export const ReviewHeader = (props: IReviewHeaderProps) => {
  const { id, logoSource, title, subject } = props

  return (
    <HeaderContainer>
      <HeaderContent id={id}>
        {logoSource && <CountryLogo size="small" src={logoSource} />}
        <Stack
          direction="column"
          alignItems="flex-start"
          justify-content="flex-start"
          gap={6}
        >
          {title && (
            <TitleContainer
              id={`${id}_title`}
              variant="bold14"
              color="supportingCopy"
              element="span"
            >
              {title}
            </TitleContainer>
          )}
          {subject && (
            <SubjectContainer id={`${id}_subject`} variant="h2" element="h2">
              {subject}
            </SubjectContainer>
          )}
        </Stack>
      </HeaderContent>
    </HeaderContainer>
  )
}
