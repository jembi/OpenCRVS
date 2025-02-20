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
import { Warning } from '../icons'
import { Text } from '@opencrvs/components/src/Text'

interface IWarningProps {
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;
  margin: 24px 0;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`
const StyledParagraph = styled(Text)``

/** @deprecated in favor of `<ErrorText>` */
export function WarningMessage(props: IWarningProps) {
  return (
    <Container ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph variant="bold16" element="span">
        {props.children}
      </StyledParagraph>
    </Container>
  )
}
