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
import { v4 as uuid } from 'uuid'
import {
  ConditionalType,
  EventDocument,
  defineConditional,
  EventConfig,
  EventIndex,
  FormConfig,
  not
} from '@opencrvs/commons/client'

/* eslint-disable max-lines */
export const DEFAULT_FORM = {
  label: {
    id: 'v2.event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.declare.form.review.title',
      defaultMessage: 'Member declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: [
      {
        id: 'review.comment',
        type: 'TEXTAREA',
        label: {
          defaultMessage: 'Comment',
          id: 'v2.event.birth.action.declare.form.review.comment.label',
          description: 'Label for the comment field in the review section'
        }
      },
      {
        type: 'SIGNATURE',
        id: 'review.signature',
        required: false,
        label: {
          defaultMessage: 'Signature of informant',
          id: 'v2.event.birth.action.declare.form.review.signature.label',
          description: 'Label for the signature field in the review section'
        },
        signaturePromptLabel: {
          id: 'v2.signature.upload.modal.title',
          defaultMessage: 'Draw signature',
          description: 'Title for the modal to draw signature'
        }
      }
    ]
  },
  pages: [
    {
      id: 'applicant',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'applicant.firstname',
          type: 'TEXT',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's first name",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'applicant.surname',
          type: 'TEXT',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's surname",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
          }
        },
        {
          id: 'applicant.email',
          type: 'EMAIL',
          required: false,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's email",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.email.label'
          }
        },
        {
          id: 'applicant.dob',
          type: 'DATE',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        },
        {
          id: 'applicant.address',
          type: 'ADDRESS',
          required: true,
          conditionals: [],
          label: {
            defaultMessage: "Applicant's address",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.address.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.title',
        defaultMessage: 'Who is recommending the applicant?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'recommender.none',
          conditionals: [],
          required: false,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.none.label',
            defaultMessage: 'No recommender',
            description: 'This is the label for the field'
          },
          type: 'CHECKBOX'
        },
        {
          id: 'recommender.firstname',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: true
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label',
            defaultMessage: "Recommender's first name",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.surname',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: true
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label',
            defaultMessage: "Recommender's surname",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        },
        {
          id: 'recommender.id',
          conditionals: [
            {
              type: 'SHOW',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: true
                      }
                    },
                    required: ['recommender.none']
                  }
                },
                required: ['$form']
              })
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.id.label',
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field'
          },
          type: 'TEXT'
        }
      ]
    }
  ]
} satisfies FormConfig

/** @knipignore */
const PRINT_CERTIFICATE_FORM = {
  label: {
    id: 'v2.event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  active: true,
  pages: [
    {
      id: 'collector',
      title: {
        id: 'v2.event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.requesterId',
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.label',
            defaultMessage: 'Requester',
            description: 'This is the label for the field'
          },
          type: 'SELECT',
          options: [
            {
              value: 'INFORMANT',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              }
            },
            {
              value: 'OTHER',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              }
            },
            {
              value: 'PRINT_IN_ADVANCE',
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              }
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.idType.label',
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID'
          },
          type: 'SELECT',
          options: [
            {
              value: 'PASSPORT',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              }
            },
            {
              value: 'DRIVING_LICENSE',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              }
            },
            {
              value: 'REFUGEE_NUMBER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              }
            },
            {
              value: 'ALIEN_NUMBER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              }
            },
            {
              value: 'OTHER',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              }
            },
            {
              value: 'NO_ID',
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              }
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['PASSPORT']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.passportDetails.label',
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.DRIVING_LICENSE.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['DRIVING_LICENSE']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.drivingLicenseDetails.label',
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.REFUGEE_NUMBER.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['REFUGEE_NUMBER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.refugeeNumberDetails.label',
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.ALIEN_NUMBER.details',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['ALIEN_NUMBER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.alienNumberDetails.label',
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.OTHER.idTypeOther',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.OTHER.idType']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.OTHER.idType': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.OTHER.idType']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.idTypeOther.label',
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.OTHER.firstName',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.firstName.label',
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.OTHER.lastName',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.lastName.label',
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: true,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.relationshipToMember.label',
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field'
          },
          type: 'TEXT'
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                defineConditional({
                  anyOf: [
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          not: {
                            type: 'object',
                            required: ['collector.requesterId']
                          }
                        }
                      },
                      required: ['$form']
                    },
                    {
                      type: 'object',
                      properties: {
                        $form: {
                          type: 'object',
                          properties: {
                            'collector.requesterId': {
                              not: {
                                enum: ['OTHER']
                              }
                            }
                          },
                          required: ['collector.requesterId']
                        }
                      },
                      required: ['$form']
                    }
                  ]
                })
              )
            }
          ],
          required: false,
          label: {
            id: 'v2.event.tennis-club-membership.action.form.section.signedAffidavit.label',
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit'
          },
          type: 'FILE'
        }
      ]
    }
  ],
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.review.title',
      defaultMessage: 'Member certificate collector for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: []
  }
} satisfies FormConfig

/** @knipignore */
export const tennisClubMembershipEvent = {
  id: 'TENNIS_CLUB_MEMBERSHIP',
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.tennis-club-membership.label'
  },
  summary: {
    title: {
      id: 'event.tennis-club-membership.summary.title',
      label: {
        defaultMessage: '{applicant.firstname} {applicant.surname}',
        description: 'This is the title of the summary',
        id: 'v2.event.tennis-club-membership.summary.title.label'
      }
    },
    fields: [
      {
        id: 'applicant.firstname',
        value: {
          defaultMessage: '{applicant.firstname}',
          description: 'Value for the matching field on form.',
          id: 'v2.event.tennis-club-membership.summary.field.firstname.value'
        },
        label: {
          defaultMessage: 'First name',
          description: 'Label for the given field on form.',
          id: 'v2.event.tennis-club-membership.summary.field.firstname.label'
        }
      }
    ]
  },
  workqueues: [
    {
      id: 'all',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.all.name.label'
          }
        }
      ],
      filters: []
    },
    {
      id: 'ready-for-review',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.readyForReview.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['DECLARED']
        }
      ]
    },
    {
      id: 'registered',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.registered.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['REGISTERED']
        }
      ]
    }
  ],
  actions: [
    {
      type: 'DECLARE',
      conditionals: [],
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.declare.label'
      },
      forms: [DEFAULT_FORM]
    },
    {
      type: 'REGISTER',
      conditionals: [],
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.declare.label'
      },
      forms: [DEFAULT_FORM]
    },
    {
      type: 'REQUEST_CORRECTION',
      conditionals: [],
      label: {
        defaultMessage:
          'Request a correction for {applicant.firstname} {applicant.surname}',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.requestCorrection.label'
      },
      onboardingForm: [
        {
          id: 'correction-requester',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.corrector',
            defaultMessage: 'Correction requester',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.requester.relationshop.intro',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.requester.relationshop.intro.label',
                defaultMessage:
                  'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.requester.relationship',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              defaultValue: '',
              options: [
                {
                  value: 'INFORMANT',
                  label: {
                    id: 'v2.correction.corrector.informant',
                    defaultMessage: 'Informant',
                    description:
                      'Label for informant option in certificate correction form'
                  }
                },
                {
                  value: 'ANOTHER_AGENT',
                  label: {
                    id: 'v2.correction.corrector.anotherAgent',
                    defaultMessage: 'Another registration agent or field agent',
                    description:
                      'Label for another registration or field agent option in certificate correction form'
                  }
                },
                {
                  value: 'REGISTRAR',
                  label: {
                    id: 'v2.correction.corrector.me',
                    defaultMessage: 'Me (Registrar)',
                    description:
                      'Label for registrar option in certificate correction form'
                  }
                },
                {
                  value: 'OTHER',
                  label: {
                    id: 'v2.correction.corrector.others',
                    defaultMessage: 'Someone else',
                    description:
                      'Label for someone else option in certificate correction form'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'identity-check',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.verify',
            defaultMessage: 'Verify their identity',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.identity-check.instructions',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.corrector.identity.instruction',
                defaultMessage:
                  'Please verify the identity of the person making this request',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.identity-check.verified',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.identity.verified.label',
                defaultMessage: '@todo',
                description: 'The title for the corrector form'
              },
              defaultValue: '',
              required: true,
              options: [
                {
                  value: 'VERIFIED',
                  label: {
                    id: 'v2.correction.corrector.identity.verified',
                    defaultMessage: 'I have verified their identity',
                    description:
                      'Label for verified option in corrector identity check page'
                  }
                }
              ]
            }
          ]
        }
      ],
      additionalDetailsForm: [
        {
          id: 'correction-request.supporting-documents',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.verify',
            defaultMessage: 'Upload supporting documents',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.supportingDocs.introduction',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.corrector.paragraph.title',
                defaultMessage:
                  'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.supportingDocs',
              type: 'FILE',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Upload supporting documents',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.request.supportingDocuments',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              defaultValue: '',
              configuration: {
                styles: {
                  size: 'NORMAL'
                }
              },
              options: [
                {
                  value: 'ATTEST',
                  label: {
                    id: 'v2.correction.supportingDocuments.attest.label',
                    defaultMessage:
                      'I attest to seeing supporting documentation and have a copy filed at my office',
                    description: ''
                  }
                },
                {
                  value: 'NOT_NEEDED',
                  label: {
                    id: 'v2.correction.supportingDocuments.notNeeded.label',
                    defaultMessage: 'No supporting documents required',
                    description: ''
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'correction-request.additional-details',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.corrector',
            defaultMessage: 'Reason for correction',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.request.reason',
              type: 'TEXT',
              label: {
                id: 'v2.correction.reason.title',
                defaultMessage: 'Reason for correction?',
                description: 'The title for the corrector form'
              }
            }
          ]
        }
      ],
      forms: [DEFAULT_FORM]
    },
    {
      type: 'PRINT_CERTIFICATE',
      label: {
        id: 'v2.event.tennis-club-membership.action.collect-certificate.label',
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
      forms: [PRINT_CERTIFICATE_FORM],
      conditionals: [
        {
          type: 'SHOW',
          conditional: defineConditional({
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
                          const: 'REGISTER'
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
          })
        }
      ]
    }
  ],
  deduplication: [
    {
      id: 'STANDARD CHECK',
      label: {
        defaultMessage: 'Standard check',
        description:
          'This could be shown to the user in a reason for duplicate detected',
        id: '...'
      },
      query: {
        type: 'and',
        clauses: [
          {
            fieldId: 'applicant.firstname',
            type: 'strict',
            options: {
              boost: 1
            }
          }
        ]
      }
    }
  ],
  advancedSearch: [
    {
      id: 'RANDOM',
      title: {
        defaultMessage: 'Tennis club registration search',
        description: 'This is what this event is referred as in the system',
        id: 'v2.event.tennis-club-membership.search'
      },
      fields: [
        {
          fieldId: 'applicant.dob'
        }
      ]
    }
  ]
} satisfies EventConfig

export const tennisClubMembershipEventIndex: EventIndex = {
  id: uuid(),
  type: 'TENNIS_CLUB_MEMBERSHIP',
  status: 'CREATED',
  createdAt: '2023-03-01T00:00:00.000Z',
  createdBy: uuid(),
  createdAtLocation: uuid(),
  modifiedAt: '2023-03-01T00:00:00.000Z',
  assignedTo: null,
  updatedBy: 'system',
  data: {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '1990-01-01'
  }
}

export const tennisClueMembershipEventDocument: EventDocument = {
  type: 'TENNIS_CLUB_MEMBERSHIP',
  id: 'c5d9d901-00bf-4631-89dc-89ca5060cb52',
  createdAt: '2025-01-23T05:30:02.615Z',
  updatedAt: '2025-01-23T05:35:27.689Z',
  actions: [
    {
      id: 'ae9618d8-319d-48a7-adfe-7ad6cfbc56b7',
      type: 'CREATE',
      createdAt: '2025-01-23T05:30:02.615Z',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf',
      draft: false,
      data: {}
    },
    {
      id: '8db635cf-ee30-40ca-8117-a7188256a2b1',
      draft: false,
      data: {
        'applicant.firstname': 'Riku',
        'applicant.surname': 'Rouvila',
        'applicant.dob': '2025-01-23',
        'recommender.firstname': 'Euan',
        'recommender.surname': 'Millar'
      },
      // Metadata is required to display a register action workflow in Storybook.
      // It mimics the behavior of the declare action, with metadata added to this declaration.
      metadata: {
        'review.comment': 'asdasdasdasdasdasd',
        'review.signature':
          'data:image/png;base64,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'
      },
      type: 'DECLARE',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAt: '2025-01-23T05:30:08.847Z',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf'
    },
    {
      id: '9e048856-8c4d-4f85-8b7f-5f13885d2374',
      draft: false,
      data: {
        'applicant.firstname': 'Riku',
        'applicant.surname': 'Rouvila',
        'applicant.dob': '2025-01-23',
        'recommender.firstname': 'Euan',
        'recommender.surname': 'Millar'
      },
      type: 'REGISTER',
      identifiers: {
        trackingId: '95af4c4a-7fe2-4bb5-9a46-1a935b9497b8',
        registrationNumber: '7b3a477a-4f3e-459a-9469-8956cf9dd8e5'
      },
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAt: '2025-01-23T05:35:27.689Z',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf'
    }
  ]
}
