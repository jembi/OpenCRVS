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

import { presignSignatureV4 } from 'minio/dist/main/signing'
import {
  MINIO_ACCESS_KEY,
  MINIO_BUCKET_REGION,
  MINIO_SECRET_KEY,
  MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND,
  MINIO_URL,
  MINIO_PROTOCOL,
  MINIO_BUCKET
} from './constants'

export function signFileUrl(path: string) {
  return presignSignatureV4(
    {
      headers: {
        host: MINIO_URL
      },
      protocol: MINIO_PROTOCOL,
      method: 'GET',
      path: `/${MINIO_BUCKET}/${path}`
    },
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    undefined,
    MINIO_BUCKET_REGION,
    new Date(),
    MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND
  )
}
