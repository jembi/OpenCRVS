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
  IFormSection,
  PARAGRAPH,
  PaymentSection,
  SELECT_WITH_OPTIONS,
  ViewType
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/certificate'

export const paymentFormSection: IFormSection = {
  id: PaymentSection.Payment,
  viewType: 'form' as ViewType,
  name: messages.payment,
  title: messages.payment,
  groups: [
    {
      id: 'payment-view-group',
      fields: [
        {
          name: 'paymentMethod',
          type: SELECT_WITH_OPTIONS,
          label: messages.paymentMethod,
          initialValue: 'MANUAL',
          required: true,
          validate: [],
          options: [{ value: 'MANUAL', label: messages.manualPaymentMethod }]
        },
        {
          name: 'collectPayment',
          type: PARAGRAPH,
          label: messages.collectPayment,
          initialValue: '',
          validate: []
        },
        {
          name: 'service',
          type: PARAGRAPH,
          label: messages.service,
          initialValue: '',
          validate: []
        },
        {
          name: 'paymentAmount',
          type: PARAGRAPH,
          label: messages.paymentAmount,
          initialValue: '',
          fontVariant: 'h1',
          required: false,
          validate: []
        }
      ]
    }
  ]
}
