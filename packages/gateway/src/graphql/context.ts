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
/* eslint-disable import/no-relative-parent-imports */
import PatientAPI from '../features/fhir/patientAPI'
import { IAuthHeader } from '../common-types'
import LocationsAPI from '../features/fhir/locationsAPI'
import PractitionerRoleAPI from '../features/fhir/practitionerRoleAPI'
import MinioAPI from '../features/fhir/minioAPI'
import { Request } from '@hapi/hapi'

export interface Context {
  request: Request
  dataSources: {
    locationsAPI: LocationsAPI
    practitionerRoleAPI: PractitionerRoleAPI
    patientAPI: PatientAPI
    minioAPI: MinioAPI
  }
  headers: IAuthHeader
}
