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
import { storage } from '@client/storage'
import {
  IApplication,
  SUBMISSION_STATUS,
  IWorkqueue,
  filterProcessingApplicationsFromQuery
} from '@client/applications'
import { IStoreState } from '@opencrvs/client/src/store'
import { LeftNavigationApplicationIcons } from '@opencrvs/components/lib/icons/LeftNavigationApplicationIcons'
import { LeftNavigation } from '@opencrvs/components/lib/interface/Navigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/interface/Navigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/interface/Navigation/NavigationItem'
import { NavigationSubItem } from '@opencrvs/components/lib/interface/Navigation/NavigationSubItem'
import { connect } from 'react-redux'
import {
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction,
  goToRegistrarHomeTab,
  goToConfig,
  goToSettings,
  goToPerformanceView,
  goToTeamView,
  goToApplicationConfig
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { COUNT_USER_WISE_APPLICATIONS } from '@client/search/queries'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { Activity, Avatar, Users } from '@opencrvs/components/lib/icons'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { Configuration } from '@opencrvs/components/lib/icons/Configuration'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'
import { Spinner } from '@opencrvs/components/lib/interface'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { Query } from '@client/components/Query'
import { RouteComponentProps, withRouter } from 'react-router'

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`

const SCREEN_LOCK = 'screenLock'

const TAB_ID = {
  inProgress: 'progress',
  sentForReview: 'review',
  requireUpdates: 'updates',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  sentForApproval: 'approvals',
  readyToPrint: 'print',
  externalValidation: 'waitingValidation',
  application: 'application',
  performance: 'performance',
  team: 'team',
  config: 'config',
  certificates: 'certificates',
  settings: 'settings',
  logout: 'logout'
}

const GROUP_ID = {
  applicationGroup: 'applicationGroup',
  menuGroup: 'menuGroup'
}

interface IUSER_SCOPE {
  [key: string]: string[]
}

const USER_SCOPE: IUSER_SCOPE = {
  FIELD_AGENT: [
    TAB_ID.inProgress,
    TAB_ID.sentForReview,
    TAB_ID.requireUpdates,
    GROUP_ID.applicationGroup
  ],
  REGISTRATION_AGENT: [
    TAB_ID.inProgress,
    TAB_ID.readyForReview,
    TAB_ID.sentForUpdates,
    TAB_ID.sentForApproval,
    TAB_ID.readyToPrint,
    TAB_ID.performance,
    TAB_ID.team,
    GROUP_ID.applicationGroup,
    GROUP_ID.menuGroup
  ],
  DISTRICT_REGISTRAR: [
    TAB_ID.inProgress,
    TAB_ID.readyForReview,
    TAB_ID.sentForUpdates,
    TAB_ID.readyToPrint,
    TAB_ID.performance,
    TAB_ID.team,
    GROUP_ID.applicationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_REGISTRAR: [
    TAB_ID.inProgress,
    TAB_ID.readyForReview,
    TAB_ID.sentForUpdates,
    TAB_ID.readyToPrint,
    TAB_ID.performance,
    TAB_ID.team,
    GROUP_ID.applicationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_SYSTEM_ADMIN: [TAB_ID.performance, TAB_ID.team, GROUP_ID.menuGroup],
  NATIONAL_SYSTEM_ADMIN: [
    TAB_ID.performance,
    TAB_ID.team,
    TAB_ID.config,
    GROUP_ID.menuGroup
  ]
}

interface ICount {
  inProgress?: number
  readyForReview?: number
  sentForReview?: number
  requiresUpdate?: number
  sentForUpdates?: number
  sentForApproval?: number
  externalValidation?: number
  readyToPrint?: number
}

interface IUserInfo {
  name: string
  role: string
  avatar: JSX.Element
}

interface IProps {
  count?: ICount
  enableMenuSelection?: boolean
  navigationWidth?: number
  menuCollapse?: () => void
  userInfo?: IUserInfo
  deselectAllTabs?: boolean
}

interface IDispatchProps {
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToConfigAction: typeof goToConfig
  goToApplicationConfigAction: typeof goToApplicationConfig
  redirectToAuthentication: typeof redirectToAuthentication
  goToPerformanceViewAction: typeof goToPerformanceView
  goToTeamViewAction: typeof goToTeamView
  goToSettings: typeof goToSettings
}

interface IStateProps {
  draftApplications: IApplication[]
  applicationsReadyToSend: IApplication[]
  userDetails: IUserDetails | null
  activeMenuItem: string
  workqueue: IWorkqueue
  storedApplications: IApplication[]
}

type IFullProps = IProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<{ tabId: string }>

const TAB_LABEL = {
  inProgress: 'In Progress',
  readyForReview: 'Ready for review',
  sentForReview: 'Sent for review',
  requiresUpdate: 'Requires Updates',
  sentForUpdates: 'Sent for updates',
  sentForApproval: 'Sent for approval',
  externalValidation: 'Waiting for validation',
  readyToPrint: 'Ready to print ',
  application: 'Application',
  performance: 'Performance',
  team: 'Team',
  configuration: 'Configuration',
  certificatesConfiguration: 'Certificates',
  applicationSettings: 'Application',
  settings: 'Settings',
  logout: 'Logout'
}

const getSettingsAndLogout = (props: IFullProps) => {
  const {
    menuCollapse,
    activeMenuItem,
    redirectToAuthentication,
    goToSettings
  } = props
  return (
    <>
      <NavigationItem
        icon={() => <SettingsNavigation />}
        id={`navigation_${TAB_ID.settings}`}
        label={TAB_LABEL.settings}
        onClick={() => {
          goToSettings()
          menuCollapse && menuCollapse()
        }}
        isSelected={activeMenuItem === TAB_ID.settings}
      />
      <NavigationItem
        icon={() => <LogoutNavigation />}
        id={`navigation_${TAB_ID.logout}`}
        label={TAB_LABEL.logout}
        onClick={() => {
          storage.removeItem(SCREEN_LOCK)
          redirectToAuthentication()
        }}
      />
    </>
  )
}

export const NavigationView = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    deselectAllTabs,
    enableMenuSelection = true,
    activeMenuItem,
    goToConfigAction,
    goToApplicationConfigAction,
    navigationWidth,
    workqueue,
    storedApplications,
    draftApplications,
    theme,
    menuCollapse,
    userInfo
  } = props
  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'
  const ConfigTab = [TAB_ID.application, TAB_ID.certificates]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const { loading, error, data, initialSyncDone } = workqueue
  const filteredData = filterProcessingApplicationsFromQuery(
    data,
    storedApplications
  )

  const fieldAgentLocationId = userDetails && getUserLocation(userDetails).id
  const applicationCount = {
    inProgress: !initialSyncDone
      ? 0
      : draftApplications.filter(
          (draft) =>
            draft.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        ).length +
        (filteredData.inProgressTab.totalItems || 0) +
        (filteredData.notificationTab.totalItems || 0),
    readyForReview: !initialSyncDone ? 0 : filteredData.reviewTab.totalItems,
    sentForUpdates: !initialSyncDone ? 0 : filteredData.rejectTab.totalItems,
    sentForApproval: !initialSyncDone ? 0 : filteredData.approvalTab.totalItems,
    externalValidation:
      window.config.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab.totalItems,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab.totalItems
  }

  return (
    <LeftNavigation
      applicationName={intl.formatMessage(constantsMessages.applicationName)}
      navigationWidth={navigationWidth}
      name={userInfo && userInfo.name}
      role={userInfo && userInfo.role}
      avatar={() => userInfo && userInfo.avatar}
    >
      {userDetails?.role === 'FIELD_AGENT' ? (
        <>
          <NavigationGroup>
            <NavigationItem
              icon={() => <LeftNavigationApplicationIcons />}
              id={`navigation_${TAB_ID.inProgress}`}
              label={TAB_LABEL.inProgress}
              count={props.draftApplications.length}
              isSelected={tabId === TAB_ID.inProgress}
              onClick={() => {
                props.goToFieldAgentHomeTab(TAB_ID.inProgress)
                menuCollapse && menuCollapse()
              }}
            />
            <NavigationItem
              icon={() => <LeftNavigationApplicationIcons color={'orange'} />}
              id={`navigation_${TAB_ID.sentForReview}`}
              label={TAB_LABEL.sentForReview}
              count={props.applicationsReadyToSend.length}
              isSelected={tabId === TAB_ID.sentForReview}
              onClick={() => {
                props.goToFieldAgentHomeTab(TAB_ID.sentForReview)
                menuCollapse && menuCollapse()
              }}
            />
            <Query
              query={COUNT_USER_WISE_APPLICATIONS}
              variables={{
                userId: userDetails ? userDetails.practitionerId : '',
                status: [EVENT_STATUS.REJECTED],
                locationIds: fieldAgentLocationId ? [fieldAgentLocationId] : []
              }}
            >
              {({
                loading,
                error,
                data
              }: {
                loading: any
                data?: any
                error?: any
              }) => {
                if (loading) {
                  return (
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'red'} />
                      )}
                      id={`navigation_${TAB_ID.requireUpdates}_loading`}
                      label={TAB_LABEL.requiresUpdate}
                      count={0}
                      isSelected={tabId === TAB_ID.requireUpdates}
                      onClick={() => {
                        props.goToFieldAgentHomeTab(TAB_ID.requireUpdates)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )
                }
                return (
                  <>
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'red'} />
                      )}
                      id={`navigation_${TAB_ID.requireUpdates}`}
                      label={TAB_LABEL.requiresUpdate}
                      count={data.searchEvents.totalItems}
                      isSelected={tabId === TAB_ID.requireUpdates}
                      onClick={() => {
                        props.goToFieldAgentHomeTab(TAB_ID.requireUpdates)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  </>
                )
              }}
            </Query>
          </NavigationGroup>
          {menuCollapse && (
            <NavigationGroup>{getSettingsAndLogout(props)}</NavigationGroup>
          )}
        </>
      ) : (
        <>
          {userDetails?.role &&
            USER_SCOPE[userDetails.role].includes(
              GROUP_ID.applicationGroup
            ) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(TAB_ID.inProgress) && (
                    <NavigationItem
                      icon={() => <LeftNavigationApplicationIcons />}
                      id={`navigation_${TAB_ID.inProgress}`}
                      label={TAB_LABEL.inProgress}
                      count={applicationCount.inProgress}
                      isSelected={tabId === TAB_ID.inProgress}
                      onClick={() => {
                        props.goToRegistrarHomeTab(TAB_ID.inProgress)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    TAB_ID.readyForReview
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'orange'} />
                      )}
                      id={`navigation_${TAB_ID.readyForReview}`}
                      label={TAB_LABEL.readyForReview}
                      count={applicationCount.readyForReview}
                      isSelected={tabId === TAB_ID.readyForReview}
                      onClick={() => {
                        props.goToRegistrarHomeTab(TAB_ID.readyForReview)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    TAB_ID.sentForUpdates
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'red'} />
                      )}
                      id={`navigation_${TAB_ID.sentForUpdates}`}
                      label={TAB_LABEL.sentForUpdates}
                      count={applicationCount.sentForUpdates}
                      isSelected={tabId === TAB_ID.sentForUpdates}
                      onClick={() => {
                        props.goToRegistrarHomeTab(TAB_ID.sentForUpdates)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    TAB_ID.sentForApproval
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'grey'} />
                      )}
                      id={`navigation_${TAB_ID.sentForApproval}`}
                      label={TAB_LABEL.sentForApproval}
                      count={applicationCount.sentForApproval}
                      isSelected={tabId === TAB_ID.sentForApproval}
                      onClick={() => {
                        props.goToRegistrarHomeTab(TAB_ID.sentForApproval)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                  <NavigationItem
                    icon={() => (
                      <LeftNavigationApplicationIcons color={'teal'} />
                    )}
                    id={`navigation_${TAB_ID.externalValidation}`}
                    label={TAB_LABEL.externalValidation}
                    count={applicationCount.externalValidation}
                    isSelected={tabId === TAB_ID.externalValidation}
                    onClick={() => {
                      props.goToRegistrarHomeTab(TAB_ID.externalValidation)
                      menuCollapse && menuCollapse()
                    }}
                  />
                )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    TAB_ID.readyToPrint
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <LeftNavigationApplicationIcons color={'green'} />
                      )}
                      id={`navigation_${TAB_ID.readyToPrint}`}
                      label={TAB_LABEL.readyToPrint}
                      count={applicationCount.readyToPrint}
                      isSelected={tabId === TAB_ID.readyToPrint}
                      onClick={() => {
                        props.goToRegistrarHomeTab(TAB_ID.readyToPrint)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
              </NavigationGroup>
            )}
          {userDetails?.role &&
            USER_SCOPE[userDetails.role].includes(GROUP_ID.menuGroup) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(TAB_ID.performance) && (
                    <NavigationItem
                      icon={() => (
                        <Activity stroke={'#595C5F'} height={15} width={15} />
                      )}
                      id={`navigation_${TAB_ID.performance}`}
                      label={TAB_LABEL.performance}
                      onClick={() =>
                        props.goToPerformanceViewAction(userDetails)
                      }
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === TAB_ID.performance
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(TAB_ID.team) && (
                    <NavigationItem
                      icon={() => (
                        <Users stroke={'#595C5F'} height={15} width={15} />
                      )}
                      id={`navigation_${TAB_ID.team}`}
                      label={TAB_LABEL.team}
                      onClick={() => props.goToTeamViewAction(userDetails)}
                      isSelected={
                        enableMenuSelection && activeMenuItem === TAB_ID.team
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(TAB_ID.config) && (
                    <>
                      <NavigationItem
                        icon={() => <Configuration />}
                        id={`navigation_${TAB_ID.config}_main`}
                        label={TAB_LABEL.configuration}
                        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                        isSelected={
                          enableMenuSelection &&
                          ConfigTab.includes(activeMenuItem)
                        }
                        expandableIcon={() =>
                          isConfigExpanded ||
                          ConfigTab.includes(activeMenuItem) ? (
                            <Expandable selected={true} />
                          ) : (
                            <Expandable />
                          )
                        }
                      />
                      {(isConfigExpanded ||
                        ConfigTab.includes(activeMenuItem)) && (
                        <>
                          <NavigationSubItem
                            label={TAB_LABEL.applicationSettings}
                            id={`navigation_${TAB_ID.application}`}
                            onClick={goToApplicationConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === TAB_ID.application
                            }
                          />
                          <NavigationSubItem
                            label={TAB_LABEL.certificatesConfiguration}
                            id={`navigation_${TAB_ID.certificates}`}
                            onClick={goToConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === TAB_ID.certificates
                            }
                          />
                        </>
                      )}
                    </>
                  )}
                {menuCollapse && getSettingsAndLogout(props)}
              </NavigationGroup>
            )}
        </>
      )}
    </LeftNavigation>
  )
}

const mapStateToProps: (state: IStoreState) => IStateProps = (state) => {
  return {
    draftApplications:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    applicationsReadyToSend: (
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus !==
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
    ).reverse(),
    workqueue: state.workqueueState.workqueue,
    storedApplications: state.applicationsState.applications,
    userDetails: getUserDetails(state),
    activeMenuItem: window.location.href.includes('performance')
      ? TAB_ID.performance
      : window.location.href.includes('team')
      ? TAB_ID.team
      : window.location.href.includes('application')
      ? TAB_ID.application
      : window.location.href.includes('settings')
      ? TAB_ID.settings
      : window.location.href.includes('certificate')
      ? TAB_ID.certificates
      : ''
  }
}

export const Navigation = connect<
  IStateProps,
  IDispatchProps,
  IProps,
  IStoreState
>(mapStateToProps, {
  goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
  goToRegistrarHomeTab,
  goToConfigAction: goToConfig,
  goToApplicationConfigAction: goToApplicationConfig,
  goToPerformanceViewAction: goToPerformanceView,
  goToTeamViewAction: goToTeamView,
  redirectToAuthentication,
  goToSettings
})(injectIntl(withTheme(withRouter(NavigationView))))
