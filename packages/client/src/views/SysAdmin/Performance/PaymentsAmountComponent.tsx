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
import { messages } from '@client/i18n/messages/views/performance'
import { ICurrency } from '@client/utils/referenceApi'
import { getAmountWithCurrencySymbol } from '@client/views/SysAdmin/Config/Application/utils'
import {
  calculateTotalPaymentAmount,
  ListContainer,
  PerformanceListHeader,
  PerformanceTitle,
  PerformanceValue,
  ReportContainer
} from '@client/views/SysAdmin/Performance/utils'
import { ListViewItemSimplified } from '@opencrvs/components/lib/ListViewSimplified'
import { GQLPaymentMetric } from '@opencrvs/gateway/src/graphql/schema'
import React from 'react'
import { useIntl } from 'react-intl'

interface PaymentsAmountProps {
  data: Array<GQLPaymentMetric>
  currency: ICurrency
}

const enum PAYMENT_TYPE {
  CERTIFICATION = 'certification',
  CORRECTION = 'correction'
}

export function PaymentsAmountComponent(props: PaymentsAmountProps) {
  const { data, currency } = props
  const intl = useIntl()
  return (
    <ListContainer>
      <ReportContainer>
        <ListViewItemSimplified
          label={
            <div>
              <PerformanceListHeader>
                {intl.formatMessage(messages.performanceTotalPaymentsHeader)}
              </PerformanceListHeader>
            </div>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceTotalLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <span>
                {getAmountWithCurrencySymbol(
                  {
                    isoCode: currency.isoCode,
                    languagesAndCountry: currency.languagesAndCountry
                  },
                  calculateTotalPaymentAmount(data)
                )}
              </span>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceCertificationFeeLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <span>
                {getAmountWithCurrencySymbol(
                  {
                    isoCode: currency.isoCode,
                    languagesAndCountry: currency.languagesAndCountry
                  },
                  calculateTotalPaymentAmount(
                    data.filter(
                      (payment) =>
                        payment.paymentType === PAYMENT_TYPE.CERTIFICATION
                    )
                  )
                )}
              </span>
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceCorrectionFeeLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              <span>
                {getAmountWithCurrencySymbol(
                  {
                    isoCode: currency.isoCode,
                    languagesAndCountry: currency.languagesAndCountry
                  },
                  calculateTotalPaymentAmount(
                    data.filter(
                      (payment) =>
                        payment.paymentType === PAYMENT_TYPE.CORRECTION
                    )
                  )
                )}
              </span>
            </PerformanceValue>
          }
        />
      </ReportContainer>
    </ListContainer>
  )
}
