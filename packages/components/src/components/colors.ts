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

export const colors = {
  // Pallete
  primary: '#d50000', // Red
  secondary: '#ffd600', // Yellow
  tertiary: '#CCCCCC', // grey

  purple: '#8049B7', // in progress
  orange: '#F1B162', // ready for review
  red: '#D53F3F', // requires updates
  green: '#49b78d', // registered
  blue: '#4A8AD7', // certified
  teal: '#4CC1BA', // charts
  yellow: '#EDC55E', // focus state

  // Darks
  indigoDark: '#42639C',
  redDark: '#994040',
  greenDark: '#409977',

  // Lights
  tealLight: '#D3EEE4',

  // Status
  positive: '#49B78D', // green
  neutral: '#F1B162', // orange
  negative: '#D53F3F', // red

  // Monochrome
  white: '#FFFFFF',
  black: '#000',
  grey100: '#F5F5F5', // background
  grey200: '#E8E8E8', // dividers, hover
  grey300: '#CCCCCC', // disabled state, borders
  grey400: '#959595', // placeholder copy
  grey500: '#5B5B5B', // supporting copy
  grey600: '#222222', // copy

  // Opacity
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',

  // Alternative defintions
  copy: '#222222', // grey600
  supportingCopy: '#5B5B5B', // grey500
  placeholderCopy: '#959595', // grey400
  disabled: '#CCCCCC', // grey300
  background: '#F5F5F5', // grey100
  backgroundPrimary: '#eceff1'
}

export const gradients = {
  primary:
    'background: linear-gradient(90deg, rgba(213,0,0,0.8309917717086834) 0%, rgba(255,255,255,0.248358718487395) 100%)'
}

export const shadows = {
  light: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavy: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}
