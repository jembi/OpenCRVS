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
import { Text } from '@opencrvs/components/src/Text'

const SubSectionWrapper = styled.div`
  border-top: solid 1px ${({ theme }) => theme.colors.grey200};
  padding: 24px 0;
  flex-direction: row;
`

const Title = styled(Text)``

const Optional = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholderCopy};
  flex-grow: 0;
`

export interface ISubSectionProps {
  label: string
  required?: boolean
  optionalLabel: string
  disabled?: boolean
}

export const SubSectionDivider = ({
  label,
  required,
  optionalLabel,
  disabled
}: ISubSectionProps) => (
  <SubSectionWrapper>
    <Title variant="h3" color="copy" element="h3">
      {label}
    </Title>
    {required === false && (
      <Optional disabled={disabled}>
        &nbsp;&nbsp;•&nbsp;{optionalLabel}
      </Optional>
    )}
  </SubSectionWrapper>
)
