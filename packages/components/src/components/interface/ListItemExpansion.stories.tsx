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
import { PrimaryButton } from '../buttons'
import { ListItemExpansion } from './ListItemExpansion'
import React from 'react'

interface IProps {
  actions?: JSX.Element[]
}

const Template: Story<IProps> = (args) => <ListItemExpansion {...args} />

export const ListItemExpansionView = Template.bind({})
ListItemExpansionView.args = {
  actions: [
    <PrimaryButton key="[rimary action" onClick={() => alert('action clicked')}>
      Expansion Action
    </PrimaryButton>
  ]
}

export default {
  title: 'Deprecated/ListItemExpansion',
  component: ListItemExpansion
} as Meta
