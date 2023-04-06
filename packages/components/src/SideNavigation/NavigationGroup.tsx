/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import * as React from 'react'
import styled from 'styled-components'

export interface INavigationGroup
  extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationGroupContainer = styled.div`
  padding: 6px;
  box-shadow: 0px 8px 2px -8px ${({ theme }) => theme.colors.grey300};
`

interface IProps {
  children?: React.ReactNode
}

export const NavigationGroup = (props: IProps) => {
  return <NavigationGroupContainer>{props.children}</NavigationGroupContainer>
}
