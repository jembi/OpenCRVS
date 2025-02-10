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

import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { getToken } from '@client/utils/authUtils'
import { queryClient } from '@client/v2-events/trpc'

async function uploadFile({
  file,
  transactionId
}: {
  file: File
  transactionId: string
  optionKey: string
}): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('transactionId', transactionId)

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return response
}

async function deleteFile({ filename }: { filename: string }): Promise<void> {
  const response = await fetch('/api/files/' + filename, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (!response.ok) {
    throw new Error('File deletation upload failed')
  }

  return
}

const UPLOAD_MUTATION_KEY = 'uploadFile'
const DELETE_MUTATION_KEY = 'deleteFile'

/* Must match the one defined src-sw.ts */
const CACHE_NAME = 'workbox-runtime'

function withPostfix(str: string, postfix: string) {
  if (str.endsWith(postfix)) {
    return str
  }

  return str + postfix
}

export function getFullURL(filename: string) {
  const minioURL = window.config.MINIO_URL
  if (minioURL && typeof minioURL === 'string') {
    return new URL(filename, withPostfix(minioURL, '/')).toString()
  }

  throw new Error('MINIO_URL is not defined')
}

export async function getPresignedUrl(fileUri: string) {
  const response = await fetch(
    '/api/presigned-url/event-attachments/' + fileUri,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  )

  const res = await response.json()
  return res
}

async function cacheFile(filename: string, file: File) {
  const temporaryBlob = new Blob([file], { type: file.type })
  const cacheKeys = await caches.keys()

  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)
  return cache.put(
    getFullURL(filename),
    new Response(temporaryBlob, { headers: { 'Content-Type': file.type } })
  )
}

async function removeCached(filename: string) {
  const cacheKeys = await caches.keys()
  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)
  return cache.delete(getFullURL(filename))
}

export async function precacheFile(filename: string) {
  const presignedUrl = (await getPresignedUrl(filename)).presignedURL
  const response = await fetch(presignedUrl)
  const blob = await response.blob()
  const file = new File([blob], filename, { type: blob.type })
  await cacheFile(filename, file)
}

queryClient.setMutationDefaults([DELETE_MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: deleteFile
})
queryClient.setMutationDefaults([UPLOAD_MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: uploadFile
})

interface Options {
  onSuccess?: (data: {
    originalFilename: string
    type: string
    filename: string
    option: string
  }) => void
}

export function useFileUpload(fieldId: string, options: Options = {}) {
  const upload = useMutation({
    mutationFn: uploadFile,
    mutationKey: [UPLOAD_MUTATION_KEY, fieldId],
    onMutate: async ({ file, transactionId, optionKey }) => {
      const extension = file.name.split('.').pop()
      const temporaryUrl = `${transactionId}.${extension}`

      await cacheFile(temporaryUrl, file)

      options.onSuccess?.({
        ...file,
        originalFilename: file.name,
        type: file.type,
        filename: temporaryUrl,
        option: optionKey
      })
    }
  })

  const del = useMutation({
    mutationFn: deleteFile,
    mutationKey: [DELETE_MUTATION_KEY, fieldId],
    onSuccess: (data, { filename }) => {
      void removeCached(filename)
    }
  })

  return {
    getFullURL,
    deleteFile: (filename: string) => {
      return del.mutate({ filename })
    },
    uploadFiles: (file: File, optionKey?: string) => {
      return upload.mutate({
        file,
        transactionId: uuid(),
        optionKey: optionKey ?? 'default'
      })
    }
  }
}
