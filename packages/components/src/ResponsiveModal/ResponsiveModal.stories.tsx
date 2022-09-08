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
import { ResponsiveModal } from './ResponsiveModal'
import React from 'react'

interface IProps {
  id?: string
  title: string
  show: boolean
  responsive?: boolean
  width?: number
  contentHeight?: number
  contentScrollableY?: boolean
  actions: JSX.Element[]
  handleClose?: () => void
  hideHeaderBoxShadow?: boolean
}

const Template: Story<IProps> = (args) => (
  <ResponsiveModal {...args}>Children elements will go here</ResponsiveModal>
)

export const ResponsiveModalView = Template.bind({})
ResponsiveModalView.args = {
  title: 'Are you ready to submit?',
  actions: [
    <PrimaryButton key="submit" onClick={() => alert('Submit button clicked')}>
      Submit
    </PrimaryButton>,
    <button key="preview" onClick={() => alert('Preview Button clicked')}>
      Preview
    </button>
  ],
  show: true,
  handleClose: () => {
    alert('Closed')
  }
}
export default {
  title: 'Layout/Dialog',
  component: ResponsiveModal
} as Meta
