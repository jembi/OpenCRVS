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
import { Header } from '@client/components/Header/Header'
import {
  updateRegistrarWorkqueue,
  updateWorkqueuePagination,
  selectWorkqueuePagination
} from '@client/workqueue'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import { generateGoToHomeTabUrl } from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import { getUserLocation } from '@client/utils/userUtils'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import { SYNC_WORKQUEUE_TIME } from '@client/utils/constants'
import { Toast } from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { SentForReview } from './sentForReview/SentForReview'
import { InProgress, SELECTOR_ID } from './inProgress/InProgress'
import { ReadyToPrint } from './readyToPrint/ReadyToPrint'
import { RequiresUpdate } from './requiresUpdate/RequiresUpdate'
import { ReadyForReview } from './readyForReview/ReadyForReview'
import { InExternalValidationTab } from './inExternalValidation/InExternalValidationTab'
import { Navigation } from '@client/components/interface/Navigation'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { Frame } from '@opencrvs/components/lib/Frame'
import { constantsMessages } from '@client/i18n/messages'
import { Outbox } from './outbox/Outbox'
import { ArrayElement } from '@client/SubmissionController'
import { ReadyToIssue } from './readyToIssue/ReadyToIssue'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import ProtectedComponent from '@client/components/ProtectedComponent'
import { SELECT_VITAL_EVENT } from '@client/navigation/routes'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { MyDrafts } from './myDrafts/MyDrafts'

const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

interface IDispatchProps {
  getOfflineData: typeof getOfflineData
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  updateWorkqueuePagination: typeof updateWorkqueuePagination
}

type IBaseOfficeHomeStateProps = ReturnType<typeof mapStateToProps>

interface IOfficeHomeState {
  showCertificateToast: boolean
  offlineResources: IOfflineData
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps &
  RouteComponentProps

const DECLARATION_WORKQUEUE_TABS = [
  WORKQUEUE_TABS.myDrafts,
  WORKQUEUE_TABS.inProgress,
  WORKQUEUE_TABS.sentForApproval,
  WORKQUEUE_TABS.sentForReview,
  WORKQUEUE_TABS.readyForReview,
  WORKQUEUE_TABS.requiresUpdate,
  WORKQUEUE_TABS.readyToPrint,
  WORKQUEUE_TABS.readyToIssue,
  WORKQUEUE_TABS.externalValidation
] as const

const WORKQUEUE_TABS_PAGINATION = {
  [WORKQUEUE_TABS.inProgress]: 'inProgressTab',
  [WORKQUEUE_TABS.sentForApproval]: 'approvalTab',
  [WORKQUEUE_TABS.sentForReview]: 'sentForReviewTab',
  [WORKQUEUE_TABS.readyForReview]: 'reviewTab',
  [WORKQUEUE_TABS.requiresUpdate]: 'rejectTab',
  [WORKQUEUE_TABS.readyToPrint]: 'printTab',
  [WORKQUEUE_TABS.readyToIssue]: 'issueTab',
  [WORKQUEUE_TABS.externalValidation]: 'externalValidationTab'
} as const

function isDeclarationWorkqueueTab(
  tabId: string
): tabId is ArrayElement<typeof DECLARATION_WORKQUEUE_TABS> {
  return DECLARATION_WORKQUEUE_TABS.includes(
    tabId as ArrayElement<typeof DECLARATION_WORKQUEUE_TABS>
  )
}

class OfficeHomeView extends React.Component<
  IOfficeHomeProps,
  IOfficeHomeState
> {
  pageSize = 10
  showPaginated = false
  interval: NodeJS.Timeout | undefined = undefined

  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      showCertificateToast: Boolean(
        this.props.declarations.filter(
          (item) => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      ),
      offlineResources: this.props.offlineResources
    }
  }

  updateWorkqueue() {
    this.props.updateRegistrarWorkqueue(
      this.props.userDetails?.practitionerId,
      this.pageSize
    )
  }

  syncWorkqueue() {
    setTimeout(() => this.updateWorkqueue(), SYNC_WORKQUEUE_TIME)
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      this.updateWorkqueue()
    }, 300000)
  }

  syncPageId() {
    const { tabId, selectorId, pageId, inProgressTab, notificationTab } =
      this.props

    if (isDeclarationWorkqueueTab(tabId)) {
      if (tabId === WORKQUEUE_TABS.inProgress) {
        if (
          selectorId === SELECTOR_ID.fieldAgentDrafts &&
          pageId !== inProgressTab
        ) {
          this.props.updateWorkqueuePagination({ inProgressTab: pageId })
          this.updateWorkqueue()
        } else if (
          selectorId === SELECTOR_ID.hospitalDrafts &&
          pageId !== notificationTab
        ) {
          this.props.updateWorkqueuePagination({
            notificationTab: pageId
          })
          this.updateWorkqueue()
        }
      } else if (
        tabId !== WORKQUEUE_TABS.myDrafts &&
        pageId !== this.props[WORKQUEUE_TABS_PAGINATION[tabId]]
      ) {
        this.props.updateWorkqueuePagination({
          [WORKQUEUE_TABS_PAGINATION[tabId]]: pageId
        })
        this.updateWorkqueue()
      }
    }
  }

  componentDidMount() {
    this.syncPageId()
    this.syncWorkqueue()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps: IOfficeHomeProps) {
    this.syncPageId()
    if (prevProps.tabId !== this.props.tabId) {
      this.updateWorkqueue()
    }
  }

  subtractDeclarationsWithStatus(count: number, status: string[]) {
    const outboxCount = this.props.storedDeclarations.filter(
      (app) => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }

  onPageChange = (newPageNumber: number) => {
    const { tabId, selectorId } = this.props

    if (isDeclarationWorkqueueTab(tabId)) {
      if (tabId === WORKQUEUE_TABS.inProgress) {
        this.props.router.navigate(
          generateGoToHomeTabUrl({
            tabId: WORKQUEUE_TABS.inProgress,
            selectorId: Object.values(SELECTOR_ID).includes(selectorId)
              ? selectorId
              : SELECTOR_ID.fieldAgentDrafts,
            pageId: newPageNumber
          })
        )
        return
      }

      this.props.router.navigate(
        generateGoToHomeTabUrl({
          tabId,
          pageId: newPageNumber
        })
      )
    }
  }

  getData = (
    draftCurrentPage: number,
    healthSystemCurrentPage: number,
    progressCurrentPage: number,
    reviewCurrentPage: number,
    sentForReviewCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    issueCurrentPage: number,
    externalValidationCurrentPage: number,
    requireUpdateCurrentPage: number
  ) => {
    const {
      workqueue,
      tabId,
      selectorId,
      storedDeclarations,
      offlineResources
    } = this.props
    const { loading, error, data } = workqueue
    const filteredData = filterProcessingDeclarationsFromQuery(
      data,
      storedDeclarations
    )

    const isOnePrintInAdvanceOn = Object.values(EventType).some(
      (event: EventType) => {
        const upperCaseEvent = event.toUpperCase() as Uppercase<EventType>
        return offlineResources.config[upperCaseEvent].PRINT_IN_ADVANCE
      }
    )

    return (
      <>
        {tabId === WORKQUEUE_TABS.myDrafts && (
          <MyDrafts
            currentPage={draftCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
          />
        )}
        {tabId === WORKQUEUE_TABS.inProgress && (
          <InProgress
            selectorId={selectorId}
            queryData={{
              inProgressData: filteredData.inProgressTab,
              notificationData: filteredData.notificationTab
            }}
            paginationId={{
              fieldAgentId: progressCurrentPage,
              healthSystemId: healthSystemCurrentPage
            }}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.readyForReview && (
          <ReadyForReview
            queryData={{
              data: filteredData.reviewTab
            }}
            paginationId={reviewCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.externalValidation &&
          window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && (
            <InExternalValidationTab
              queryData={{
                data: filteredData.externalValidationTab
              }}
              paginationId={externalValidationCurrentPage}
              pageSize={this.pageSize}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
        {tabId === WORKQUEUE_TABS.sentForApproval && (
          <SentForReview
            queryData={{
              data: filteredData.approvalTab
            }}
            paginationId={approvalCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.readyToPrint && (
          <ReadyToPrint
            queryData={{
              data: filteredData.printTab
            }}
            paginationId={printCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {isOnePrintInAdvanceOn && tabId === WORKQUEUE_TABS.readyToIssue && (
          <ReadyToIssue
            queryData={{
              data: filteredData.issueTab
            }}
            pageSize={this.pageSize}
            paginationId={issueCurrentPage}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.sentForReview && (
          <SentForReview
            queryData={{
              data: filteredData.sentForReviewTab
            }}
            paginationId={sentForReviewCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.requiresUpdate && (
          <RequiresUpdate
            queryData={{
              data: filteredData.rejectTab
            }}
            paginationId={requireUpdateCurrentPage}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {tabId === WORKQUEUE_TABS.outbox && <Outbox />}
      </>
    )
  }

  render() {
    const { intl } = this.props

    const {
      pageId,
      notificationTab,
      inProgressTab,
      reviewTab,
      sentForReviewTab,
      approvalTab,
      printTab,
      issueTab,
      externalValidationTab,
      rejectTab
    } = this.props

    return (
      <Frame
        header={
          <Header
            title={intl.formatMessage(navigationMessages[this.props.tabId])}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
        navigation={<Navigation loadWorkqueueStatuses={false} />}
      >
        {this.getData(
          pageId,
          notificationTab,
          inProgressTab,
          reviewTab,
          sentForReviewTab,
          approvalTab,
          printTab,
          issueTab,
          externalValidationTab,
          rejectTab
        )}

        <ProtectedComponent
          scopes={[
            SCOPES.RECORD_DECLARE_BIRTH,
            SCOPES.RECORD_DECLARE_DEATH,
            SCOPES.RECORD_DECLARE_MARRIAGE,
            SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION,
            SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION,
            SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
          ]}
        >
          <FABContainer>
            <Link to={SELECT_VITAL_EVENT}>
              <FloatingActionButton
                id="new_event_declaration"
                icon={() => <PlusTransparentWhite />}
              />
            </Link>
          </FABContainer>
        </ProtectedComponent>

        {this.state.showCertificateToast && (
          <Toast
            id="print-cert-notification"
            type="success"
            onClose={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatMessage(certificateMessage.toastMessage)}
          </Toast>
        )}
      </Frame>
    )
  }
}

function mapStateToProps(state: IStoreState, props: RouteComponentProps) {
  const match = props.router.match
  const userDetails = getUserDetails(state)
  const userLocationId = (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  const pageId =
    (match.params.pageId && Number.parseInt(match.params.pageId)) ||
    (match.params.selectorId && Number.parseInt(match.params.selectorId)) ||
    1

  return {
    offlineResources: getOfflineData(state),
    declarations: state.declarationsState.declarations,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    userLocationId,
    tabId:
      (match && match.params && match.params.tabId) ||
      WORKQUEUE_TABS.inProgress,
    selectorId: (match && match.params && match.params.selectorId) || '',
    pageId,
    storedDeclarations: state.declarationsState.declarations,
    drafts:
      (
        state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )
      ).reverse() || [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    userDetails,
    ...selectWorkqueuePagination(state)
  }
}

export const OfficeHome = withRouter(
  connect<
    IBaseOfficeHomeStateProps,
    IDispatchProps,
    RouteComponentProps,
    IStoreState
  >(mapStateToProps, {
    getOfflineData,
    updateRegistrarWorkqueue,
    updateWorkqueuePagination
  })(injectIntl(OfficeHomeView))
)
