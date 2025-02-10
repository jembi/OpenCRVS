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
import React, { useState } from 'react'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor
} from 'react-intl'
import styled from 'styled-components'
import { FieldValue, FileFieldValue } from '@opencrvs/commons/client'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import { DocumentPreview } from './DocumentPreview'
import { SingleDocumentPreview } from './SingleDocumentPreview'

const DocumentUploader = styled(ImageUploader)<{ fullWidth?: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.bold14};
  height: 46px;
  text-transform: initial;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
    margin-top: 10px;
  }
`

const FieldDescription = styled.div`
  margin-top: 0px;
  margin-bottom: 6px;
`

type IFullProps = {
  name: string
  label?: string
  file?: FileFieldValue
  description?: string
  fullWidth?: boolean
  allowedDocType?: string[]
  error?: string
  disableDeleteInPreview?: boolean
  onComplete: (file: File | null) => void
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  previewTransformer?: (files: FileFieldValue) => FileFieldValue
  onlyButton?: boolean
} & IntlShapeProps

function SimpleDocumentUploaderComponent({
  allowedDocType,
  name,
  onUploadingStateChanged,
  intl,
  previewTransformer,
  onComplete,
  label,
  file,
  description,
  error: errorProps,
  disableDeleteInPreview,
  requiredErrorMessage,
  touched,
  fullWidth,
  onlyButton
}: IFullProps) {
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState<FileFieldValue | null>(null)
  const [filesBeingUploaded, setFilesBeingUploaded] = useState<
    { label: string }[]
  >([])

  function handleFileChange(uploadedImage: File) {
    setFilesBeingUploaded([
      ...filesBeingUploaded,
      { label: uploadedImage.name }
    ])

    onUploadingStateChanged && onUploadingStateChanged(true)

    if (
      allowedDocType &&
      allowedDocType.length > 0 &&
      !allowedDocType.includes(uploadedImage.type)
    ) {
      onUploadingStateChanged && onUploadingStateChanged(false)
      setFilesBeingUploaded([])
      const newErrorMessage = intl.formatMessage(messages.fileUploadError, {
        type: allowedDocType
          .map((docTypeStr) => docTypeStr.split('/').pop())
          .join(', ')
      })

      setError(newErrorMessage)
    } else {
      onUploadingStateChanged && onUploadingStateChanged(false)
      onComplete(uploadedImage)
      setError('')
      setFilesBeingUploaded([])
    }
  }

  if (onlyButton) {
    return (
      <DocumentUploader
        disabled={Boolean(error)}
        id={name}
        name={name}
        onChange={error ? undefined : handleFileChange}
      >
        {intl.formatMessage(messages.uploadFile)}
      </DocumentUploader>
    )
  }

  function selectForPreview(selectedPreviewImage: FieldValue) {
    if (previewTransformer) {
      return setPreviewImage(
        previewTransformer(selectedPreviewImage as FileFieldValue)
      )
    }
    setPreviewImage(selectedPreviewImage as FileFieldValue)
  }

  function closePreviewSection() {
    setPreviewImage(null)
  }

  function onDelete(image: FieldValue) {
    onComplete(null)
    closePreviewSection()
  }

  const errorMessage =
    (requiredErrorMessage && intl.formatMessage(requiredErrorMessage)) ||
    error ||
    errorProps ||
    ''
  return (
    <>
      {description && <FieldDescription>{description}</FieldDescription>}
      {errorMessage && (touched || error) && (
        <ErrorText id="field-error">{errorMessage}</ErrorText>
      )}
      <SingleDocumentPreview
        attachment={file}
        label={label}
        onDelete={onDelete}
        onSelect={selectForPreview}
      />
      {previewImage && (
        <DocumentPreview
          disableDelete={disableDeleteInPreview}
          goBack={closePreviewSection}
          previewImage={previewImage}
          title={intl.formatMessage(buttonMessages.preview)}
          onDelete={onDelete}
        />
      )}
      {!file && (
        <DocumentUploader
          fullWidth={fullWidth}
          id={name}
          name={name}
          onChange={handleFileChange}
        >
          {intl.formatMessage(messages.uploadFile)}
        </DocumentUploader>
      )}
    </>
  )
}

export const SimpleDocumentUploader = injectIntl<'intl', IFullProps>(
  SimpleDocumentUploaderComponent
)
