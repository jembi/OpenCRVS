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
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'

export const REINSTATED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regReinstated`
export const DOWNLOADED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded`
export const ASSIGNED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned`
export const VERIFIED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regVerified`
export const UNASSIGNED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regUnassigned`
export const REQUEST_CORRECTION_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/requestCorrection`
export const VIEWED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regViewed`
export const MARKED_AS_NOT_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/markedAsNotDuplicate`
export const MARKED_AS_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/markedAsDuplicate`
