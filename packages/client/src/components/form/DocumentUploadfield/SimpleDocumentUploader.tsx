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
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { IFormFieldValue, IAttachmentValue } from '@client/forms'
import * as React from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  MessageDescriptor
} from 'react-intl'
import styled from 'styled-components'
import { DocumentListPreview } from './DocumentListPreview'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import { getBase64String, ErrorMessage } from './DocumentUploaderWithOption'

const DocumentUploader = styled(ImageUploader)`
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.bold14};
  height: 40px;
  text-transform: initial;

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
  label: string
  files?: IAttachmentValue
  description?: string
  allowedDocType?: string[]
  error?: string
  disableDeleteInPreview?: boolean
  onComplete: (files: IAttachmentValue | {}) => void
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  previewTransformer?: (files: IAttachmentValue) => IAttachmentValue
} & IntlShapeProps

type IState = {
  error: string
  previewImage: IAttachmentValue | null
  filesBeingUploaded: Array<{ label: string }>
}
class SimpleDocumentUploaderComponent extends React.Component<
  IFullProps,
  IState
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      error: '',
      previewImage: null,
      filesBeingUploaded: []
    }
  }

  handleFileChange = async (uploadedImage: File) => {
    if (!uploadedImage) {
      return
    }
    const allowedDocType = this.props.allowedDocType

    this.setState(() => ({
      filesBeingUploaded: [
        ...this.state.filesBeingUploaded,
        {
          label: uploadedImage.name
        }
      ]
    }))

    this.props.onUploadingStateChanged &&
      this.props.onUploadingStateChanged(true)

    if (
      allowedDocType &&
      allowedDocType.length > 0 &&
      !allowedDocType.includes(uploadedImage.type)
    ) {
      this.props.onUploadingStateChanged &&
        this.props.onUploadingStateChanged(false)
      this.setState({
        filesBeingUploaded: []
      })
      this.setState({
        error: this.props.intl.formatMessage(messages.fileUploadError, {
          type: allowedDocType
            .map((docTypeStr) => docTypeStr.split('/').pop())
            .join(', ')
        })
      })
    } else {
      this.props.onUploadingStateChanged &&
        this.props.onUploadingStateChanged(false)
      this.props.onComplete({
        name: uploadedImage.name,
        type: uploadedImage.type,
        data: await getBase64String(uploadedImage)
      })
      this.setState({
        error: ''
      })
      this.setState({
        filesBeingUploaded: []
      })
    }
  }

  selectForPreview = (previewImage: IFormFieldValue) => {
    if (this.props.previewTransformer) {
      return this.setState({
        previewImage: this.props.previewTransformer(
          previewImage as IAttachmentValue
        )
      })
    }
    this.setState({ previewImage: previewImage as IAttachmentValue })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  onDelete = (image: IFormFieldValue) => {
    this.props.onComplete('')
    this.closePreviewSection()
  }

  render() {
    const {
      label,
      intl,
      files,
      description,
      error,
      disableDeleteInPreview,
      requiredErrorMessage,
      touched
    } = this.props
    const errorMessage =
      (requiredErrorMessage && intl.formatMessage(requiredErrorMessage)) ||
      this.state.error ||
      error ||
      ''

    return (
      <>
        {description && <FieldDescription>{description}</FieldDescription>}
        <ErrorMessage>
          {errorMessage && (touched || this.state.error) && (
            <ErrorText ignoreMediaQuery id="field-error">
              {errorMessage}
            </ErrorText>
          )}
        </ErrorMessage>
        <DocumentListPreview
          attachment={files}
          onSelect={this.selectForPreview}
          label={label}
          onDelete={this.onDelete}
          processingDocuments={this.state.filesBeingUploaded}
        />
        {this.state.previewImage && (
          <DocumentPreview
            previewImage={this.state.previewImage}
            disableDelete={disableDeleteInPreview}
            title={intl.formatMessage(buttonMessages.preview)}
            goBack={this.closePreviewSection}
            onDelete={this.onDelete}
          />
        )}
        {(!files || !files.data) && (
          <DocumentUploader
            id="upload_document"
            title={intl.formatMessage(messages.uploadFile)}
            handleFileChange={this.handleFileChange}
          />
        )}
      </>
    )
  }
}

export const SimpleDocumentUploader = injectIntl<'intl', IFullProps>(
  SimpleDocumentUploaderComponent
)
