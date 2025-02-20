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
  FIELD_GROUP_TITLE,
  ISerializedFormSection,
  LOCATION_SEARCH_INPUT,
  SELECT_WITH_OPTIONS,
  SIMPLE_DOCUMENT_UPLOADER,
  TEXT,
  UserSection
} from '@client/forms/index'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'

function userSectionFormType(): ISerializedFormSection {
  return {
    id: UserSection.User,
    viewType: 'form',
    name: userFormMessages.user,
    title: userFormMessages.userFormTitle,
    groups: [
      {
        id: 'registration-office',
        preventContinueIfError: true,
        title: userFormMessages.assignedRegistrationOffice,
        conditionals: [
          {
            action: 'hide',
            expression:
              'values.skippedOfficeSelction && values.registrationOffice'
          }
        ],
        fields: [
          {
            name: 'assignedRegistrationOffice',
            type: FIELD_GROUP_TITLE,
            label: userFormMessages.assignedRegistrationOfficeGroupTitle,
            required: false,
            hidden: true,
            initialValue: '',
            validator: []
          },
          {
            name: 'registrationOffice',
            type: LOCATION_SEARCH_INPUT,
            label: userFormMessages.registrationOffice,
            required: true,
            initialValue: '',
            searchableResource: ['offices'],
            searchableType: ['CRVS_OFFICE'],
            validator: [
              {
                operation: 'officeMustBeSelected'
              }
            ],
            locationList: [],
            mapping: {
              mutation: {
                operation: 'fieldNameTransformer',
                parameters: ['primaryOffice']
              },
              query: {
                operation: 'locationIDToFieldTransformer',
                parameters: ['primaryOffice']
              }
            }
          }
        ]
      },
      {
        id: 'user-view-group',
        title: userFormMessages.userDetails,
        fields: [
          {
            name: 'familyName',
            type: TEXT,
            label: userFormMessages.lastName,
            required: true,
            initialValue: '',
            validator: [{ operation: 'englishOnlyNameFormat' }],
            mapping: {
              mutation: {
                operation: 'fieldToNameTransformer',
                parameters: ['en', 'familyName']
              },
              query: {
                operation: 'nameToFieldTransformer',
                parameters: ['en', 'familyName']
              }
            }
          },
          {
            name: 'firstName',
            type: TEXT,
            label: userFormMessages.firstName,
            required: true,
            initialValue: '',
            validator: [{ operation: 'englishOnlyNameFormat' }],
            mapping: {
              mutation: {
                operation: 'fieldToNameTransformer',
                parameters: ['en', 'firstNames']
              },
              query: {
                operation: 'nameToFieldTransformer',
                parameters: ['en', 'firstNames']
              }
            }
          },
          {
            name: 'username',
            type: TEXT,
            label: userFormMessages.username,
            previewGroup: 'userNameGroup',
            required: false,
            initialValue: '',
            validator: [],
            readonly: true,
            hidden: true
          },
          {
            name: 'phoneNumber',
            type: TEXT,
            label: userFormMessages.phoneNumber,
            required: window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms',
            initialValue: '',
            validator: [{ operation: 'phoneNumberFormat' }],
            mapping: {
              mutation: {
                operation: 'msisdnTransformer',
                parameters: ['user.mobile']
              },
              query: {
                operation: 'localPhoneTransformer',
                parameters: ['user.mobile']
              }
            }
          },
          {
            name: 'email',
            type: TEXT,
            label: userFormMessages.email,
            required:
              window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'email',
            initialValue: '',
            validator: [{ operation: 'emailAddressFormat' }]
          },
          {
            name: 'seperator',
            type: 'DIVIDER',
            label: {
              defaultMessage: ' ',
              description: 'empty string',
              id: 'form.field.label.empty'
            },
            initialValue: '',
            ignoreBottomMargin: true,
            validator: [],
            conditionals: []
          },
          {
            name: 'role',
            type: SELECT_WITH_OPTIONS,
            label: userFormMessages.role,
            required: true,
            initialValue: '',
            validator: [],
            options: [],
            conditionals: []
          },
          {
            name: 'device',
            type: TEXT,
            label: userFormMessages.userDevice,
            required: false,
            initialValue: '',
            validator: []
          }
        ]
      },
      {
        id: 'signature-attachment',
        title: userFormMessages.userSignatureAttachmentTitle,
        preventContinueIfError: true,
        conditionals: [
          {
            action: 'hide',
            expression:
              "!values.scopes?.includes('profile.electronic-signature')"
          }
        ],
        fields: [
          {
            name: 'attachmentTitle',
            type: FIELD_GROUP_TITLE,
            hidden: true,
            label: userFormMessages.userAttachmentSection,
            required: false,
            initialValue: '',
            validator: []
          },
          {
            name: 'signature',
            type: SIMPLE_DOCUMENT_UPLOADER,
            label: userFormMessages.userAttachmentSection,
            description: userFormMessages.userSignatureAttachmentDesc,
            allowedDocType: ['image/png'],
            initialValue: '',
            required: true,
            validator: []
          }
        ]
      }
    ]
  }
}

const getPreviewGroups = () => {
  return userSectionFormType().groups.map((group) => {
    return {
      id: `preview-${group.id}`,
      fields: group.fields
    }
  })
}

const userSectionPreviewType: ISerializedFormSection = {
  id: UserSection.Preview,
  viewType: 'preview',
  name: userFormMessages.userFormReviewTitle,
  title: userFormMessages.userFormTitle,
  groups: getPreviewGroups()
}

export function getCreateUserForm() {
  return {
    sections: [userSectionFormType(), userSectionPreviewType]
  }
}
