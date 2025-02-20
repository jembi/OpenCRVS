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
import { Story, Meta } from '@storybook/react'
import styled from 'styled-components'
import { Icon } from '../Icon'
import { IToggleMenuItem, ToggleMenu } from './ToggleMenu'
import React from 'react'
import { Text } from '@opencrvs/components/src/Text'

interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  menuItems: IToggleMenuItem[]
  hide?: boolean
  showSubmenu: boolean
}
const UserNameStyle = styled(Text)``

const UserRoleStyle = styled(Text)``

const header = (
  <>
    <UserNameStyle variant="reg18" element="span">
      Atiq Zaman
    </UserNameStyle>
    <UserRoleStyle variant="reg12" element="span">
      Field Agent
    </UserRoleStyle>
  </>
)

const Template: Story<IProps> = (args) => (
  <div style={{ position: 'relative', width: '300px', height: '200px' }}>
    <ToggleMenu {...args} />
  </div>
)

export const ToggleMenuView = Template.bind({})

ToggleMenuView.args = {
  id: 'birth',
  menuHeader: header,
  toggleButton: (
    <Icon name="DotsThreeVertical" color="primary" size="large" weight="bold" />
  ),
  menuItems: [
    {
      icon: <Icon name="Export" color="primary" size="large" weight="bold" />,
      label: 'Share',
      handler: () => alert('Settings')
    },
    {
      icon: <Icon name="Star" color="primary" size="large" weight="bold" />,
      label: 'Favourite',
      handler: () => alert('Logout')
    }
  ],
  showSubmenu: true
}

export default {
  title: 'Deprecated/Toggle menu',
  component: ToggleMenu,
  parameters: {
    docs: {
      description: {
        component: `<b>Note! Deprecated in favor of \`<DropdownMenu/>\` component.</b>`
      }
    }
  }
} as Meta
