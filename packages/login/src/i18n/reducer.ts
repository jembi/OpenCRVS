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
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@login/i18n/actions'

import {
  getAvailableLanguages,
  getDefaultLanguage,
  storeLanguage
} from './utils'
import { loadContent } from '@login/utils/referenceApi'

export interface IntlMessages {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  displayName: string
  messages: IntlMessages
}

export interface ILanguageState {
  [key: string]: ILanguage
}

interface ISupportedLanguages {
  code: string
  language: string
}

const supportedLanguages: ISupportedLanguages[] = [
  { code: 'en', language: 'English' },
  { code: 'fr', language: 'Français' },
  { code: 'bn', language: 'বাংলা' }
]

export const initLanguages = () => {
  const initLanguages: ILanguageState = {}
  getAvailableLanguages().forEach((lang) => {
    const languageDescription = supportedLanguages.find(
      (obj) => obj.code === lang
    ) as ISupportedLanguages
    initLanguages[lang] = {
      lang,
      displayName: languageDescription.language,
      messages: {}
    }
  })
  return initLanguages
}

export type IntlState = {
  language: string
  messages: IntlMessages
  languages: ILanguageState
}

const DEFAULT_MESSAGES = { default: 'default' }

export const initialState: IntlState = {
  language: getDefaultLanguage(),
  messages: DEFAULT_MESSAGES,
  languages: initLanguages()
}

const getNextMessages = (
  language: string,
  languages: ILanguageState
): IntlMessages => {
  return languages[language].messages
}

export const intlReducer: LoopReducer<IntlState, any> = (
  state: IntlState = initialState,
  action: actions.Action
): IntlState | Loop<IntlState, actions.Action> => {
  switch (action.type) {
    case actions.LOAD_LANGUAGE:
      return loop(
        state,
        Cmd.run(loadContent, {
          successActionCreator: actions.loadLanguagesSuccess
        })
      )
    case actions.LOAD_LANGUAGE_SUCCESS:
      const { languages } = action.payload

      const loadedLanguagesState: ILanguageState = languages.reduce(
        (indexedByLang, language) => ({
          ...indexedByLang,
          [language.lang]: language
        }),
        {}
      )
      return {
        ...state,
        messages: getNextMessages(state.language, loadedLanguagesState),
        languages: loadedLanguagesState
      }
    case actions.CHANGE_LANGUAGE:
      const messages = getNextMessages(action.payload.language, state.languages)

      return loop(
        {
          ...state,
          language: action.payload.language,
          messages
        },
        Cmd.run(() => storeLanguage(action.payload.language))
      )
    default:
      return state
  }
}
