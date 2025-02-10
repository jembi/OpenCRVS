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
import { IOfflineDataState, IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { createSelector } from '@reduxjs/toolkit'
import { merge } from 'lodash'

const getOfflineState = (store: IStoreState): IOfflineDataState => store.offline

function getKey<K extends keyof IOfflineDataState>(store: IStoreState, key: K) {
  return getOfflineState(store)[key]
}

export function isOfflineDataLoaded(
  state: Partial<IOfflineData>
): state is IOfflineData {
  const hasAllRequiredData =
    state.facilities &&
    state.locations &&
    state.config &&
    state.forms &&
    state.templates &&
    state.languages

  const isOfflineDataLoaded = Boolean(hasAllRequiredData)
  if (isOfflineDataLoaded) merge(window.config, state.config)
  return isOfflineDataLoaded
}

export const getOfflineDataLoaded = (
  store: IStoreState
): IOfflineDataState['offlineDataLoaded'] => getKey(store, 'offlineDataLoaded')

export const getOfflineData = (store: IStoreState): IOfflineData => {
  const data = getKey(store, 'offlineData')
  if (!isOfflineDataLoaded(data)) {
    throw new Error('Offline data is not yet loaded. This should never happen')
  }
  return data
}

export const getLanguage = createSelector(
  getOfflineData,
  (data) => data.languages[0]
)
export const getCertificateTemplates = createSelector(
  getOfflineData,
  (data) => data.templates.certificates
)
export const getLocations = createSelector(getOfflineData, (data) => ({
  ...data.locations,
  ...data.facilities,
  ...data.offices
}))

export const getAdminStructureLocations = createSelector(
  getOfflineData,
  (data) => data.locations
)

export const selectCountryBackground = (store: IStoreState) => {
  const countryBackground = getKey(store, 'offlineData').config
    ?.LOGIN_BACKGROUND
  if (countryBackground?.backgroundImage) {
    return {
      backgroundImage: countryBackground.backgroundImage,
      imageFit: countryBackground.imageFit
    }
  }
  return {
    backgroundColor: countryBackground?.backgroundColor ?? '36304E'
  }
}

export const selectCountryLogo = (store: IStoreState) => {
  return (
    getKey(store, 'offlineData').config?.COUNTRY_LOGO?.file ||
    getKey(store, 'offlineData').anonymousConfig?.COUNTRY_LOGO?.file
  )
}

export function selectApplicationName(store: IStoreState) {
  return (
    getKey(store, 'offlineData').config?.APPLICATION_NAME ||
    getKey(store, 'offlineData').anonymousConfig?.APPLICATION_NAME
  )
}

export const getOfflineLoadingError = (
  store: IStoreState
): IOfflineDataState['loadingError'] => getKey(store, 'loadingError')
