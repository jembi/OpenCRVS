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

import darken from 'polished/lib/color/darken'
import lighten from 'polished/lib/color/lighten'

const config = {
  // Pallete
  primary: '#4972BB', // indigo
  secondary: '#4A8AD7', // blue
  tertiary: '#CCCCCC', // grey

  purple: '#8049B7', // in progress
  orange: '#F1B162', // ready for review
  red: '#D53F3F', // requires updates
  green: '#49b78d', // registered
  blue: '#4A8AD7', // certified
  teal: '#4CC1BA', // charts
  yellow: '#EDC55E', // focus state

  // Status
  positive: '#49B78D', // green
  neutral: '#F1B162', // orange
  negative: '#D53F3F', // red

  // Monochrome
  white: '#FFFFFF',
  grey100: '#F5F5F5', // background
  grey200: '#E8E8E8', // dividers, hover
  grey300: '#CCCCCC', // disabled state, borders
  grey400: '#959595', // placeholder copy
  grey500: '#5B5B5B', // supporting copy
  grey600: '#222222', // copy

  // Opacity
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',

  // Alternative definitions
  copy: '#222222', // grey600
  supportingCopy: '#5B5B5B', // grey500
  placeholderCopy: '#959595', // grey400
  disabled: '#CCCCCC', // grey300
  background: '#F5F5F5', // grey100
  backgroundPrimary: '#36304E'
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  light: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavy: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

/**
 * Color palette with auto-generated light / dark colors from color configuration
 */
export const colors = {
  ...config,

  primaryDark: darken(0.075)(config.primary),
  positiveDark: darken(0.075)(config.positive),
  negativeDark: darken(0.075)(config.negative),
  tealLight: lighten(0.075)(config.teal)
}
