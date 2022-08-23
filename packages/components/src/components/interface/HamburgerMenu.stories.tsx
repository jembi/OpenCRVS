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
import { Meta, Story } from '@storybook/react'
import { IMenuItem } from '../header'
import { HamburgerMenu } from './HamburgerMenu'
import React from 'react'

interface IProps {
  menuTitle: string
  menuItems: IMenuItem[]
}

const Template: Story<IProps> = (args) => <HamburgerMenu {...args} />
export const HamburgerMenuView = Template.bind({})
HamburgerMenuView.args = {
  menuTitle: 'HamBurger',
  menuItems: [
    {
      title: 'Home',
      key: 'Home',
      onClick: () => alert('Home clicked')
    },
    {
      title: 'Declarations',
      key: 'Declarations',
      onClick: () => alert('Declarations clicked')
    }
  ]
}

export default {
  title: 'Deprecated/Hamburger',
  component: HamburgerMenu
}
