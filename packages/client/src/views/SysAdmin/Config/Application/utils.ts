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

import { lookup } from 'country-data'
import { ICurrency } from '@client/utils/referenceApi'

export enum NOTIFICATION_STATUS {
  SUCCESS = 'success',
  IDLE = 'idle',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}

export const getAmountWithCurrencySymbol = (
  currency: ICurrency,
  amount: number
) => {
  const amountWithSymbol = new Intl.NumberFormat(
    `${currency.languagesAndCountry}-u-nu-mathsans`,
    {
      style: 'currency',
      currency: currency.isoCode
    }
  ).format(amount)

  return amountWithSymbol.normalize('NFKD').replace(/[\u0300-\u036F]/g, '')
}

export const getCurrencySymbol = (currency: ICurrency) => {
  const currencySymbol = lookup.currencies({
    code: currency.isoCode
  })[0].symbol
  return currencySymbol
}
