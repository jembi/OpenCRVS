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

import React, { ComponentProps } from 'react'
import { FileFieldValue } from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { SimpleDocumentUploader } from './SimpleDocumentUploader'

function FileInput(
  props: Omit<
    ComponentProps<typeof SimpleDocumentUploader>,
    'onComplete' | 'label' | 'error'
  > & {
    value: FileFieldValue | undefined
    onChange: (value?: FileFieldValue) => void
    error?: boolean
    label?: string
  }
) {
  const { value, onChange, name, description, allowedDocType } = props

  const [file, setFile] = React.useState(value)

  const { uploadFiles, deleteFile } = useFileUpload(name, {
    onSuccess: ({ type, originalFilename, filename }) => {
      setFile({
        filename,
        originalFilename: originalFilename,
        type: type
      })
      onChange({
        filename,
        originalFilename: originalFilename,
        type: type
      })
    }
  })

  return (
    <SimpleDocumentUploader
      {...props}
      allowedDocType={allowedDocType}
      description={description}
      error={''}
      file={file}
      label={props.label ?? file?.originalFilename}
      name={name}
      onComplete={(newFile) => {
        if (newFile) {
          setFile({
            filename: newFile.name,
            originalFilename: newFile.name,
            type: newFile.type
          })
          uploadFiles(newFile)
        }
        if (!newFile && file) {
          deleteFile(file.filename)
        }
        setFile(undefined)
        onChange(undefined)
      }}
    />
  )
}

const FileOutput = null

export const File = {
  Input: FileInput,
  Output: FileOutput
}
