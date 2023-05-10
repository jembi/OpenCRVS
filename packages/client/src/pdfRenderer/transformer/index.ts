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
import { fieldTransformers } from '@client/pdfRenderer/transformer/fieldTransformer'
import { offlineTransformers } from '@client/pdfRenderer/transformer/offlineTransformer'
import { userTransformers } from '@client/pdfRenderer/transformer/userTransformer'
import { IFunctionTransformer } from './types'

/*
  Transforms fields based on pdf template
 */
export const transformers: IFunctionTransformer = {
  ...fieldTransformers,
  ...userTransformers,
  ...offlineTransformers
}
