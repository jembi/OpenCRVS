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
import {
  fileUploadHandler,
  documentUploadHandler,
  fileExistsHandler
} from '@documents/features/uploadDocument/handler'
import { vsExportUploaderHandler } from '@documents/features/uploadVSExportFile/handler'
import {
  createPreSignedUrl,
  createPresignedUrlsInBulk
} from '@documents/features/getDocument/handler'
import { svgUploadHandler } from '@documents/features/uploadSvg/handler'
import { MINIO_BUCKET } from '@documents/minio/constants'
import { deleteDocument } from '@documents/features/deleteDocument/handler'

export const getRoutes = () => {
  const routes = [
    // get presigned URL
    {
      method: 'GET',
      path: `/presigned-url/${MINIO_BUCKET}/{fileUri*}`,
      handler: createPreSignedUrl,
      config: {
        tags: ['api']
      }
    },
    // get presigned URLs in bulk
    {
      method: 'POST',
      path: `/presigned-urls`,
      handler: createPresignedUrlsInBulk,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/presigned-url',
      handler: createPreSignedUrl,
      config: {
        tags: ['api']
      }
    },
    // check if file exists
    {
      method: 'GET',
      path: '/files/{filename}',
      handler: fileExistsHandler,
      config: {
        tags: ['api']
      }
    },
    // upload a file to minio
    {
      method: 'POST',
      path: '/files',
      handler: fileUploadHandler,
      config: {
        tags: ['api'],
        payload: {
          allow: ['multipart/form-data'],
          multipart: true,
          output: 'stream'
        }
      }
    },
    // upload a document
    {
      method: 'POST',
      path: '/upload',
      handler: documentUploadHandler,
      config: {
        tags: ['api']
      }
    },
    // upload svg
    {
      method: 'POST',
      path: '/upload-svg',
      handler: svgUploadHandler,
      config: {
        tags: ['api'],
        payload: {
          parse: false
        }
      }
    },
    // upload vs export
    {
      method: 'POST',
      path: '/upload-vs-export',
      handler: vsExportUploaderHandler,
      config: {
        auth: false,
        tags: ['api']
      }
    },
    // delete a document
    {
      method: 'DELETE',
      path: `/files/{filename}`,
      handler: deleteDocument,
      config: {
        tags: ['api']
      }
    },
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    }
  ]
  return routes
}
