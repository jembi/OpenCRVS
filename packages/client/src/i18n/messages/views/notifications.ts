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
  declarationsSynced: {
    defaultMessage:
      'As you have connectivity, we can synchronize your declarations.',
    description:
      'The message that appears in notification when background sync takes place',
    id: 'misc.notif.declarationsSynced'
  },
  draftsSaved: {
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked',
    id: 'misc.notif.draftsSaved'
  },
  outboxText: {
    defaultMessage: 'Outbox({num})',
    description: 'Declaration outbox text',
    id: 'misc.notif.outboxText'
  },
  updatePINSuccess: {
    defaultMessage: 'Your pin has been successfully updated',
    description: 'Label for update PIN success notification toast',
    id: 'misc.notif.updatePINSuccess'
  },
  processingText: {
    defaultMessage: '{num} declaration processing...',
    description: 'Declaration processing text',
    id: 'misc.notif.processingText'
  },
  statusArchiving: {
    defaultMessage: 'Archiving...',
    description: 'Label for application status Archiving',
    id: 'regHome.outbox.statusArchiving'
  },
  statusCertifying: {
    defaultMessage: 'Certifying...',
    description: 'Label for declaration status Certifying',
    id: 'regHome.outbox.statusCertifying'
  },
  statusIssuing: {
    defaultMessage: 'Issuing...',
    description: 'Label for declaration status Issuing',
    id: 'regHome.outbox.statusIssuing'
  },
  statusRegistering: {
    defaultMessage: 'Registering...',
    description: 'Label for declaration status Registering',
    id: 'regHome.outbox.statusRegistering'
  },
  statusRejecting: {
    defaultMessage: 'Sending for updates...',
    description: 'Label for declaration status Rejecting',
    id: 'regHome.outbox.statusRejecting'
  },
  statusReinstating: {
    defaultMessage: 'Reinstating...',
    description: 'Label for application status Reinstating',
    id: 'regHome.outbox.statusReinstating'
  },
  statusRequestingCorrection: {
    defaultMessage: 'Correcting...',
    description: 'Label for declaration status Requesting correction',
    id: 'regHome.outbox.statusRequestingCorrection'
  },
  statusSubmitting: {
    defaultMessage: 'Sending...',
    description: 'Label for declaration status submitting',
    id: 'regHome.outbox.statusSubmitting'
  },
  statusSendingForApproval: {
    defaultMessage: 'Sending for approval...',
    description: 'Label for declaration status waiting for validate',
    id: 'regHome.outbox.statusSendingForApproval'
  },
  statusWaitingToBeArchived: {
    defaultMessage: 'Waiting to be archived',
    description: 'Label for application status waiting to be archived',
    id: 'regHome.outbox.statusWaitingToBeArchived'
  },
  statusWaitingToBeReinstated: {
    defaultMessage: 'Waiting to be reinstated',
    description: 'Label for application status waiting to be reinstated',
    id: 'regHome.outbox.statusWaitingToBeReinstated'
  },
  statusWaitingToCertify: {
    defaultMessage: 'Waiting to certify',
    description: 'Label for declaration status waiting for certify',
    id: 'regHome.outbox.statusWaitingToCertify'
  },
  statusWaitingToIssue: {
    defaultMessage: 'Waiting to issue',
    description: 'Label for declaration status waiting for certify',
    id: 'regHome.outbox.statusWaitingToIssue'
  },
  statusWaitingToValidate: {
    defaultMessage: 'Waiting to send for approval',
    description: 'Label for declaration status waiting for validate',
    id: 'regHome.outbox.statusWaitingToValidate'
  },
  statusWaitingToRegister: {
    defaultMessage: 'Waiting to register',
    description: 'Label for declaration status waiting for register',
    id: 'regHome.outbox.statusWaitingToRegister'
  },
  statusWaitingToReject: {
    defaultMessage: 'Waiting to send for updates',
    description: 'Label for declaration status waiting for reject',
    id: 'regHome.outbox.statusWaitingToReject'
  },
  statusWaitingToRequestCorrection: {
    defaultMessage: 'Waiting to correct',
    description: 'Label for declaration status waiting for request correction',
    id: 'regHome.outbox.statusWaitingToRequestCorrection'
  },
  statusWaitingToSubmit: {
    defaultMessage: 'Waiting to send',
    description: 'Label for declaration status waiting for reject',
    id: 'regHome.outbox.statusWaitingToSubmit'
  },
  retry: {
    id: 'regHome.outbox.retry',
    defaultMessage: 'Retry',
    description:
      'Copy for "Retry" button in Outbox shown for records that failed to send'
  },
  userAuditSuccess: {
    defaultMessage:
      '{name} was {action, select, DEACTIVATE {deactivated} REACTIVATE {reactivated} other {deactivated}}',
    description: 'Label for user audit success notification',
    id: 'misc.notif.userAuditSuccess'
  },
  userFormFail: {
    defaultMessage: 'Sorry! Something went wrong',
    description:
      'The message that appears in notification when a new user creation fails',
    id: 'misc.notif.sorryError'
  },
  userFormFailForOffline: {
    defaultMessage: 'Offline. Try again when reconnected',
    description:
      'The message that appears in notification when a new user creation fails in offline mode',
    id: 'misc.notif.offlineError'
  },
  userFormSuccess: {
    defaultMessage: 'New user created',
    description:
      'The message that appears in notification when a new user is created',
    id: 'misc.notif.userFormSuccess'
  },
  userFormUpdateSuccess: {
    defaultMessage: 'User details have been updated',
    description:
      'The message that appears in notification when user details have been updated',
    id: 'misc.notif.userFormUpdateSuccess'
  },
  waitingToRetry: {
    defaultMessage: 'Waiting to retry',
    description: 'Label for declaration status waiting for connection',
    id: 'regHome.outbox.waitingToRetry'
  },
  failed: {
    defaultMessage: 'Failed to send',
    description: 'Label for declaration status failed',
    id: 'regHome.outbox.failed'
  },
  downloadDeclarationFailed: {
    defaultMessage: 'Failed to download declaration. Please try again',
    description: 'Label for declaration downloading failed',
    id: 'regHome.workqueue.downloadDeclarationFailed'
  },
  unassigned: {
    defaultMessage: 'You were unassigned from {trackingId}',
    id: 'misc.notif.unassign',
    description: 'Label for unassigned toast notification'
  },
  onlineUserStatus: {
    defaultMessage: 'You are back online',
    id: 'misc.notif.onlineUserStatus',
    description: 'Label for online user status toast notification'
  },
  duplicateRecord: {
    defaultMessage:
      '{trackingId} is a potential duplicate. Record is ready for review.',
    id: 'misc.notif.duplicateRecord',
    description:
      'Label for when a duplicate record is detected when registering a record.'
  },
  emailAllUsersSuccess: {
    id: 'misc.notif.emailAllUsersSuccess',
    defaultMessage: 'Email sent to all users',
    description: 'Label for Email all users success toast'
  },
  emailAllUsersError: {
    id: 'misc.notif.emailAllUsersError',
    defaultMessage: 'Only one email can be sent per day',
    description: 'Label for Email all users error toast'
  }
}

export const messages = defineMessages(messagesToDefine)
