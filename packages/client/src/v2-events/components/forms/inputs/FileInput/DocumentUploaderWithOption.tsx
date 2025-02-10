/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

import React, { ComponentProps, useState } from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import {
  FileFieldValueWithOption,
  FileFieldWithOptionValue,
  SelectOption
} from '@opencrvs/commons/client'
import { ErrorText } from '@opencrvs/components'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { Select } from '@client/v2-events/features/events/registered-fields/Select'
import { SimpleDocumentUploader } from './SimpleDocumentUploader'
import { DocumentListPreview } from './DocumentListPreview'
import { DocumentPreview } from './DocumentPreview'
import { File } from './FileInput'

const UploadWrapper = styled.div`
  width: 100%;
`

const DorpdownContainer = styled.div`
  flex-grow: 1;
`
const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
`

const DocumentUploadButton = styled(SimpleDocumentUploader)`
  flex-shrink: 0;
`

function getUpdatedFiles(
  prevFiles: FileFieldValueWithOption[],
  newFile: FileFieldValueWithOption
) {
  return [
    ...prevFiles.filter((prevFile) => prevFile.option !== newFile.option),
    newFile
  ]
}

const DocumentTypeRequiredError = {
  id: 'imageUploadOption.upload.documentType',
  defaultMessage: 'Please select the type of document first',
  description: 'Show error message if the document type is not selected'
}

export function DocumentUploaderWithOption({
  ...props
}: Omit<
  ComponentProps<typeof SimpleDocumentUploader>,
  'onComplete' | 'label' | 'error'
> & {
  value: FileFieldWithOptionValue
  onChange: (value?: FileFieldValueWithOption[]) => void
  options: SelectOption[]
  error?: boolean
  hideOnEmptyOption?: boolean
  autoSelectOnlyOption?: boolean
}) {
  const intl = useIntl()

  const { value, onChange, name, description, allowedDocType } = props
  const [files, setFiles] = useState(value)
  const [filesBeingProcessed, setFilesBeingProcessed] = useState<
    Array<{ label: string }>
  >([])

  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  )
  const [errorMessage, setErrorMessage] = useState('')

  const [previewImage, setPreviewImage] =
    useState<FileFieldValueWithOption | null>(null)

  function getFormattedLabelForDocType(docType: string) {
    const label = props.options.find(({ value: val }) => val === docType)?.label
    return label && intl.formatMessage(label)
  }

  const { uploadFiles, deleteFile: deleteFileFromBackend } = useFileUpload(
    name,
    {
      onSuccess: ({ type, originalFilename, filename, option }) => {
        const newFile = {
          filename,
          originalFilename: originalFilename,
          type: type,
          option: option
        }

        setFilesBeingProcessed((prev) =>
          prev.filter(({ label }) => label !== option)
        )

        setFiles((prevFiles) => getUpdatedFiles(prevFiles, newFile))
        onChange(getUpdatedFiles(files, newFile))
        setSelectedOption(undefined)
      }
    }
  )

  function deleteFile(fileName: string) {
    deleteFileFromBackend(fileName)
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.filename !== fileName)
    )
    onChange(files.filter((file) => file.filename !== fileName))
    setPreviewImage(null)
  }

  const remainingOptions = props.options.filter(
    ({ value: val }) => !files.some((file) => file.option === val)
  )

  const documentTypeRequiredErrorMessage = intl.formatMessage(
    DocumentTypeRequiredError
  )

  if (props.hideOnEmptyOption && remainingOptions.length === 0) {
    return null
  }

  if (props.options.length === 1) {
    return (
      <File.Input
        {...props}
        fullWidth={true}
        label={intl.formatMessage(props.options[0].label)}
        value={props.value.length === 0 ? undefined : props.value[0]}
        onChange={(file) => {
          if (file) {
            onChange([{ ...file, option: props.options[0].value }])
          }
        }}
      />
    )
  }

  if (
    props.autoSelectOnlyOption &&
    remainingOptions.length === 1 &&
    remainingOptions[0].value !== selectedOption
  ) {
    setSelectedOption(remainingOptions[0].value)
  }

  return (
    <UploadWrapper>
      {errorMessage && (
        <div id="upload-error">
          <ErrorText>{errorMessage}</ErrorText>
        </div>
      )}
      <DocumentListPreview
        documents={files}
        dropdownOptions={props.options}
        processingDocuments={filesBeingProcessed}
        onDelete={deleteFile}
        onSelect={(document) =>
          setPreviewImage(document as FileFieldValueWithOption)
        }
      />

      <Flex>
        <DorpdownContainer>
          <Select.Input
            id={props.name}
            options={remainingOptions}
            type={'SELECT'}
            value={selectedOption}
            onChange={(val) => {
              setSelectedOption(val)
              setErrorMessage('')
            }}
          />
        </DorpdownContainer>
        <DocumentUploadButton
          {...props}
          allowedDocType={allowedDocType}
          description={description}
          error={selectedOption ? undefined : documentTypeRequiredErrorMessage}
          name={name}
          onlyButton={true}
          onComplete={(newFile) => {
            if (newFile) {
              if (selectedOption) {
                setFilesBeingProcessed((prev) => [
                  ...prev,
                  { label: selectedOption }
                ])

                uploadFiles(newFile, selectedOption)
              } else {
                setErrorMessage(documentTypeRequiredErrorMessage)
              }
            }
          }}
        />
      </Flex>

      {previewImage && (
        <DocumentPreview
          goBack={() => setPreviewImage(null)}
          previewImage={previewImage}
          title={getFormattedLabelForDocType(previewImage.option)}
          onDelete={(file) => {
            deleteFile(file.filename)
          }}
        />
      )}
    </UploadWrapper>
  )
}

export const FileOutput = null
