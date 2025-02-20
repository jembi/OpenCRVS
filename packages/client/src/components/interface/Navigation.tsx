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
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { buttonMessages } from '@client/i18n/messages'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generatePerformanceHomeUrl
} from '@client/navigation'
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { storage } from '@client/storage'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import { IS_PROD_ENVIRONMENT } from '@client/utils/constants'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { EventType } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { IWorkqueue, updateRegistrarWorkqueue } from '@client/workqueue'
import { IStoreState } from '@opencrvs/client/src/store'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { NavigationSubItem } from '@opencrvs/components/lib/SideNavigation/NavigationSubItem'
import { omit } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { useNavigation } from '@client/hooks/useNavigation'
import {
  TAB_GROUPS,
  WORKQUEUE_TABS
} from '@client/components/interface/WorkQueueTabs'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'

const SCREEN_LOCK = 'screenLock'

interface ICount {
  inProgress?: number
  readyForReview?: number
  sentForReview?: number
  requiresUpdate?: number
  sentForUpdates?: number
  sentForApproval?: number
  externalValidation?: number
  readyToPrint?: number
  readyToIssue?: number
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
  loadWorkqueueStatuses?: boolean
}

interface IDispatchProps {
  redirectToAuthentication: typeof redirectToAuthentication
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  setAdvancedSearchParam: typeof setAdvancedSearchParam
}

interface IStateProps {
  draftDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: UserDetails | null
  advancedSearchParams: IAdvancedSearchParamState
  activeMenuItem: string
  workqueue: IWorkqueue
  offlineCountryConfiguration: IOfflineData
  storedDeclarations: IDeclaration[]
}

type IFullProps = IProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps &
  RouteComponentProps<{ className?: string }>

const getSettingsAndLogout = (props: IFullProps) => {
  const { intl, menuCollapse, activeMenuItem, redirectToAuthentication } = props
  return (
    <>
      <NavigationItem
        icon={() => <SettingsNavigation />}
        id={`navigation_${WORKQUEUE_TABS.settings}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.settings])}
        onClick={() => {
          props.router.navigate(routes.SETTINGS)

          menuCollapse && menuCollapse()
        }}
        isSelected={activeMenuItem === WORKQUEUE_TABS.settings}
      />
      <NavigationItem
        icon={() => <LogoutNavigation />}
        id={`navigation_${WORKQUEUE_TABS.logout}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.logout])}
        onClick={() => {
          storage.removeItem(SCREEN_LOCK)
          redirectToAuthentication()
        }}
      />
    </>
  )
}

const NavigationView = (props: IFullProps) => {
  const {
    intl,
    router,
    userDetails,
    advancedSearchParams,
    deselectAllTabs,
    enableMenuSelection = true,
    loadWorkqueueStatuses = true,
    activeMenuItem,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration,
    updateRegistrarWorkqueue,
    setAdvancedSearchParam,
    className
  } = props
  const tabId = deselectAllTabs
    ? ''
    : router?.match?.params?.tabId
    ? router.match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'

  const configTab: string[] = [WORKQUEUE_TABS.systems]
  const conmmunicationTab: string[] = [
    WORKQUEUE_TABS.informantNotification,
    WORKQUEUE_TABS.emailAllUsers
  ]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const [isCommunationExpanded, setIsCommunationExpanded] =
    React.useState(false)

  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )
  const runningVer = String(localStorage.getItem('running-version'))

  const isOnePrintInAdvanceOn = Object.values(EventType).some(
    (event: EventType) => {
      const upperCaseEvent = event.toUpperCase() as Uppercase<EventType>
      return offlineCountryConfiguration.config[upperCaseEvent].PRINT_IN_ADVANCE
    }
  )
  const showRegDashboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.REGISTRATIONS_DASHBOARD_URL)
  const showLeaderboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.LEADERBOARDS_DASHBOARD_URL)
  const showStatistics =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.STATISTICS_DASHBOARD_URL)

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10 // Page size shouldn't matter here as we're only interested in totals
    )
  }, [userDetails, updateRegistrarWorkqueue, loadWorkqueueStatuses])

  const declarationCount = {
    myDrafts: draftDeclarations.filter(
      (draft) =>
        draft.submissionStatus === SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    ).length,
    inProgress: !initialSyncDone
      ? 0
      : (filteredData.inProgressTab?.totalItems || 0) +
        (filteredData.notificationTab?.totalItems || 0),
    readyForReview: !initialSyncDone
      ? 0
      : filteredData.reviewTab?.totalItems || 0,
    requiresUpdate: !initialSyncDone
      ? 0
      : filteredData.rejectTab?.totalItems || 0,
    sentForApproval: !initialSyncDone
      ? 0
      : filteredData.approvalTab?.totalItems || 0,
    sentForReview: !initialSyncDone
      ? 0
      : filteredData.sentForReviewTab?.totalItems || 0,
    externalValidation:
      window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab?.totalItems || 0,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab?.totalItems || 0,
    readyToIssue: !initialSyncDone ? 0 : filteredData.issueTab?.totalItems || 0,
    outbox: storedDeclarations.filter((draft) =>
      (
        [
          ...ALLOWED_STATUS_FOR_RETRY,
          ...INPROGRESS_STATUS,
          SUBMISSION_STATUS.FAILED
        ] as SUBMISSION_STATUS[]
      ).includes(draft.submissionStatus as SUBMISSION_STATUS)
    ).length
  }

  const { routes: scopedRoutes } = useNavigation()
  const hasAccess = (name: string): boolean =>
    scopedRoutes.some(
      (x) => x.name === name || x.tabs.some((t) => t.name === name)
    )

  return (
    <LeftNavigation
      applicationName={offlineCountryConfiguration.config.APPLICATION_NAME}
      applicationVersion={runningVer}
      navigationWidth={navigationWidth}
      name={userInfo && userInfo.name}
      role={userInfo && userInfo.role}
      avatar={() => userInfo && userInfo.avatar}
      className={className}
    >
      {hasAccess(TAB_GROUPS.declarations) && (
        <NavigationGroup>
          {hasAccess(WORKQUEUE_TABS.myDrafts) && (
            <NavigationItem
              icon={() => <Icon name="FileDotted" />}
              id={`navigation_${WORKQUEUE_TABS.myDrafts}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.myDrafts]
              )}
              count={declarationCount.myDrafts}
              isSelected={tabId === WORKQUEUE_TABS.myDrafts}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.myDrafts
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.inProgress) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'purple'} />}
              id={`navigation_${WORKQUEUE_TABS.inProgress}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.inProgress]
              )}
              count={declarationCount.inProgress}
              isSelected={tabId === WORKQUEUE_TABS.inProgress}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.inProgress
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.sentForReview) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'orange'} />}
              id={`navigation_${WORKQUEUE_TABS.sentForReview}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.sentForReview]
              )}
              count={declarationCount.sentForReview}
              isSelected={tabId === WORKQUEUE_TABS.sentForReview}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.sentForReview
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.readyForReview) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'orange'} />}
              id={`navigation_${WORKQUEUE_TABS.readyForReview}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyForReview]
              )}
              count={declarationCount.readyForReview}
              isSelected={tabId === WORKQUEUE_TABS.readyForReview}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyForReview
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.requiresUpdate) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'red'} />}
              id={`navigation_${WORKQUEUE_TABS.requiresUpdate}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.requiresUpdate]
              )}
              count={declarationCount.requiresUpdate}
              isSelected={tabId === WORKQUEUE_TABS.requiresUpdate}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.requiresUpdate
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.sentForApproval) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'grey'} />}
              id={`navigation_${WORKQUEUE_TABS.sentForApproval}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.sentForApproval]
              )}
              count={declarationCount.sentForApproval}
              isSelected={tabId === WORKQUEUE_TABS.sentForApproval}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.sentForApproval
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE &&
            hasAccess(WORKQUEUE_TABS.externalValidation) && (
              <NavigationItem
                icon={() => <DeclarationIconSmall color={'teal'} />}
                id={`navigation_${WORKQUEUE_TABS.externalValidation}`}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.externalValidation]
                )}
                count={declarationCount.externalValidation}
                isSelected={tabId === WORKQUEUE_TABS.externalValidation}
                onClick={() => {
                  props.router.navigate(
                    generateGoToHomeTabUrl({
                      tabId: WORKQUEUE_TABS.externalValidation
                    })
                  )
                  menuCollapse && menuCollapse()
                }}
              />
            )}
          {hasAccess(WORKQUEUE_TABS.readyToPrint) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'green'} />}
              id={`navigation_${WORKQUEUE_TABS.readyToPrint}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyToPrint]
              )}
              count={declarationCount.readyToPrint}
              isSelected={tabId === WORKQUEUE_TABS.readyToPrint}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToPrint
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {isOnePrintInAdvanceOn && hasAccess(WORKQUEUE_TABS.readyToIssue) && (
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'teal'} />}
              id={`navigation_${WORKQUEUE_TABS.readyToIssue}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyToIssue]
              )}
              count={declarationCount.readyToIssue}
              isSelected={tabId === WORKQUEUE_TABS.readyToIssue}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToIssue
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
          {hasAccess(WORKQUEUE_TABS.outbox) && (
            <NavigationItem
              icon={() => <Icon name="PaperPlaneTilt" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.outbox}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.outbox]
              )}
              count={declarationCount.outbox}
              isSelected={tabId === WORKQUEUE_TABS.outbox}
              onClick={() => {
                props.router.navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.outbox
                  })
                )

                menuCollapse && menuCollapse()
              }}
            />
          )}
        </NavigationGroup>
      )}
      {hasAccess(TAB_GROUPS.organisations) && (
        <NavigationGroup>
          {userDetails && (
            <>
              {hasAccess(WORKQUEUE_TABS.organisation) && (
                <NavigationItem
                  icon={() => <Icon name="Buildings" size="medium" />}
                  id={`navigation_${WORKQUEUE_TABS.organisation}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.organisation]
                  )}
                  onClick={() =>
                    router.navigate(
                      formatUrl(routes.ORGANISATIONS_INDEX, {
                        locationId: '' // NOTE: Empty string is required
                      })
                    )
                  }
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.organisation
                  }
                />
              )}

              {hasAccess(WORKQUEUE_TABS.team) && (
                <NavigationItem
                  icon={() => <Icon name="Users" size="medium" />}
                  id={`navigation_${WORKQUEUE_TABS.team}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.team]
                  )}
                  onClick={() => {
                    if (userDetails && userDetails.primaryOffice) {
                      props.router.navigate({
                        pathname: routes.TEAM_USER_LIST,
                        search: stringify({
                          locationId: userDetails.primaryOffice.id
                        })
                      })
                    }
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.team
                  }
                />
              )}
            </>
          )}

          {hasAccess(WORKQUEUE_TABS.config) && (
            <>
              <NavigationItem
                icon={() => <Icon name="Compass" size="medium" />}
                id={`navigation_${WORKQUEUE_TABS.config}_main`}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.config]
                )}
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                isSelected={
                  enableMenuSelection && configTab.includes(activeMenuItem)
                }
                expandableIcon={() =>
                  isConfigExpanded || configTab.includes(activeMenuItem) ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
              />
              {(isConfigExpanded || configTab.includes(activeMenuItem)) && (
                <NavigationSubItem
                  id={`navigation_${WORKQUEUE_TABS.systems}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.systems]
                  )}
                  onClick={() => router.navigate(routes.SYSTEM_LIST)}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.systems
                  }
                />
              )}
            </>
          )}

          {hasAccess(WORKQUEUE_TABS.config) && (
            <>
              <NavigationItem
                icon={() => <Icon name="ChatCircle" size="medium" />}
                id={`navigation_${WORKQUEUE_TABS.communications}_main`}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.communications]
                )}
                onClick={() => setIsCommunationExpanded(!isCommunationExpanded)}
                isSelected={
                  enableMenuSelection &&
                  conmmunicationTab.includes(activeMenuItem)
                }
                expandableIcon={() =>
                  isCommunationExpanded ||
                  conmmunicationTab.includes(activeMenuItem) ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
              />
              {(isCommunationExpanded ||
                conmmunicationTab.includes(activeMenuItem)) && (
                <NavigationSubItem
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.emailAllUsers]
                  )}
                  id={`navigation_${WORKQUEUE_TABS.emailAllUsers}`}
                  onClick={() => router.navigate(routes.ALL_USER_EMAIL)}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.emailAllUsers
                  }
                />
              )}
            </>
          )}
        </NavigationGroup>
      )}
      {hasAccess(TAB_GROUPS.performance) && (
        <NavigationGroup>
          {
            <>
              {showRegDashboard && hasAccess(WORKQUEUE_TABS.dashboard) && (
                <NavigationItem
                  icon={() => <Icon name="ChartLine" size="medium" />}
                  label={intl.formatMessage(navigationMessages['dashboard'])}
                  onClick={() =>
                    router.navigate(routes.PERFORMANCE_DASHBOARD, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                  id={`navigation_${WORKQUEUE_TABS.dashboard}`}
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'dashboard'
                  }
                />
              )}
              {showStatistics && hasAccess(WORKQUEUE_TABS.statistics) && (
                <NavigationItem
                  icon={() => <Icon name="Activity" size="medium" />}
                  label={intl.formatMessage(navigationMessages['statistics'])}
                  onClick={() =>
                    router.navigate(routes.PERFORMANCE_STATISTICS, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                  id={`navigation_${WORKQUEUE_TABS.statistics}`}
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'statistics'
                  }
                />
              )}
              {showLeaderboard && hasAccess(WORKQUEUE_TABS.leaderboards) && (
                <NavigationItem
                  icon={() => <Icon name="Medal" size="medium" />}
                  label={intl.formatMessage(navigationMessages['leaderboards'])}
                  onClick={() =>
                    router.navigate(routes.PERFORMANCE_LEADER_BOARDS, {
                      state: { isNavigatedInsideApp: true }
                    })
                  }
                  id={`navigation_${WORKQUEUE_TABS.leaderboards}`}
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'leaderboards'
                  }
                />
              )}
              {userDetails && hasAccess(WORKQUEUE_TABS.performance) && (
                <NavigationItem
                  icon={() => <Icon name="ChartBar" size="medium" />}
                  label={intl.formatMessage(navigationMessages['performance'])}
                  onClick={() => {
                    props.router.navigate(
                      generatePerformanceHomeUrl({
                        locationId: userDetails.primaryOffice.id
                      })
                    )
                  }}
                  id={`navigation_${WORKQUEUE_TABS.performance}`}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.performance
                  }
                />
              )}
            </>
          }
          {hasAccess(WORKQUEUE_TABS.vsexports) && (
            <NavigationItem
              icon={() => <Icon name="Export" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.vsexports}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.vsexports]
              )}
              onClick={() => router.navigate(routes.VS_EXPORTS)}
              isSelected={
                enableMenuSelection &&
                activeMenuItem === WORKQUEUE_TABS.vsexports
              }
            />
          )}
        </NavigationGroup>
      )}

      <NavigationGroup>
        {userDetails?.searches && userDetails.searches.length > 0 ? (
          userDetails.searches.map((bookmarkResult) => {
            return (
              <NavigationItem
                key={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                icon={() => (
                  <Icon
                    name="Star"
                    color="yellow"
                    size="medium"
                    weight="fill"
                  ></Icon>
                )}
                id={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                label={bookmarkResult.name}
                disabled={
                  advancedSearchParams.searchId === bookmarkResult.searchId &&
                  props.router.location.pathname === ADVANCED_SEARCH_RESULT
                }
                onClick={() => {
                  const filteredParam = omit(
                    bookmarkResult.parameters,
                    '__typename'
                  ) as IAdvancedSearchParamState
                  setAdvancedSearchParam({
                    ...filteredParam,
                    searchId: bookmarkResult?.searchId,
                    bookmarkName: bookmarkResult?.name
                  })

                  router.navigate(routes.ADVANCED_SEARCH_RESULT)
                }}
                isSelected={
                  advancedSearchParams.searchId === bookmarkResult.searchId &&
                  props.router.location.pathname === ADVANCED_SEARCH_RESULT
                }
              />
            )
          })
        ) : (
          <></>
        )}
      </NavigationGroup>
      <NavigationGroup>
        {menuCollapse && getSettingsAndLogout(props)}
      </NavigationGroup>
    </LeftNavigation>
  )
}

const mapStateToProps: (state: IStoreState) => IStateProps = (state) => {
  return {
    offlineCountryConfiguration: getOfflineData(state),
    draftDeclarations:
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    workqueue: state.workqueueState.workqueue,
    storedDeclarations: state.declarationsState.declarations,
    userDetails: getUserDetails(state),
    advancedSearchParams: getAdvancedSearchParamsState(state),
    activeMenuItem: window.location.href.includes(WORKQUEUE_TABS.performance)
      ? WORKQUEUE_TABS.performance
      : window.location.href.endsWith(WORKQUEUE_TABS.vsexports)
      ? WORKQUEUE_TABS.vsexports
      : window.location.href.includes(WORKQUEUE_TABS.organisation)
      ? WORKQUEUE_TABS.organisation
      : window.location.href.includes(WORKQUEUE_TABS.team)
      ? WORKQUEUE_TABS.team
      : window.location.href.endsWith(WORKQUEUE_TABS.application)
      ? WORKQUEUE_TABS.application
      : window.location.href.endsWith(WORKQUEUE_TABS.settings)
      ? WORKQUEUE_TABS.settings
      : window.location.href.endsWith(WORKQUEUE_TABS.certificate)
      ? WORKQUEUE_TABS.certificate
      : window.location.href.endsWith(WORKQUEUE_TABS.systems)
      ? WORKQUEUE_TABS.systems
      : window.location.href.endsWith(WORKQUEUE_TABS.informantNotification)
      ? WORKQUEUE_TABS.informantNotification
      : window.location.href.endsWith(WORKQUEUE_TABS.emailAllUsers)
      ? WORKQUEUE_TABS.emailAllUsers
      : window.location.href.endsWith(WORKQUEUE_TABS.userRoles)
      ? WORKQUEUE_TABS.userRoles
      : ''
  }
}

export const Navigation = withRouter(
  connect<IStateProps, IDispatchProps, IProps, IStoreState>(mapStateToProps, {
    redirectToAuthentication,
    updateRegistrarWorkqueue,
    setAdvancedSearchParam
  })(injectIntl(NavigationView))
)

/** @deprecated since the introduction of `<Frame>` */
export const FixedNavigation = styled(Navigation)`
  position: fixed;
`
