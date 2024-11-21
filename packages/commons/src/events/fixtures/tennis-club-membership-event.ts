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
import { type EventConfig } from '../Event'

export const tennisClubMembershipEvent: EventConfig = {
  id: 'TENNIS_CLUB_MEMBERSHIP',
  summary: {
    title: {
      defaultMessage: 'Tennis club membership application',
      description: 'This is the title of the form',
      id: 'event.tennis-club-membership.summary.title'
    },
    fields: []
  },
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Send an application',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [
        {
          active: true,
          version: {
            id: '1',
            label: {
              defaultMessage: 'Version 1',
              description: 'This is the first version of the form',
              id: 'event.tennis-club-membership.action.declare.form.version.1'
            }
          },
          form: [
            {
              title: {
                id: 'event.tennis-club-membership.action.declare.form.section.who.title',
                defaultMessage: 'Who is applying for the membership?',
                description: 'This is the title of the section'
              },
              groups: [
                {
                  id: 'applicant.firstname',
                  type: 'TEXT',
                  required: true,
                  label: {
                    defaultMessage: "Applicant's first name",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
                  }
                },
                {
                  id: 'applicant.surname',
                  type: 'TEXT',
                  required: true,
                  label: {
                    defaultMessage: "Applicant's surname",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
                  }
                },
                {
                  id: 'applicant.dob',
                  type: 'DATE',
                  required: true,
                  label: {
                    defaultMessage: "Applicant's date of birth",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
                  }
                }
              ]
            },
            {
              title: {
                id: 'event.tennis-club-membership.action.declare.form.section.recommender.title',
                defaultMessage: 'Who is recommending the applicant?',
                description: 'This is the title of the section'
              },
              groups: [
                {
                  id: 'recommender.firstname',
                  type: 'TEXT',
                  required: true,
                  label: {
                    defaultMessage: "Recommender's first name",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
                  }
                },
                {
                  id: 'recommender.surname',
                  type: 'TEXT',
                  required: true,
                  label: {
                    defaultMessage: "Recommender's surname",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label'
                  }
                },
                {
                  id: 'recommender.id',
                  type: 'TEXT',
                  required: true,
                  label: {
                    defaultMessage: "Recommender's membership ID",
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
