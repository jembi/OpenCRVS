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
import { colors, gradients, shadows } from './colors'
import { fonts, IFonts } from './fonts'
import { grid, IGrid } from './grid'

// Use alpha-2 country codes

export interface ITheme {
  colors: typeof colors
  gradients: typeof gradients
  shadows: typeof shadows
  fonts: IFonts
  grid: IGrid
}
export const getTheme = (language: string): ITheme => ({
  colors,
  gradients,
  shadows,
  fonts: fonts(language),
  grid
})
