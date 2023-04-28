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
import {
  CertificateSection,
  CHECKBOX_GROUP,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IFormSection,
  IFormSectionGroup,
  PARAGRAPH,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  SIMPLE_DOCUMENT_UPLOADER,
  TEXT
} from '@client/forms'
import {
  identityOptions,
  identityHelperTextMapper,
  identityNameMapper,
  identityTypeMapper
} from '@client/forms/identity'
import { fieldValidationDescriptorToValidationFunction } from '@client/forms/mappings/deserializer'
import { conditionals } from '@client/forms/utils'
import { formMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { validIDNumber } from '@client/utils/validate'
import { RadioSize } from '@opencrvs/components/lib/Radio'

export interface INameField {
  firstNamesField: string
  familyNameField: string
}
export interface INameFields {
  [language: string]: INameField
}
export interface IVerifyIDCertificateCollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField?: string
  nationalityField: string
}

export interface IVerifyIDCertificateCollector {
  [collector: string]: IVerifyIDCertificateCollectorField
}

export interface IVerifyIDCertificateCollectorDefinition {
  [event: string]: IVerifyIDCertificateCollector
}

export const verifyIDOnDeclarationCertificateCollectorDefinition: IVerifyIDCertificateCollectorDefinition =
  {
    birth: {
      mother: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'iD',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        birthDateField: 'motherBirthDate',
        nationalityField: 'nationality'
      },
      father: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'iD',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        birthDateField: 'fatherBirthDate',
        nationalityField: 'nationality'
      },
      informant: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'informantID',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        nationalityField: 'nationality'
      }
    },
    death: {
      informant: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'informantID',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        nationalityField: 'nationality'
      }
    },
    marriage: {
      groom: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'iD',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        birthDateField: 'groomBirthDate',
        nationalityField: 'nationality'
      },
      bride: {
        identifierTypeField: 'iDType',
        identifierOtherTypeField: 'iDTypeOther',
        identifierField: 'iD',
        nameFields: {
          en: {
            firstNamesField: 'firstNamesEng',
            familyNameField: 'familyNameEng'
          }
        },
        birthDateField: 'brideBirthDate',
        nationalityField: 'nationality'
      }
    }
  }

export const certCollectorGroupForBirthAppWithoutFatherDetails: IFormSectionGroup =
  {
    id: 'certCollector',
    title: certificateMessages.whoToCollect,
    error: certificateMessages.certificateCollectorError,
    fields: [
      {
        name: 'type',
        type: RADIO_GROUP,
        size: RadioSize.LARGE,
        label: certificateMessages.whoToCollect,
        hideHeader: true,
        required: true,
        initialValue: '',
        validator: [],
        options: [
          { value: 'MOTHER', label: formMessages.certifyRecordToMother },
          { value: 'OTHER', label: formMessages.someoneElseCollector },
          {
            value: 'PRINT_IN_ADVANCE',
            label: formMessages.certificatePrintInAdvance
          }
        ]
      }
    ]
  }

export const certCollectorGroupForBirthAppWithoutMotherDetails: IFormSectionGroup =
  {
    id: 'certCollector',
    title: certificateMessages.whoToCollect,
    error: certificateMessages.certificateCollectorError,
    fields: [
      {
        name: 'type',
        type: RADIO_GROUP,
        size: RadioSize.LARGE,
        label: certificateMessages.whoToCollect,
        hideHeader: true,
        required: true,
        initialValue: '',
        validator: [],
        options: [
          { value: 'FATHER', label: formMessages.certifyRecordToFather },
          { value: 'OTHER', label: formMessages.someoneElseCollector },
          {
            value: 'PRINT_IN_ADVANCE',
            label: formMessages.certificatePrintInAdvance
          }
        ]
      }
    ]
  }

export const certCollectorGroupForBirthAppWithParentDetails: IFormSectionGroup =
  {
    id: 'certCollector',
    title: certificateMessages.whoToCollect,
    error: certificateMessages.certificateCollectorError,
    fields: [
      {
        name: 'type',
        type: RADIO_GROUP,
        size: RadioSize.LARGE,
        label: certificateMessages.whoToCollect,
        hideHeader: true,
        required: true,
        initialValue: '',
        validator: [],
        options: [
          { value: 'MOTHER', label: formMessages.certifyRecordToMother },
          { value: 'FATHER', label: formMessages.certifyRecordToFather },
          { value: 'OTHER', label: formMessages.someoneElseCollector },
          {
            value: 'PRINT_IN_ADVANCE',
            label: formMessages.certificatePrintInAdvance
          }
        ]
      }
    ]
  }

export const certCollectorGroupForBirthAppWithoutParentDetails: IFormSectionGroup =
  {
    id: 'certCollector',
    title: certificateMessages.whoToCollect,
    error: certificateMessages.certificateCollectorError,
    fields: [
      {
        name: 'type',
        type: RADIO_GROUP,
        size: RadioSize.LARGE,
        label: certificateMessages.whoToCollect,
        hideHeader: true,
        required: true,
        initialValue: '',
        validator: [],
        options: [
          { value: 'OTHER', label: formMessages.someoneElseCollector },
          {
            value: 'PRINT_IN_ADVANCE',
            label: formMessages.certificatePrintInAdvance
          }
        ]
      }
    ]
  }

export const collectBirthCertificateFormSection: IFormSection = {
  id: CertificateSection.Collector,
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'otherCertCollector',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.otherCollectorFormTitle,
      error: certificateMessages.certificateOtherCollectorInfoError,
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: formMessages.typeOfId,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          placeholder: formMessages.select,
          options: identityOptions
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: formMessages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDType]
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: identityNameMapper
            },
            helperText: {
              dependency: 'iDType',
              helperTextMapper: identityHelperTextMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: identityTypeMapper
            },
            validator: [
              {
                validator: validIDNumber,
                dependencies: ['iDType']
              }
            ]
          },
          label: formMessages.iD,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDAvailable]
        },
        {
          name: 'firstName',
          type: TEXT,
          label: formMessages.firstName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.informantsRelationWithChild,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        }
      ]
    },
    {
      id: 'affidavit',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.certificateOtherCollectorAffidavitFormTitle,
      error: certificateMessages.certificateOtherCollectorAffidavitError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label:
            certificateMessages.certificateOtherCollectorAffidavitFormParagraph,
          initialValue: '',
          validator: []
        },
        {
          name: 'affidavitFile',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: certificateMessages.signedAffidavitFileLabel,
          description: certificateMessages.noLabel,
          initialValue: '',
          required: false,
          allowedDocType: ['image/png', 'image/jpeg'],
          validator: [],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.noAffidavitAgreement?.length !== 0'
            }
          ]
        },
        {
          name: 'noAffidavitAgreement',
          type: CHECKBOX_GROUP,
          label: certificateMessages.noLabel,
          initialValue: [],
          validator: [],
          required: false,
          options: [
            {
              value: 'AFFIDAVIT',
              label: certificateMessages.noSignedAffidavitAvailable
            }
          ],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.affidavitFile !== ""'
            }
          ]
        }
      ]
    }
  ]
}

export const collectDeathCertificateFormSection: IFormSection = {
  id: CertificateSection.Collector,
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'certCollector',
      title: certificateMessages.whoToCollect,
      conditionals: [conditionals.certCollectorOther],
      error: certificateMessages.certificateCollectorError,
      fields: [
        {
          name: 'type',
          type: RADIO_GROUP,
          size: RadioSize.LARGE,
          label: certificateMessages.whoToCollect,
          hideHeader: true,
          required: true,
          initialValue: true,
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          options: [
            { value: 'INFORMANT', label: formMessages.informantName },
            { value: 'OTHER', label: formMessages.someoneElseCollector },
            {
              value: 'PRINT_IN_ADVANCE',
              label: formMessages.certificatePrintInAdvance
            }
          ]
        }
      ]
    },
    {
      id: 'otherCertCollector',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.otherCollectorFormTitle,
      error: certificateMessages.certificateOtherCollectorInfoError,
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: formMessages.typeOfId,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          placeholder: formMessages.select,
          options: identityOptions
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: formMessages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDType]
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: identityTypeMapper
            },
            validator: [
              {
                validator: validIDNumber,
                dependencies: ['iDType']
              }
            ]
          },
          label: formMessages.iD,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDAvailable]
        },
        {
          name: 'firstName',
          type: TEXT,
          label: formMessages.firstName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.informantsRelationWithDeceased,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        }
      ]
    },
    {
      id: 'affidavit',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.certificateOtherCollectorAffidavitFormTitle,
      error: certificateMessages.certificateOtherCollectorAffidavitError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label:
            certificateMessages.certificateOtherCollectorAffidavitFormParagraph,
          initialValue: '',
          validator: []
        },
        {
          name: 'affidavitFile',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: certificateMessages.signedAffidavitFileLabel,
          description: certificateMessages.noLabel,
          initialValue: '',
          required: false,
          allowedDocType: ['image/png', 'image/jpeg'],
          validator: [],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.noAffidavitAgreement?.length !== 0'
            }
          ]
        },
        {
          name: 'noAffidavitAgreement',
          type: CHECKBOX_GROUP,
          label: certificateMessages.noLabel,
          required: false,
          initialValue: [],
          validator: [],
          options: [
            {
              value: 'AFFIDAVIT',
              label: certificateMessages.noSignedAffidavitAvailable
            }
          ],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.affidavitFile !== ""'
            }
          ]
        }
      ]
    }
  ]
}

export const collectMarriageCertificateFormSection: IFormSection = {
  id: CertificateSection.Collector,
  viewType: 'form',
  name: certificateMessages.printCertificate,
  title: certificateMessages.certificateCollectionTitle,
  groups: [
    {
      id: 'certCollector',
      title: certificateMessages.whoToCollect,
      conditionals: [conditionals.certCollectorOther],
      error: certificateMessages.certificateCollectorError,
      fields: [
        {
          name: 'type',
          type: RADIO_GROUP,
          size: RadioSize.LARGE,
          label: certificateMessages.whoToCollect,
          hideHeader: true,
          required: true,
          initialValue: true,
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          options: [
            { value: 'BRIDE', label: formMessages.brideName },
            { value: 'GROOM', label: formMessages.groomName },
            { value: 'OTHER', label: formMessages.someoneElseCollector },
            {
              value: 'PRINT_IN_ADVANCE',
              label: formMessages.certificatePrintInAdvance
            }
          ]
        }
      ]
    },
    {
      id: 'otherCertCollector',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.otherCollectorFormTitle,
      error: certificateMessages.certificateOtherCollectorInfoError,
      fields: [
        {
          name: 'iDType',
          type: SELECT_WITH_OPTIONS,
          label: formMessages.typeOfId,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          placeholder: formMessages.select,
          options: identityOptions
        },
        {
          name: 'iDTypeOther',
          type: TEXT,
          label: formMessages.iDTypeOtherLabel,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDType]
        },
        {
          name: 'iD',
          type: FIELD_WITH_DYNAMIC_DEFINITIONS,
          dynamicDefinitions: {
            label: {
              dependency: 'iDType',
              labelMapper: identityNameMapper
            },
            type: {
              kind: 'dynamic',
              dependency: 'iDType',
              typeMapper: identityTypeMapper
            },
            validator: [
              {
                validator: validIDNumber,
                dependencies: ['iDType']
              }
            ]
          },
          label: formMessages.iD,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ],
          conditionals: [conditionals.iDAvailable]
        },
        {
          name: 'firstName',
          type: TEXT,
          label: formMessages.firstName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.informantsRelationWithDeceased,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction({
              operation: 'requiredBasic'
            })
          ]
        }
      ]
    },
    {
      id: 'affidavit',
      conditionals: [conditionals.certCollectorOther],
      title: certificateMessages.certificateOtherCollectorAffidavitFormTitle,
      error: certificateMessages.certificateOtherCollectorAffidavitError,
      fields: [
        {
          name: 'paragraph',
          type: PARAGRAPH,
          label:
            certificateMessages.certificateOtherCollectorAffidavitFormParagraph,
          initialValue: '',
          validator: []
        },
        {
          name: 'affidavitFile',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: certificateMessages.signedAffidavitFileLabel,
          description: certificateMessages.noLabel,
          initialValue: '',
          required: false,
          allowedDocType: ['image/png', 'image/jpeg'],
          validator: [],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.noAffidavitAgreement?.length !== 0'
            }
          ]
        },
        {
          name: 'noAffidavitAgreement',
          type: CHECKBOX_GROUP,
          label: certificateMessages.noLabel,
          required: false,
          initialValue: [],
          validator: [],
          options: [
            {
              value: 'AFFIDAVIT',
              label: certificateMessages.noSignedAffidavitAvailable
            }
          ],
          conditionals: [
            {
              action: 'hide',
              expression: 'values.affidavitFile !== ""'
            }
          ]
        }
      ]
    }
  ]
}
