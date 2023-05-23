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
  loop,
  Cmd,
  Loop,
  liftState,
  getModel,
  getCmd,
  RunCmd
} from 'redux-loop'
import * as actions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  IApplicationConfig,
  IApplicationConfigAnonymous,
  ICertificateTemplateData,
  referenceApi
} from '@client/utils/referenceApi'
import { ILanguage } from '@client/i18n/reducer'
import { filterLocations } from '@client/utils/locationUtils'
import { IFormConfig } from '@client/forms'
import { Event, System } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import {
  IQuestionConfig,
  isDefaultQuestionConfig
} from '@client/forms/questionConfig'
import { isOfflineDataLoaded } from './selectors'
import {
  IPDFTemplate,
  ISVGTemplate
} from '@client/pdfRenderer/transformer/types'
import { find, isEmpty, merge } from 'lodash'
import { isNavigatorOnline } from '@client/utils'
import { getToken } from '@client/utils/authUtils'
export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export enum LocationType {
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  CRVS_OFFICE = 'CRVS_OFFICE',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE'
}
export interface ILocation {
  id: string
  name: string
  status: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  languages: ILanguage[]
  templates: {
    receipt?: IPDFTemplate
    // Certificates might not be defined in the case of
    // a field agent using the app.
    certificates?: {
      birth: ISVGTemplate
      death: ISVGTemplate
      marriage: ISVGTemplate
    }
  }
  assets: {
    logo: string
  }
  systems: System[]
  config: IApplicationConfig
  anonymousConfig: IApplicationConfigAnonymous
  formConfig: IFormConfig
}

export type IOfflineDataState = {
  offlineData: Partial<IOfflineData>
  offlineDataLoaded: boolean
  loadingError: boolean
  userDetails?: UserDetails
}

export const initialState: IOfflineDataState = {
  offlineData: {},
  offlineDataLoaded: false,
  loadingError: false
}

async function saveOfflineData(offlineData: IOfflineData) {
  return storage.setItem('offline', JSON.stringify(offlineData))
}

function getAvailableContent(formConfig: IFormConfig, languages: ILanguage[]) {
  languages.forEach((language) => {
    language.messages = {
      ...language.messages,
      ...extractMessages(formConfig.questionConfig, language.lang)
    }
  })
  return languages
}

export type CertificatePayload = Awaited<ReturnType<typeof loadCertificate>>

async function loadCertificate(
  savedCertificate: ISVGTemplate | undefined,
  certificate: ICertificateTemplateData
) {
  const { svgCode: url, event } = certificate
  const res = await fetch(url, {
    headers: {
      Authorization: getToken(),
      'If-None-Match': savedCertificate?.hash ?? ''
    }
  })
  if (res.status === 304) {
    return {
      ...certificate,
      svgCode: savedCertificate!.definition,
      hash: savedCertificate!.hash!
    }
  }
  if (!res.ok) {
    return Promise.reject(
      new Error(`Fetching certificate for "${event}" failed`)
    )
  }
  return res.text().then((svgCode) => ({
    ...certificate,
    svgCode,
    hash: res.headers.get('etag')!
  }))
}

async function loadCertificates(
  savedCertificates: IOfflineData['templates']['certificates'],
  fetchedCertificates: ICertificateTemplateData[]
) {
  return await Promise.all(
    fetchedCertificates.map((cert) =>
      loadCertificate(savedCertificates?.[cert.event], cert)
    )
  )
}

function extractMessages(questions: IQuestionConfig[], language: string) {
  const messages: { [key: string]: string } = {}
  questions.forEach((question) => {
    if (isDefaultQuestionConfig(question)) {
      return
    }
    const labelMessage = find(question.label, {
      lang: language
    })
    const placeholderMessage = find(question.placeholder, {
      lang: language
    })
    const descriptionMessage = find(question.description, {
      lang: language
    })
    const tooltipMessage = find(question.tooltip, {
      lang: language
    })
    const errorMessage = find(question.errorMessage, {
      lang: language
    })
    const optionMessages = question?.options?.map((option) => {
      return find(option.label, {
        lang: language
      })
    })
    if (labelMessage?.descriptor?.id) {
      const labelID: string = labelMessage.descriptor.id as string
      messages[labelID] = labelMessage?.descriptor?.defaultMessage as string
    }

    if (placeholderMessage?.descriptor?.id) {
      const placeholderID: string = placeholderMessage.descriptor.id as string
      messages[placeholderID] = placeholderMessage.descriptor
        .defaultMessage as string
    }

    if (descriptionMessage?.descriptor?.id) {
      const descID = descriptionMessage.descriptor.id as string
      messages[descID] = descriptionMessage.descriptor.defaultMessage as string
    }

    if (tooltipMessage?.descriptor?.id) {
      const tooltipID = tooltipMessage.descriptor.id as string
      messages[tooltipID] = tooltipMessage.descriptor.defaultMessage as string
    }

    if (errorMessage?.descriptor?.id) {
      const errID = errorMessage.descriptor.id as string
      messages[errID] = errorMessage.descriptor.defaultMessage as string
    }

    if (!isEmpty(optionMessages)) {
      optionMessages?.forEach((option) => {
        if (option?.descriptor?.id) {
          const errID = option.descriptor.id as string
          messages[errID] = option.descriptor.defaultMessage as string
        }
      })
    }
  })
  return messages
}

function checkIfDone(
  oldState: IOfflineDataState,
  loopOrState: IOfflineDataState | Loop<IOfflineDataState, actions.Action>
) {
  const loopWithState = liftState(loopOrState)
  const newState = getModel(loopWithState)
  const cmd = getCmd(loopWithState)
  if (
    isOfflineDataLoaded(newState.offlineData) &&
    !oldState.offlineDataLoaded
  ) {
    return loop(
      { ...newState, offlineDataLoaded: true },
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataReady(newState.offlineData))
      ])
    )
  }

  if (
    /*
     * Data was updated with a fresh version from offlineCountryConfig
     */
    isOfflineDataLoaded(oldState.offlineData) &&
    isOfflineDataLoaded(newState.offlineData) &&
    oldState.offlineData !== newState.offlineData
  ) {
    return loop(
      newState,
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataUpdated(newState.offlineData))
      ])
    )
  }

  return loopWithState
}

const FACILITIES_CMD = Cmd.run(() => referenceApi.loadFacilities(), {
  successActionCreator: actions.facilitiesLoaded,
  failActionCreator: actions.facilitiesFailed
})

const LOCATIONS_CMD = Cmd.run(() => referenceApi.loadLocations(), {
  successActionCreator: actions.locationsLoaded,
  failActionCreator: actions.locationsFailed
})

const CONFIG_CMD = Cmd.run(() => referenceApi.loadConfig(), {
  successActionCreator: actions.configLoaded,
  failActionCreator: actions.configFailed
})

const CONTENT_CMD = Cmd.run(() => referenceApi.loadContent(), {
  successActionCreator: actions.contentLoaded,
  failActionCreator: actions.contentFailed
})

const RETRY_TIMEOUT = 5000

function delay(cmd: RunCmd<any>, time: number) {
  return Cmd.list(
    [Cmd.run(() => new Promise((resolve) => setTimeout(resolve, time))), cmd],
    { sequence: true }
  )
}

function getDataLoadingCommands() {
  return Cmd.list<actions.Action>([
    FACILITIES_CMD,
    LOCATIONS_CMD,
    CONFIG_CMD,
    CONTENT_CMD
  ])
}

function updateGlobalConfig() {
  return Cmd.run(() => {
    // Replaces the script tag in site head with a fresh one
    const currentConfigElement = Array.from(
      document.querySelectorAll('script')
    ).find(({ src }) => src.indexOf('config.js'))!
    const head = document.getElementsByTagName('head')[0]
    const newConfigElement = document.createElement('script')
    newConfigElement.src = currentConfigElement.src.replace(
      /\?.*/,
      '?cachebuster=' + Date.now()
    )
    head.appendChild(newConfigElement)
    head.removeChild(currentConfigElement)
  })
}

/*
 * If offline data is already stored, but we're just not able to update it
 * we retry, but do not show the user an error
 */
function errorIfDataNotLoaded(state: IOfflineDataState) {
  return !isOfflineDataLoaded(state.offlineData)
}

function reducer(
  state: IOfflineDataState,
  action: actions.Action | profileActions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  switch (action.type) {
    // ENTRYPOINT - called from profile reducer
    case profileActions.USER_DETAILS_AVAILABLE: {
      return loop(
        { ...state, userDetails: action.payload },
        Cmd.run(storage.getItem, {
          args: ['offline'],
          successActionCreator: actions.getOfflineDataSuccess,
          // @todo this action isn't handled
          failActionCreator: actions.getOfflineDataFailed
        })
      )
    }
    case actions.REFRESH_OFFLINE_DATA: {
      return loop(
        state,
        Cmd.list([getDataLoadingCommands(), updateGlobalConfig()])
      )
    }
    case actions.ANONYMOUS_USER_OFFLINE_CONFIG: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          ...action.payload
        }
      }
    }
    case actions.GET_OFFLINE_DATA_SUCCESS: {
      const offlineDataString = action.payload
      const offlineData: IOfflineData = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      const dataLoadingCmds = getDataLoadingCommands()
      const offlineDataLoaded = isOfflineDataLoaded(offlineData)
      if (offlineDataLoaded) {
        return loop(
          {
            ...state,
            offlineData,
            offlineDataLoaded
          },
          Cmd.list([
            // Try loading data regardless as it might have been updated.
            isNavigatorOnline() ? dataLoadingCmds : Cmd.none
          ])
        )
      }
      return loop(state, dataLoadingCmds)
    }
    case actions.UPDATE_OFFLINE_CERTIFICATE: {
      const { templates } = state.offlineData
      const { certificate } = action.payload
      if (!templates || !templates.certificates) {
        return state
      }
      return loop(
        state,
        Cmd.run(loadCertificate, {
          successActionCreator: actions.certificateLoaded,
          failActionCreator: actions.certificateLoadFailed,
          args: [templates.certificates[certificate.event], certificate]
        })
      )
    }
    case actions.CERTIFICATE_LOADED: {
      const { templates } = state.offlineData
      const certificate = action.payload
      if (!templates || !templates.certificates) {
        return state
      }
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          templates: {
            ...templates,
            certificates: {
              ...templates.certificates,
              [certificate.event]: {
                ...templates.certificates[certificate.event],
                definition: certificate.svgCode,
                fileName: certificate.svgFilename,
                lastModifiedDate: certificate.svgDateUpdated,
                hash: certificate.hash
              }
            }
          }
        }
      }
    }
    case actions.UPDATE_OFFLINE_CONFIG: {
      merge(window.config, action.payload.config)
      const newOfflineData = {
        ...state.offlineData,
        config: action.payload.config
      }

      return loop(
        {
          ...state,
          offlineData: newOfflineData
        },
        Cmd.run(saveOfflineData, { args: [newOfflineData] })
      )
    }
    case actions.UPDATE_OFFLINE_SYSTEMS: {
      const newOfflineData = {
        ...state.offlineData,
        systems: action.payload.systems
      }

      return loop(
        {
          ...state,
          offlineData: newOfflineData
        },
        Cmd.run(saveOfflineData, { args: [newOfflineData] })
      )
    }
    case actions.UPDATE_OFFLINE_FORM_CONFIG: {
      const { formConfig } = state.offlineData

      if (!formConfig) return state

      const {
        formDrafts,
        questionConfig = formConfig.questionConfig,
        formDataset
      } = action.payload

      const newFormConfig = {
        formDrafts,
        questionConfig,
        formDataset
      }

      return loop(
        {
          ...state,
          offlineData: {
            ...state.offlineData,
            formConfig: newFormConfig
          }
        },
        Cmd.action(actions.offlineFormConfigUpdated(newFormConfig))
      )
    }
    /*
     * Configurations
     */
    case actions.APPLICATION_CONFIG_LOADED: {
      const { certificates, config, formConfig, systems } = action.payload
      merge(window.config, config)
      let newOfflineData
      const birthCertificateTemplate = certificates.find(
        ({ event, status }) => event === Event.Birth && status === 'ACTIVE'
      )

      const deathCertificateTemplate = certificates.find(
        ({ event, status }) => event === Event.Death && status === 'ACTIVE'
      )

      const marriageCertificateTemplate = certificates.find(
        ({ event, status }) => event === Event.Marriage && status === 'ACTIVE'
      )

      if (
        birthCertificateTemplate &&
        deathCertificateTemplate &&
        marriageCertificateTemplate
      ) {
        return loop(
          {
            ...state,
            offlineData: {
              ...state.offlineData,
              config,
              formConfig,
              systems
            }
          },
          Cmd.run(loadCertificates, {
            successActionCreator: actions.certificatesLoaded,
            args: [state.offlineData.templates?.certificates, certificates]
          })
        )
      } else {
        newOfflineData = {
          ...state.offlineData,
          config,
          formConfig,
          systems,

          // Field agents do not get certificate templates from the config service.
          // Our loading logic depends on certificates being present and the app would load infinitely
          // without a value here.
          // This is a quickfix for the issue. If done properly, we should amend the "is loading" check
          // to not expect certificate templates when a field agent is logged in.
          templates: {}
        }
      }

      return {
        ...state,
        offlineDataLoaded: isOfflineDataLoaded(newOfflineData),
        offlineData: newOfflineData
      }
    }

    case actions.CERTIFICATES_LOADED: {
      const certificates = action.payload
      const birthCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Birth
      )

      const deathCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Death
      )

      const marriageCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Marriage
      )
      if (
        birthCertificateTemplate &&
        deathCertificateTemplate &&
        marriageCertificateTemplate
      ) {
        const certificatesTemplates = {
          birth: {
            id: birthCertificateTemplate.id,
            definition: birthCertificateTemplate.svgCode,
            fileName: birthCertificateTemplate.svgFilename,
            lastModifiedDate: birthCertificateTemplate.svgDateUpdated,
            hash: birthCertificateTemplate.hash
          },
          death: {
            id: deathCertificateTemplate.id,
            definition: deathCertificateTemplate.svgCode,
            fileName: deathCertificateTemplate.svgFilename,
            lastModifiedDate: deathCertificateTemplate.svgDateUpdated,
            hash: deathCertificateTemplate.hash
          },
          marriage: {
            id: marriageCertificateTemplate.id,
            definition: marriageCertificateTemplate.svgCode,
            fileName: marriageCertificateTemplate.svgFilename,
            lastModifiedDate: marriageCertificateTemplate.svgDateUpdated,
            hash: marriageCertificateTemplate.hash
          }
        }
        const newOfflineData = {
          ...state.offlineData,
          templates: {
            certificates: certificatesTemplates
          }
        }
        return {
          ...state,
          offlineDataLoaded: isOfflineDataLoaded(newOfflineData),
          offlineData: newOfflineData
        }
      }
      return state
    }

    case actions.CERTIFICATES_LOAD_FAILED:
    case actions.APPLICATION_CONFIG_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(CONFIG_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Definitions
     */

    case actions.CONTENT_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          languages: state.offlineData.formConfig
            ? getAvailableContent(
                state.offlineData.formConfig as IFormConfig,
                action.payload.languages
              )
            : action.payload.languages
        }
      }
    }
    case actions.CONTENT_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(CONTENT_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Locations
     */

    case actions.LOCATIONS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          locations: action.payload
        }
      }
    }
    case actions.LOCATIONS_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(LOCATIONS_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Facilities && Offices
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(
        action.payload,
        LocationType.HEALTH_FACILITY
      )

      const offices = filterLocations(
        action.payload,
        LocationType.CRVS_OFFICE
        /*

        // This is used to filter office locations available offline
        // It was important in an older design and may become important again

        {
          locationLevel: 'id',
          locationId: isNationalSystemAdmin(state.userDetails)
            ? undefined
            : state.userDetails &&
              state.userDetails.primaryOffice &&
              state.userDetails.primaryOffice.id
        }*/
      )
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          facilities,
          offices
        }
      }
    }
    case actions.FACILITIES_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(FACILITIES_CMD, RETRY_TIMEOUT)
      )
    }

    case actions.READY: {
      const offlineDataLoaded = isOfflineDataLoaded(action.payload)
      return {
        ...state,
        loadingError: false,
        offlineData: action.payload,
        offlineDataLoaded
      }
    }

    default:
      return state
  }
}

export function offlineDataReducer(
  state: IOfflineDataState | undefined = initialState,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  const newState = reducer(state, action)
  if (action.type !== actions.READY) {
    return checkIfDone(state, newState)
  }
  return newState
}
