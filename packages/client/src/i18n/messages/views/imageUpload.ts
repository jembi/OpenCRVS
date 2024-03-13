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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IImageUploadMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  uploadError: MessageDescriptor
  documentTypeRequired: MessageDescriptor
  overSized: MessageDescriptor
  imageFormat: MessageDescriptor
}

const messagesToDefine: IImageUploadMessages = {
  uploadError: {
    id: 'imageUploadOption.upload.error',
    defaultMessage:
      'File format not supported. Please attach a png, jpg or pdf (max 5mb)',
    description: 'Show error messages while uploading'
  },
  imageFormat: {
    id: 'imageUploadOption.upload.imageFormat',
    defaultMessage:
      'Image format not supported. Please attach a png or jpg (max 5mb)',
    description:
      'Show error message if the selected image type is not supported'
  },
  documentTypeRequired: {
    id: 'imageUploadOption.upload.documentType',
    defaultMessage: 'Please select the type of document first',
    description: 'Show error message if the document type is not selected'
  },
  overSized: {
    id: 'imageUploadOption.upload.overSized',
    defaultMessage: 'File is too large. Please attach file less than 5mb',
    description: 'Error message for Attachment size greater than 5mb.'
  }
}

export const messages: IImageUploadMessages = defineMessages(messagesToDefine)
