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

const Label = styled(Text)``

const Value = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LabelValuePairContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  @media (max-width: 768px) {
    display: grid;
  }
`
interface IInfo {
  label: string
  value: string
}

export function LabelValuePair({ label, value }: IInfo) {
  return (
    <LabelValuePairContainer>
      <Label variant="h4" element="h4">
        {label}:{' '}
      </Label>
      <Value variant="reg18" element="span">
        {value}
      </Value>
    </LabelValuePairContainer>
  )
}
