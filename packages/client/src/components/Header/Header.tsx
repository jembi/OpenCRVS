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
import { ProfileMenu } from '@client/components/ProfileMenu'
import { constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/header'
import { Icon } from '@opencrvs/components/lib/Icon'
import {
  goBack,
  goForward,
  goToEvents as goToEventsAction,
  goToPerformanceHome,
  goToSearch,
  goToSearchResult,
  goToSettings,
  goToTeamSearch,
  goToTeamUserList,
  goToCreateNewUserWithLocationId,
  goToCreateNewUser,
  goToAdvancedSearch
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import { Hamburger } from './Hamburger'
import {
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  ADVANCED_SEARCH_TEXT,
  SYS_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import { UserDetails } from '@client/utils/userUtils'
import { Button } from '@opencrvs/components/lib/Button'

import { AppHeader, IDomProps } from '@opencrvs/components/lib/AppHeader'
import {
  SearchTool,
  ISearchType,
  INavigationType
} from '@opencrvs/components/lib/SearchTool'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { TEAM_USER_LIST } from '@client/navigation/routes'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { advancedSearchInitialState } from '@client/search/advancedSearch/reducer'
import { HistoryNavigator } from './HistoryNavigator'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { SearchCriteria } from '@client/utils/referenceApi'

type IStateProps = {
  userDetails: UserDetails | null
  fieldNames: string[]
  language: string
  offlineData: IOfflineData
}

type IDispatchProps = {
  redirectToAuthentication: typeof redirectToAuthentication
  goToSearchResult: typeof goToSearchResult
  goToEvents: typeof goToEventsAction
  goToSearch: typeof goToSearch
  goToSettings: typeof goToSettings
  goBack: typeof goBack
  goForward: typeof goForward
  goToPerformanceHomeAction: typeof goToPerformanceHome
  goToCreateNewUserWithLocationId: typeof goToCreateNewUserWithLocationId
  goToCreateNewUser: typeof goToCreateNewUser
  goToTeamSearchAction: typeof goToTeamSearch
  goToTeamUserListAction: typeof goToTeamUserList
  goToAdvancedSearch: typeof goToAdvancedSearch
  setAdvancedSearchParam: typeof setAdvancedSearchParam
}

interface IProps extends RouteComponentProps {
  activeMenuItem: ACTIVE_MENU_ITEM
  title?: string
  searchText?: string
  selectedSearchType?: string
  mobileSearchBar?: boolean
  enableMenuSelection?: boolean
  changeTeamLocation?: () => void
  mapPerformanceClickHandler?: () => void
  /** Sets default mobile right actions */
  mobileRight?: {
    icon: () => React.ReactNode
    handler: () => void
  }[]
}

type IFullProps = IntlShapeProps &
  IStateProps &
  IDispatchProps &
  IProps &
  IDomProps

enum ACTIVE_MENU_ITEM {
  DECLARATIONS,
  CONFIG,
  PERFORMANCE,
  TEAM,
  USERS,
  CERTIFICATE,
  APPLICATION,
  FORM,
  INTEGRATION,
  VSEXPORTS
}

const Search = styled(SearchTool)`
  margin-right: 45px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 0;
  }
`

const HeaderCenter = styled.div`
  height: 40px;
  gap: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
`
const HeaderRight = styled.div`
  height: 40px;
  background: ${({ theme }) => theme.colors.white};
`

const USERS_WITHOUT_SEARCH = SYS_ADMIN_ROLES.concat(
  NATL_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
)

export const HeaderComponent = (props: IFullProps) => {
  const {
    location,
    mapPerformanceClickHandler,
    goToCreateNewUserWithLocationId,
    changeTeamLocation,
    goToCreateNewUser,
    userDetails,
    mobileSearchBar,
    goToSearch,
    offlineData,
    className,
    intl,
    activeMenuItem,
    title,
    mobileRight,
    goToEvents
  } = props

  const getMobileHeaderActionProps = (activeMenuItem: ACTIVE_MENU_ITEM) => {
    const locationId = new URLSearchParams(location.search).get('locationId')
    if (activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ],
        mobileRight: [
          {
            icon: () => <Icon name="Activity" size="medium" color="primary" />,
            handler: () =>
              mapPerformanceClickHandler && mapPerformanceClickHandler()
          }
        ]
      }
    }
    if (activeMenuItem === ACTIVE_MENU_ITEM.USERS && changeTeamLocation) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ],
        mobileRight: [
          {
            icon: () => (
              <Icon name="MagnifyingGlass" size="medium" color="primary" />
            ),
            handler: () => changeTeamLocation && changeTeamLocation()
          },
          {
            icon: () => <Icon name="UserPlus" size="medium" color="primary" />,
            handler: () => {
              if (locationId) {
                return goToCreateNewUserWithLocationId(locationId)
              }
              goToCreateNewUser()
            }
          }
        ]
      }
    }
    if (
      activeMenuItem === ACTIVE_MENU_ITEM.USERS &&
      userDetails?.systemRole &&
      SYS_ADMIN_ROLES.includes(userDetails?.systemRole)
    ) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ],
        mobileRight: [
          {
            icon: () => <Icon name="UserPlus" size="medium" color="primary" />,
            handler: () => {
              if (locationId) {
                return goToCreateNewUserWithLocationId(locationId)
              }
              goToCreateNewUser()
            }
          }
        ]
      }
    }
    if (activeMenuItem === ACTIVE_MENU_ITEM.USERS) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ]
      }
    }
    if (
      userDetails?.systemRole &&
      USERS_WITHOUT_SEARCH.includes(userDetails?.systemRole)
    ) {
      return {
        mobileLeft: [
          {
            icon: () => <Hamburger />,
            handler: () => {}
          }
        ]
      }
    }
    if (mobileSearchBar) {
      return {
        mobileLeft: [
          {
            icon: () => <HistoryNavigator hideForward />,
            handler: () => {}
          }
        ],
        mobileBody: renderSearchInput(props, true)
      }
    }
    return {
      mobileLeft: [
        {
          icon: () => <Hamburger />,
          handler: () => {}
        }
      ],
      mobileRight: [
        {
          icon: () => (
            <Icon name="MagnifyingGlass" size="medium" color="primary" />
          ),
          handler: () => goToSearch()
        }
      ]
    }
  }

  const renderSearchInput = (props: IFullProps, isMobile?: boolean) => {
    const { intl, searchText, selectedSearchType, language, fieldNames } = props

    const searchTypeList: ISearchType[] = [
      {
        name: SearchCriteria.TRACKING_ID,
        label: intl.formatMessage(constantsMessages.trackingId),
        icon: <Icon name="Target" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId)
      },
      {
        name: SearchCriteria.REGISTRATION_NUMBER,
        label: intl.formatMessage(messages.typeRN),
        icon: <Icon name="Medal" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        name: SearchCriteria.NAME,
        label: intl.formatMessage(messages.typeName),
        icon: <Icon name="User" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeholderName)
      }
    ]

    if (fieldNames.includes('registrationPhone')) {
      searchTypeList.splice(3, 0, {
        name: SearchCriteria.PHONE_NUMBER,
        label: intl.formatMessage(messages.typePhone),
        icon: <Icon name="Phone" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      })
    }
    if (
      fieldNames.includes('iD') ||
      fieldNames.includes('deceasedID') ||
      fieldNames.includes('informantID') ||
      fieldNames.some((name) => name.endsWith('NationalId'))
    ) {
      searchTypeList.splice(2, 0, {
        name: SearchCriteria.NATIONAL_ID,
        label: intl.formatMessage(constantsMessages.id),
        icon: <Icon name="IdentificationCard" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeholderId)
      })
    }
    if (fieldNames.includes('registrationEmail')) {
      searchTypeList.push({
        name: SearchCriteria.EMAIL,
        label: intl.formatMessage(messages.email),
        icon: <Icon name="Envelope" size="small" />,
        placeHolderText: intl.formatMessage(messages.placeHolderEmail)
      })
    }

    const navigationList: INavigationType[] = [
      {
        label: intl.formatMessage(messages.advancedSearch),
        id: ADVANCED_SEARCH_TEXT,
        onClick: () => {
          setAdvancedSearchParam(advancedSearchInitialState)
          goToAdvancedSearch()
        }
      }
    ]

    return (
      <Search
        key="searchMenu"
        language={language}
        searchText={searchText}
        selectedSearchType={
          selectedSearchType ?? offlineData.config.SEARCH_DEFAULT_CRITERIA
        }
        searchTypeList={searchTypeList}
        navigationList={
          FIELD_AGENT_ROLES.includes(userDetails?.systemRole as string)
            ? undefined
            : navigationList
        }
        searchHandler={(text, type) =>
          props.goToSearchResult(text, type, isMobile)
        }
      />
    )
  }

  const headerTitle =
    title ||
    intl.formatMessage(
      activeMenuItem === ACTIVE_MENU_ITEM.PERFORMANCE
        ? constantsMessages.performanceTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.TEAM ||
          activeMenuItem === ACTIVE_MENU_ITEM.USERS
        ? messages.teamTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.CERTIFICATE
        ? constantsMessages.certificateTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.APPLICATION
        ? constantsMessages.applicationTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.FORM
        ? constantsMessages.formDeclarationTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.INTEGRATION
        ? constantsMessages.integrationTitle
        : activeMenuItem === ACTIVE_MENU_ITEM.VSEXPORTS
        ? constantsMessages.vsExportTitle
        : constantsMessages.declarationTitle
    )

  let rightMenu = [
    {
      element: <HistoryNavigator />
    },
    {
      element: (
        <>
          {!(
            userDetails?.systemRole &&
            USERS_WITHOUT_SEARCH.includes(userDetails?.systemRole)
          ) && (
            <HeaderCenter>
              <Button
                type="iconPrimary"
                size="medium"
                key="newEvent"
                id="header_new_event"
                onClick={goToEvents}
              >
                <Icon name="Plus" size="medium" />
              </Button>

              {renderSearchInput(props)}
            </HeaderCenter>
          )}
        </>
      )
    },
    {
      element: (
        <HeaderRight>
          <ProfileMenu key="profileMenu" />
        </HeaderRight>
      )
    }
  ]

  if (
    activeMenuItem !== ACTIVE_MENU_ITEM.DECLARATIONS &&
    (NATL_ADMIN_ROLES.includes(userDetails?.systemRole as string) ||
      SYS_ADMIN_ROLES.includes(userDetails?.systemRole as string))
  ) {
    rightMenu = [
      {
        element: <HistoryNavigator />
      },
      {
        element: <ProfileMenu key="profileMenu" />
      }
    ]
  }

  const mobileHeaderActionProps = getMobileHeaderActionProps(activeMenuItem)

  const mobileHeaderActionPropsWithDefaults = {
    mobileRight: mobileRight,
    ...mobileHeaderActionProps
  }

  return (
    <AppHeader
      id="register_app_header"
      desktopRightMenu={rightMenu}
      className={className}
      title={headerTitle}
      {...mobileHeaderActionPropsWithDefaults}
    />
  )
}

export const Header = connect(
  (store: IStoreState) => ({
    activeMenuItem: window.location.href.includes('performance')
      ? ACTIVE_MENU_ITEM.PERFORMANCE
      : window.location.href.includes(TEAM_USER_LIST)
      ? ACTIVE_MENU_ITEM.USERS
      : window.location.href.includes('team')
      ? ACTIVE_MENU_ITEM.TEAM
      : window.location.href.includes('config/certificate')
      ? ACTIVE_MENU_ITEM.CERTIFICATE
      : window.location.href.includes('config/application')
      ? ACTIVE_MENU_ITEM.APPLICATION
      : window.location.href.includes('config/form')
      ? ACTIVE_MENU_ITEM.FORM
      : window.location.href.includes('config/integration')
      ? ACTIVE_MENU_ITEM.INTEGRATION
      : window.location.href.includes('vsexports')
      ? ACTIVE_MENU_ITEM.VSEXPORTS
      : ACTIVE_MENU_ITEM.DECLARATIONS,
    language: store.i18n.language,
    userDetails: getUserDetails(store),
    offlineData: getOfflineData(store),
    fieldNames: Object.values(getRegisterForm(store))
      .flatMap((form) => form.sections)
      .flatMap((section) => section.groups)
      .flatMap((group) => group.fields)
      .map((field) => field.name)
  }),
  {
    redirectToAuthentication,
    goToSearchResult,
    goToSearch,
    goToSettings,
    goBack,
    goForward,
    goToEvents: goToEventsAction,
    goToPerformanceHomeAction: goToPerformanceHome,
    goToCreateNewUserWithLocationId,
    goToCreateNewUser,
    goToTeamSearchAction: goToTeamSearch,
    goToTeamUserListAction: goToTeamUserList,
    goToAdvancedSearch: goToAdvancedSearch,
    setAdvancedSearchParam: setAdvancedSearchParam
  }
)(injectIntl(withRouter(HeaderComponent)))

/** @deprecated since the introduction of `<Frame>` */
export const MarginedHeader = styled(Header)`
  margin-left: 282px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 0;
  }
`
