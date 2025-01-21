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
  ILocationDataResponse,
  referenceApi,
  CertificateConfiguration,
  IFacilitiesDataResponse,
  IOfficesDataResponse
} from '@client/utils/referenceApi'
import { ILanguage } from '@client/i18n/reducer'
import { filterLocations } from '@client/utils/locationUtils'
import { Event, System } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { isOfflineDataLoaded } from './selectors'
import { ISVGTemplate } from '@client/pdfRenderer'
import { merge } from 'lodash'
import { isNavigatorOnline } from '@client/utils'
import { ISerializedForm } from '@client/forms'
import { initConditionals } from '@client/forms/conditionals'
import { initValidators } from '@client/forms/validators'
import {
  Action as NotificationAction,
  configurationErrorNotification
} from '@client/notification/actions'
import { initHandlebarHelpers } from '@client/forms/handlebarHelpers'

export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export type LocationType =
  | 'HEALTH_FACILITY'
  | 'CRVS_OFFICE'
  | 'ADMIN_STRUCTURE'
  | 'PRIVATE_HOME'

export interface ILocation {
  id: string
  name: string
  status: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  statisticalId: string
  type: string
  partOf: string
}

type JurisdictionType = 'STATE' | 'DISTRICT' | `LOCATION_LEVEL_${number}`

export interface AdminStructure extends ILocation {
  type: 'ADMIN_STRUCTURE'
  jurisdictionType: JurisdictionType
  physicalType: 'Jurisdiction'
}

export interface Facility extends ILocation {
  type: 'HEALTH_FACILITY'
  physicalType: 'Building'
}

export interface CRVSOffice extends ILocation {
  type: 'CRVS_OFFICE'
  physicalType: 'Building'
}

export interface IOfflineData {
  locations: ILocationDataResponse
  forms: {
    version: string
    birth: ISerializedForm
    death: ISerializedForm
    marriage: ISerializedForm
  }
  facilities: IFacilitiesDataResponse
  offices: IOfficesDataResponse
  languages: ILanguage[]
  templates: {
    fonts?: CertificateConfiguration['fonts']
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
}

export type IOfflineDataState = {
  offlineData: Partial<IOfflineData>
  offlineDataLoaded: boolean
  loadingError: boolean
  userDetails?: UserDetails
}

type Action = actions.Action | NotificationAction

const initialState: IOfflineDataState = {
  offlineData: {},
  offlineDataLoaded: false,
  loadingError: false
}

async function saveOfflineData(offlineData: IOfflineData) {
  return storage.setItem('offline', JSON.stringify(offlineData))
}

export type CertificatePayload = {
  svgCode: string
  event: Event
}

function checkIfDone(
  oldState: IOfflineDataState,
  loopOrState: IOfflineDataState | Loop<IOfflineDataState, Action>
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

const FORMS_CMD = Cmd.run(() => referenceApi.loadForms(), {
  successActionCreator: actions.formsLoaded,
  failActionCreator: actions.formsFailed
})

const CONFIG_CMD = Cmd.run(() => referenceApi.loadConfig(), {
  successActionCreator: actions.configLoaded,
  failActionCreator: actions.configFailed
})

const CERTIFICATE_CONFIG_CMD = Cmd.run(
  () => referenceApi.loadCertificateConfiguration(),
  {
    successActionCreator: actions.certificateConfigurationLoaded,
    failActionCreator: actions.certificateConfigurationLoadFailed
  }
)

const CONTENT_CMD = Cmd.run(() => referenceApi.loadContent(), {
  successActionCreator: actions.contentLoaded,
  failActionCreator: actions.contentFailed
})

const CONDITIONALS_CMD = Cmd.run(() => initConditionals(), {
  successActionCreator: actions.conditionalsLoaded,
  failActionCreator: actions.conditionalsFailed
})

const VALIDATORS_CMD = Cmd.run(() => initValidators(), {
  successActionCreator: actions.validatorsLoaded,
  failActionCreator: actions.validatorsFailed
})

const HANDLEBARS_CMD = Cmd.run(() => initHandlebarHelpers(), {
  successActionCreator: actions.handlebarsLoaded,
  failActionCreator: actions.handlebarsFailed
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
    CERTIFICATE_CONFIG_CMD,
    CONDITIONALS_CMD,
    VALIDATORS_CMD,
    HANDLEBARS_CMD,
    FORMS_CMD,
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
): IOfflineDataState | Loop<IOfflineDataState, Action> {
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

    /*
     * Configurations
     */
    case actions.APPLICATION_CONFIG_LOADED: {
      const { certificates, config, systems } = action.payload
      merge(window.config, config)
      const birthCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Birth
      )

      const deathCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Death
      )

      const marriageCertificateTemplate = certificates.find(
        ({ event }) => event === Event.Marriage
      )

      let newOfflineData: Partial<IOfflineData>

      if (
        birthCertificateTemplate &&
        deathCertificateTemplate &&
        marriageCertificateTemplate
      ) {
        const certificatesTemplates = {
          birth: {
            definition: birthCertificateTemplate.svgCode
          },
          death: {
            definition: deathCertificateTemplate.svgCode
          },
          marriage: {
            definition: marriageCertificateTemplate.svgCode
          }
        }

        newOfflineData = {
          ...state.offlineData,
          config,
          systems,
          templates: {
            ...state.offlineData.templates,
            certificates: certificatesTemplates
          }
        }
      } else {
        newOfflineData = {
          ...state.offlineData,
          config,
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

    case actions.APPLICATION_CONFIG_FAILED: {
      const payload = action.payload
      if (payload.cause === 'VALIDATION_ERROR') {
        return loop(
          {
            ...state,
            loadingError: errorIfDataNotLoaded(state)
          },
          Cmd.action(
            configurationErrorNotification(
              payload.message + ' to load application configuration properly'
            )
          )
        )
      }
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
          languages: action.payload.languages
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

    case actions.CERTIFICATE_CONFIGURATION_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          templates: {
            ...state.offlineData.templates,
            fonts: action.payload.fonts
          }
        }
      }
    }

    case actions.CERTIFICATE_CONFIGURATION_LOAD_FAILED: {
      return loop(state, delay(CERTIFICATE_CONFIG_CMD, RETRY_TIMEOUT))
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
     * Forms
     */

    case actions.FORMS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          forms: action.payload.forms
        }
      }
    }
    case actions.FORMS_FAILED: {
      const payload = action.payload
      if (payload.cause === 'VALIDATION_ERROR') {
        return loop(
          {
            ...state,
            loadingError: errorIfDataNotLoaded(state)
          },
          Cmd.action(configurationErrorNotification(payload.message))
        )
      }
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(FORMS_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Facilities && Offices
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(action.payload, 'HEALTH_FACILITY')

      const offices = filterLocations(
        action.payload,
        'CRVS_OFFICE'
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
): IOfflineDataState | Loop<IOfflineDataState, Action> {
  const newState = reducer(state, action)
  if (action.type !== actions.READY) {
    return checkIfDone(state, newState)
  }
  return newState
}
