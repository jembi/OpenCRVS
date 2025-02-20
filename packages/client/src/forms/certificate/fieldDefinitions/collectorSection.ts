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
  CertificateSection,
  CHECKBOX_GROUP,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  identityTypeMapper,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IRadioGroupFormField,
  IRadioOption,
  PARAGRAPH,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  SIMPLE_DOCUMENT_UPLOADER,
  TEXT
} from '@client/forms'
import { builtInConditionals as conditionals } from '@client/forms/conditionals'
import { fieldValidationDescriptorToValidationFunction } from '@client/forms/deserializer/deserializer'
import { validators } from '@client/forms/validators'
import { formMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { validIDNumber } from '@client/utils/validate'
import { RadioSize } from '@opencrvs/components/lib/Radio'
import { BIRTH_REGISTRATION_NUMBER, NATIONAL_ID } from '@client/utils/constants'
import { identityHelperTextMapper, identityNameMapper } from './messages'
import { EventType } from '@client/utils/gateway'
import { IDeclaration } from '@client/declarations'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { ICertificateData } from '@client/utils/referenceApi'
import { IOfflineData } from '@client/offline/reducer'

interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}
export interface IVerifyIDCertificateCollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField?: string
  ageOfPerson?: string
  nationalityField: string
}

interface IVerifyIDCertificateCollector {
  [collector: string]: IVerifyIDCertificateCollectorField
}

interface IVerifyIDCertificateCollectorDefinition {
  [event: string]: IVerifyIDCertificateCollector
}

const PASSPORT = 'PASSPORT'
const DRIVING_LICENSE = 'DRIVING_LICENSE'
const REFUGEE_NUMBER = 'REFUGEE_NUMBER'
const ALIEN_NUMBER = 'ALIEN_NUMBER'
const OTHER = 'OTHER'
const NO_ID = 'NO_ID'

const identityOptions = [
  { value: PASSPORT, label: formMessages.iDTypePassport },
  { value: NATIONAL_ID, label: formMessages.iDTypeNationalID },
  {
    value: DRIVING_LICENSE,
    label: formMessages.iDTypeDrivingLicense
  },
  {
    value: BIRTH_REGISTRATION_NUMBER,
    label: formMessages.iDTypeBRN
  },
  {
    value: REFUGEE_NUMBER,
    label: formMessages.iDTypeRefugeeNumber
  },
  { value: ALIEN_NUMBER, label: formMessages.iDTypeAlienNumber },
  { value: NO_ID, label: formMessages.iDTypeNoID },
  { value: OTHER, label: formMessages.iDTypeOther }
]

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
        ageOfPerson: 'ageOfIndividualInYears',
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
        ageOfPerson: 'ageOfIndividualInYears',
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
        birthDateField: 'informantBirthDate',
        ageOfPerson: 'ageOfIndividualInYears',
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
        birthDateField: 'informantBirthDate',
        ageOfPerson: 'ageOfIndividualInYears',
        nationalityField: 'nationality'
      }
    },
    marriage: {
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
        birthDateField: 'informantBirthDate',
        ageOfPerson: 'ageOfIndividualInYears',
        nationalityField: 'nationality'
      },
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
        ageOfPerson: 'ageOfIndividualInYears',
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
        ageOfPerson: 'ageOfIndividualInYears',
        nationalityField: 'nationality'
      }
    }
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.informantsRelationWithChild,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.informantsRelationWithDeceased,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ],
          options: [
            { value: 'BRIDE', label: formMessages.certifyRecordToBride },
            { value: 'GROOM', label: formMessages.certifyRecordToGroom },
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'lastName',
          type: TEXT,
          label: formMessages.lastName,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
          ]
        },
        {
          name: 'relationship',
          type: TEXT,
          label: formMessages.relationshipToSpouses,
          required: true,
          initialValue: '',
          validator: [
            fieldValidationDescriptorToValidationFunction(
              {
                operation: 'requiredBasic'
              },
              validators
            )
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

const otherCertCollectorFormGroup = (event: EventType): IFormSectionGroup => {
  const labelMap = {
    [EventType.Birth]: formMessages.informantsRelationWithChild,
    [EventType.Death]: formMessages.informantsRelationWithDeceased,
    [EventType.Marriage]: formMessages.relationshipToSpouses
  }

  const fields: IFormField[] = [
    {
      name: 'iDType',
      type: SELECT_WITH_OPTIONS,
      label: formMessages.typeOfId,
      required: true,
      initialValue: '',
      validator: [
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
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
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
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
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
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
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
      ]
    },
    {
      name: 'lastName',
      type: TEXT,
      label: formMessages.lastName,
      required: true,
      initialValue: '',
      validator: [
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
      ]
    },
    {
      name: 'relationship',
      type: TEXT,
      label: labelMap[event],
      required: true,
      initialValue: '',
      validator: [
        fieldValidationDescriptorToValidationFunction(
          {
            operation: 'requiredBasic'
          },
          validators
        )
      ]
    }
  ]

  return {
    id: 'otherCertCollector',
    conditionals: [conditionals.certCollectorOther],
    title: certificateMessages.otherCollectorFormTitle,
    error: certificateMessages.certificateOtherCollectorInfoError,
    fields
  }
}

const affidavitCertCollectorGroup: IFormSectionGroup = {
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
          expression:
            'values.noAffidavitAgreement && values.noAffidavitAgreement.length !== 0'
        }
      ]
    },
    {
      name: 'noAffidavitAgreement',
      type: CHECKBOX_GROUP,
      label: certificateMessages.noLabel,
      required: false,
      initialValue: [],
      validator: [
        (
          value: IFormFieldValue,
          drafts?: IFormData,
          offlineCountryConfig?: IOfflineData,
          form?: IFormSectionData
        ) =>
          form &&
          !(
            (form['noAffidavitAgreement'] as Array<string>)?.length ||
            form['affidavitFile']
          )
            ? {
                message:
                  certificateMessages.certificateOtherCollectorAffidavitError
              }
            : undefined
      ],
      options: [
        {
          value: 'AFFIDAVIT',
          label: certificateMessages.noSignedAffidavitAvailable
        }
      ],
      conditionals: [
        {
          action: 'hide',
          expression: 'values.affidavitFile && values.affidavitFile !== ""'
        }
      ]
    }
  ]
}

const birthCertCollectorOptions = [
  { value: 'MOTHER', label: formMessages.certifyRecordToMother },
  { value: 'FATHER', label: formMessages.certifyRecordToFather }
]

const marriageCertCollectorOptions = [
  { value: 'BRIDE', label: formMessages.certifyRecordToBride },
  { value: 'GROOM', label: formMessages.certifyRecordToGroom }
]

const birthIssueCollectorFormOptions = [
  { value: 'MOTHER', label: issueMessages.issueToMother },
  { value: 'FATHER', label: issueMessages.issueToFather }
]

const marriageIssueCollectorFormOptions = [
  { value: 'GROOM', label: issueMessages.issueToGroom },
  { value: 'BRIDE', label: issueMessages.issueToBride }
]

function getCertCollectorGroupForEvent(
  declaration: IDeclaration,
  certificates: ICertificateData[]
): IFormSectionGroup {
  const informant = (declaration.data.informant.otherInformantType ||
    declaration.data.informant.informantType) as string

  const defaultPrintCertOptions: IRadioOption[] = [
    {
      value: 'INFORMANT',
      label: formMessages.certifyRecordToInformant,
      param: {
        informant: informant
      }
    },
    { value: 'OTHER', label: formMessages.someoneElseCollector },
    {
      value: 'PRINT_IN_ADVANCE',
      label: formMessages.certificatePrintInAdvance
    }
  ]

  const finalOptions = getFilteredRadioOptions(
    declaration,
    informant,
    defaultPrintCertOptions,
    birthCertCollectorOptions,
    marriageCertCollectorOptions
  )
  const certificateTemplateOptions =
    certificates
      .filter((x) => x.event === declaration.event)
      .map((x) => ({ label: x.label, value: x.id })) || []
  return {
    id: 'certCollector',
    title: certificateMessages.whoToCollect,
    fields: [
      {
        name: 'certificateTemplateId',
        type: 'SELECT_WITH_OPTIONS',
        label: certificateMessages.certificateTemplateSelectLabel,
        required: true,
        validator: [
          (value: IFormFieldValue) => {
            return !value
              ? {
                  message: certificateMessages.certificateCollectorTemplateError
                }
              : undefined
          }
        ],
        options: certificateTemplateOptions
      },
      {
        name: 'type',
        type: RADIO_GROUP,
        size: RadioSize.LARGE,
        label: certificateMessages.whoToCollect,
        hideHeader: true,
        required: true,
        initialValue: '',
        validator: [
          (value: IFormFieldValue) => {
            return !value
              ? {
                  message: certificateMessages.certificateCollectorError
                }
              : undefined
          }
        ],
        options: finalOptions
      }
    ]
  }
}

export function getCertificateCollectorFormSection(
  declaration: IDeclaration,
  certificates: ICertificateData[]
): IFormSection {
  return {
    id: CertificateSection.Collector,
    viewType: 'form',
    name: certificateMessages.printCertificate,
    title: certificateMessages.certificateCollectionTitle,
    groups: [
      getCertCollectorGroupForEvent(declaration, certificates),
      otherCertCollectorFormGroup(declaration.event),
      affidavitCertCollectorGroup
    ]
  }
}

export function getIssueCertCollectorGroupForEvent(
  declaration: IDeclaration
): IRadioGroupFormField[] {
  const informant = (declaration.data.informant.otherInformantType ||
    declaration.data.informant.informantType) as string

  const defaultIssueFormOptions: IRadioOption[] = [
    {
      value: 'INFORMANT',
      label: issueMessages.issueToInformant,
      param: {
        informant: informant
      }
    },
    { value: 'OTHER', label: issueMessages.issueToSomeoneElse }
  ]

  const finalOptions = getFilteredRadioOptions(
    declaration,
    informant,
    defaultIssueFormOptions,
    birthIssueCollectorFormOptions,
    marriageIssueCollectorFormOptions
  )

  const fields: IRadioGroupFormField[] = [
    {
      name: 'type',
      type: RADIO_GROUP,
      size: RadioSize.LARGE,
      label: issueMessages.issueCertificate,
      hideHeader: true,
      required: true,
      initialValue: '',
      validator: [],
      options: finalOptions
    }
  ]

  return fields
}

export function getFilteredRadioOptions(
  declaration: IDeclaration,
  informant: string,
  options: IRadioOption[],
  birthForm: IRadioOption[],
  marriageForm?: IRadioOption[]
): IRadioOption[] {
  if (declaration.event === EventType.Birth) {
    options.splice(1, 0, ...birthForm)

    const rolesToCheck = ['MOTHER', 'FATHER']
    for (const role of rolesToCheck) {
      if (!Boolean(declaration.data[role.toLowerCase()]?.detailsExist)) {
        options = options.filter((opt) => opt.value !== role)
      }
    }
  } else if (declaration.event === EventType.Marriage && marriageForm) {
    options.splice(1, 0, ...marriageForm)
  }

  if (
    ['BRIDE', 'GROOM', 'MOTHER', 'FATHER', 'LEGAL_GUARDIAN'].includes(informant)
  ) {
    options = options.filter((opt) => opt.value !== informant)
  }

  return options
}
