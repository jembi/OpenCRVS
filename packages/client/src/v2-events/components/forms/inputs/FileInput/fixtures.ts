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
import { EventConfig, EventDocument } from '@opencrvs/commons/client'

export const birthDocument: EventDocument = {
  type: 'birth',
  id: 'e1e9ff08-ae5d-490a-b76a-74722269ff4a',
  createdAt: '2025-02-06T06:15:39.922Z',
  updatedAt: '2025-02-06T06:15:39.922Z',
  actions: [
    {
      type: 'CREATE',
      createdAt: '2025-02-06T06:15:39.922Z',
      createdBy: '67810ec1d9bb658e54f4f319',
      createdAtLocation: '7ec76333-d533-4743-b810-5c8ed32169a8',
      draft: false,
      id: '148ed352-9daf-401c-bf3e-4d13abbb808d',
      data: {}
    }
  ]
}

export const birthEvent = {
  id: 'birth',
  summary: {
    title: {
      id: 'event.birth.summary.title',
      label: {
        id: 'event.birth.summary.title',
        defaultMessage: '{child.firstname} {child.surname}',
        description: 'This is the title of the summary'
      }
    },
    fields: []
  },
  label: {
    id: 'event.birth.label',
    defaultMessage: 'Birth declaration',
    description: 'This is what this event is referred as in the system'
  },
  actions: [
    {
      label: {
        id: 'event.birth.action.declare.label',
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
      allowedWhen: {
        type: 'object',
        not: {
          type: 'object',
          properties: {
            $event: {
              type: 'object',
              properties: {
                actions: {
                  type: 'array',
                  contains: {
                    type: 'object',
                    properties: {
                      type: {
                        const: 'DECLARE'
                      },
                      draft: {
                        type: 'boolean'
                      }
                    },
                    required: ['type'],
                    not: {
                      properties: {
                        draft: {
                          const: true
                        }
                      }
                    }
                  }
                }
              },
              required: ['actions']
            }
          },
          required: ['$event']
        }
      },
      forms: [
        {
          label: {
            id: 'event.birth.action.declare.form.label',
            defaultMessage: 'Birth decalration form',
            description: 'This is what this form is referred as in the system'
          },
          version: {
            id: '1.0.0',
            label: {
              id: 'event.birth.action.declare.form.version.1',
              defaultMessage: 'Version 1',
              description: 'This is the first version of the form'
            }
          },
          active: true,
          pages: [
            {
              id: 'documents',
              title: {
                id: 'form.section.documents.title',
                defaultMessage: 'Upload supporting documents',
                description: 'Form section title for documents'
              },
              fields: [
                {
                  id: 'documents.proofOfBirth',
                  required: false,
                  label: {
                    id: 'event.birth.action.declare.form.section.documents.field.proofOfBirth.label',
                    defaultMessage: 'Proof of birth',
                    description: 'This is the label for the field'
                  },
                  type: 'FILE',
                  options: {
                    fullWidth: true
                  }
                },
                {
                  id: 'documents.proofOfMother',
                  required: false,
                  label: {
                    id: 'event.birth.action.declare.form.section.documents.field.proofOfMother.label',
                    defaultMessage: "Proof of mother's ID",
                    description: 'This is the label for the field'
                  },
                  type: 'FILE_WITH_OPTIONS',
                  options: [
                    {
                      value: 'NATIONAL_ID',
                      label: {
                        id: 'form.field.label.iDTypeNationalID',
                        defaultMessage: 'National ID',
                        description: 'Option for form field: Type of ID'
                      }
                    },
                    {
                      value: 'PASSPORT',
                      label: {
                        id: 'form.field.label.iDTypePassport',
                        defaultMessage: 'Passport',
                        description: 'Option for form field: Type of ID'
                      }
                    },
                    {
                      value: 'BIRTH_REGISTRATION_NUMBER',
                      label: {
                        id: 'form.field.label.iDTypeBRN',
                        defaultMessage: 'Birth Registration Number',
                        description: 'Option for form field: Type of ID'
                      }
                    },
                    {
                      value: 'NONE',
                      label: {
                        id: 'form.field.label.iDTypeNone',
                        defaultMessage: 'None',
                        description: 'Option for form field: Type of ID'
                      }
                    }
                  ]
                },
                {
                  id: 'documents.proofOfFather',
                  required: false,
                  label: {
                    id: 'event.birth.action.declare.form.section.documents.field.proofOfFather.label',
                    defaultMessage: "Proof of father's ID",
                    description: 'This is the label for the field'
                  },
                  type: 'FILE_WITH_OPTIONS',
                  options: [
                    {
                      value: 'foo',
                      label: {
                        id: 'foo.bar',
                        defaultMessage: 'Foo',
                        description: 'bar'
                      }
                    }
                  ]
                },
                {
                  id: 'documents.proofOther',
                  required: false,
                  label: {
                    id: 'event.birth.action.declare.form.section.documents.field.proofOther.label',
                    defaultMessage: 'Other',
                    description: 'This is the label for the field'
                  },
                  type: 'FILE'
                }
              ]
            }
          ],
          review: {
            title: {
              id: 'event.birth.action.declare.form.review.title',
              defaultMessage: 'Birth declaration for {firstname} {surname}',
              description: 'Title of the form to show in review page'
            }
          }
        }
      ],
      type: 'DECLARE'
    }
  ],
  workqueues: [
    {
      id: 'all',
      fields: [
        {
          column: 'title',
          label: {
            id: 'event.birth.workqueue.all.name.label',
            defaultMessage: '{child.surname} {child.firstname}',
            description: 'Label for name in all workqueue'
          }
        }
      ],
      filters: []
    }
  ],
  deduplication: []
} satisfies EventConfig
