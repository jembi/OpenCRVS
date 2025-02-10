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
import { EventDocument } from '@opencrvs/commons'
import {
  defineConditional,
  EventConfig,
  EventIndex,
  FormConfig
} from '@opencrvs/commons/client'

/* eslint-disable max-lines */
const DEFAULT_FORM = {
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
    }
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
              type: 'HIDE',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
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
              type: 'HIDE',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
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
              type: 'HIDE',
              conditional: defineConditional({
                type: 'object',
                properties: {
                  $form: {
                    type: 'object',
                    properties: {
                      'recommender.none': {
                        const: 'true'
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
              type: 'HIDE',
              conditional: defineConditional({
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
    }
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
              initialValue: '',
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
              initialValue: '',
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
              initialValue: '',
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
      label: {
        id: 'v2.event.tennis-club-membership.action.collect-certificate.label',
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from'
      },
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
      ],
      type: 'PRINT_CERTIFICATE',
      forms: [PRINT_CERTIFICATE_FORM]
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
        id: 'event.tennis-club-membership.search'
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
