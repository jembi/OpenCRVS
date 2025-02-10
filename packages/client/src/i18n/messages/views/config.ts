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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  },
  vsexport: {
    id: 'config.application.vsexport',
    defaultMessage: 'Vital statistics',
    description: 'VS Export tab'
  },
  vitalStatisticsExport: {
    id: 'config.application.vitalStatistics',
    defaultMessage:
      'Month-{month}-Farajaland-{event, select, birth{birth} death{death} other{birth}}-event-statistics.csv {fileSize}',
    description: 'Vital Statistics Export'
  },
  export: {
    id: 'config.application.export',
    defaultMessage: 'Export',
    description: 'Download Export CSV'
  },
  vsEmptyStateText: {
    id: 'config.application.emptystate',
    defaultMessage:
      "The previous month's vital statistics data (based on vital event registrations occurring within that month) will become available for you to export as of the 1st of every month. Large CSV files cannot be opened in Excel and should therefore be opened in a statistical program such as {posit}.",
    description: 'Vital Statistics Export Empty State Text'
  },
  vsExportDownloadFailed: {
    id: 'config.application.vsExportDownloadFailed',
    defaultMessage: 'Sorry! Something went wrong',
    description: 'Vital Statistics Export Empty State Text'
  },
  certificateTemplate: {
    id: 'config.certTemplate',
    defaultMessage: 'Certificate Template',
    description: 'Label for certificate templates'
  },
  birthTabTitle: {
    id: 'config.application.birthTabTitle',
    defaultMessage: 'Birth',
    description: 'The title for birth tab'
  },
  birthTabTitleExport: {
    id: 'config.application.birthTabTitleExport',
    defaultMessage: 'Births',
    description: 'The title for birth tab for VSExport'
  },
  deathTabTitle: {
    id: 'config.application.deathTabTitle',
    defaultMessage: 'Death',
    description: 'The title for death tab'
  },
  deathTabTitleExport: {
    id: 'config.application.deathTabTitleExport',
    defaultMessage: 'Deaths',
    description: 'The title for death tab for VSExport'
  },
  options: {
    id: 'config.certificate.options',
    defaultMessage: 'Options',
    description: 'Show options'
  },
  language: {
    id: 'config.userRoles.language',
    defaultMessage: '{language}',
    description: 'Language name'
  },
  emailAllUsersTitle: {
    id: 'config.emailAllUsers.title',
    defaultMessage: 'Email all users',
    description: 'Title for email all users'
  },
  emailAllUsersSubtitle: {
    id: 'config.emailAllUsers.subtitle',
    defaultMessage:
      'This email will be sent to all users who are active. Emails will be sent over the next 24 hours. Only one email can be sent per day',
    description: 'Subtitle for email all users'
  },
  emailAllUsersModalTitle: {
    id: 'config.emailAllUsers.modal.title',
    defaultMessage: 'Send email to all users?',
    description: 'Label for send email all users confirmation title'
  },
  emailAllUsersModalSupportingCopy: {
    id: 'config.emailAllUsers.modal.supportingCopy',
    defaultMessage: 'User will receive emails over the next 24 hours',
    description: 'Label for send email all users confirmation supporting copy'
  }
}

export const messages = defineMessages(messagesToDefine)
