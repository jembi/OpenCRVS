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
export const ORIGINAL_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/original-file-name'
export const SYSTEM_FILE_NAME_SYSTEM =
  'http://opencrvs.org/specs/id/system-file-name'
export const FHIR_SPECIFICATION_URL = 'http://hl7.org/fhir/StructureDefinition/'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const FHIR_OBSERVATION_CATEGORY_URL =
  'http://hl7.org/fhir/observation-category'
export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

export const DOWNLOADED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded`
export const REINSTATED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regReinstated`
export const ASSIGNED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned`
export const VERIFIED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regVerified`
export const UNASSIGNED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regUnassigned`
export const REQUEST_CORRECTION_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/requestCorrection`
export const REQUEST_CORRECTION_OTHER_REASON_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/otherReason`
export const REQUESTING_INDIVIDUAL = `${OPENCRVS_SPECIFICATION_URL}extension/requestingIndividual`
export const HAS_SHOWED_VERIFIED_DOCUMENT = `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`
export const VIEWED_EXTENSION_URL = `${OPENCRVS_SPECIFICATION_URL}extension/regViewed`
export const MARKED_AS_NOT_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/markedAsNotDuplicate`
export const MARKED_AS_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/markedAsDuplicate`
export const DUPLICATE_TRACKING_ID = `${OPENCRVS_SPECIFICATION_URL}extension/duplicateTrackingId`
export const FLAGGED_AS_POTENTIAL_DUPLICATE = `${OPENCRVS_SPECIFICATION_URL}extension/flaggedAsPotentialDuplicate`

export const BIRTH_REG_NO = 'birth-registration-number'
export const DEATH_REG_NO = 'death-registration-number'
export const MARRIAGE_REG_NO = 'marriage-registration-number'
