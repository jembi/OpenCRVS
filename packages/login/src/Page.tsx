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
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { applicationConfigLoadAction } from './login/actions'
import { changeLanguage, loadLanguages } from './i18n/actions'
import {
  getDefaultLanguage,
  retrieveLanguage,
  useSearchQuery
} from './i18n/utils'

type IProps = {
  children: React.ReactNode
}

function useLoadConfigurations() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(loadLanguages())
    dispatch(applicationConfigLoadAction())
  }, [dispatch])
}

function useSyncLanguage() {
  const dispatch = useDispatch()
  const paramLanguage = useSearchQuery('lang')
  React.useEffect(() => {
    async function syncLanguage() {
      const languageToUse =
        paramLanguage ?? (await retrieveLanguage()) ?? getDefaultLanguage()

      if (languageToUse) dispatch(changeLanguage({ language: languageToUse }))
    }
    syncLanguage()
  }, [dispatch, paramLanguage])
}

export function Page({ children }: IProps) {
  useLoadConfigurations()
  useSyncLanguage()

  return <>{children}</>
}
