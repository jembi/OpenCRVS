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
import { Header } from '@client/components/Header/Header'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { Query } from '@client/components/Query'
import {
  DOWNLOAD_STATUS,
  getProcessingDeclarationIds,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  errorMessages
} from '@client/i18n/messages'
import { messages as registrarHomeMessages } from '@client/i18n/messages/views/registrarHome'
import { messages as rejectMessages } from '@client/i18n/messages/views/reject'
import { messages } from '@client/i18n/messages/views/search'
import {
  formatUrl,
  generateGoToPageUrl,
  generateIssueCertificateUrl,
  generatePrintCertificateUrl
} from '@client/navigation'
import {
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { SEARCH_EVENTS } from '@client/search/queries'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { SEARCH_RESULT_SORT } from '@client/utils/constants'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { SearchEventsQuery } from '@client/utils/gateway'
import { getUserLocation, UserDetails } from '@client/utils/userUtils'
import { ITheme } from '@opencrvs/components/lib/theme'
import styled, { withTheme } from 'styled-components'
import { Frame } from '@opencrvs/components/lib/Frame'
import {
  ColumnContentAlignment,
  COLUMNS,
  IAction,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { Navigation } from '@client/components/interface/Navigation'
import React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { convertToMSISDN } from '@client/forms/utils'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  IconWithName,
  IconWithNameEvent,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { SearchCriteria } from '@client/utils/referenceApi'
import { Text } from '@opencrvs/components'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import * as routes from '@client/navigation/routes'
import { useLocation, useNavigate } from 'react-router-dom'

const ErrorText = styled(Text)`
  text-align: center;
  margin-top: 100px;
`

const ToolTipContainer = styled.span`
  text-align: center;
`

export function getRejectionReasonDisplayValue(reason: string) {
  switch (reason.toLowerCase()) {
    case 'duplicate':
      return rejectMessages.rejectionReasonDuplicate
    case 'misspelling':
      return rejectMessages.rejectionReasonMisspelling
    case 'missing_supporting_doc':
      return rejectMessages.rejectionReasonMissingSupportingDoc
    case 'other':
      return rejectMessages.rejectionReasonOther
    default:
      return rejectMessages.rejectionReasonOther
  }
}

interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope[] | null
  userDetails: UserDetails | null
  outboxDeclarations: IDeclaration[]
}

type ISearchResultProps = IntlShapeProps & IBaseSearchResultProps

type QueryData = SearchEventsQuery['searchEvents']

function SearchResultView(props: ISearchResultProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const { width } = useWindowSize()

  const getColumns = () => {
    if (width > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 35,
          label: props.intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 20,
          key: COLUMNS.EVENT
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
          width: 20,
          key: COLUMNS.DATE_OF_EVENT
        },
        {
          width: 25,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    } else {
      return [
        {
          label: props.intl.formatMessage(constantsMessages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  function userHasRegisterScope() {
    return props.scope && props.scope.includes(SCOPES.RECORD_REGISTER)
  }

  function userHasValidateScope() {
    const validateScopes = [
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES
    ] as Scope[]

    return (
      props.scope && props.scope.some((scope) => validateScopes.includes(scope))
    )
  }

  function hasIssueScope() {
    return props.scope?.includes(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES)
  }

  function hasPrintScope() {
    return props.scope?.includes(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES)
  }

  function canSearchAnywhere() {
    const searchScopes: Scope[] = [
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE
    ]
    return props.scope?.some((scope) => searchScopes.includes(scope))
  }

  const transformSearchContent = (data: QueryData) => {
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, props.intl)

    const processingDeclarationIds = getProcessingDeclarationIds(
      props.outboxDeclarations
    )

    return transformedData
      .filter(({ id }) => !processingDeclarationIds.includes(id))
      .map((reg, index) => {
        const foundDeclaration = props.outboxDeclarations.find(
          (declaration) => declaration.id === reg.id
        )
        const actions: IAction[] = []
        const downloadStatus =
          (foundDeclaration && foundDeclaration.downloadStatus) || undefined

        const declarationIsRequestedCorrection =
          reg.declarationStatus === 'REQUESTED_CORRECTION'
        const declarationIsRegistered = reg.declarationStatus === 'REGISTERED'
        const declarationIsCertified = reg.declarationStatus === 'CERTIFIED'
        const declarationIsRejected = reg.declarationStatus === 'REJECTED'
        const declarationIsValidated = reg.declarationStatus === 'VALIDATED'
        const declarationIsInProgress = reg.declarationStatus === 'IN_PROGRESS'
        const declarationIsIssued = reg.declarationStatus === 'ISSUED'
        const isDeclared = reg.declarationStatus === 'DECLARED'
        const declarationIsCorrectionRequested =
          reg.declarationStatus === 'CORRECTION_REQUESTED'
        const isDuplicate =
          reg.duplicates &&
          reg.duplicates.length > 0 &&
          reg.declarationStatus !== SUBMISSION_STATUS.CERTIFIED &&
          reg.declarationStatus !== SUBMISSION_STATUS.REGISTERED
        const { intl, userDetails } = props

        const search = location.search
        const params = new URLSearchParams(search)
        const [searchText, searchType] = [
          params.get('searchText'),
          params.get('searchType')
        ]
        const isDeclarationReviewableByRegistrar =
          declarationIsRejected ||
          declarationIsValidated ||
          declarationIsCorrectionRequested ||
          isDeclared ||
          declarationIsInProgress

        const isDeclarationReviewableByRegAgent =
          isDeclared || declarationIsInProgress || declarationIsRejected

        const shouldShowReviewButton =
          (userHasRegisterScope() && isDeclarationReviewableByRegistrar) ||
          (userHasValidateScope() && isDeclarationReviewableByRegAgent)
        if (width > props.theme.grid.breakpoints.lg) {
          if (
            (declarationIsRegistered || declarationIsIssued) &&
            hasPrintScope()
          ) {
            actions.push({
              label: props.intl.formatMessage(buttonMessages.print),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()

                navigate(
                  generatePrintCertificateUrl({
                    registrationId: reg.id,
                    event: reg.event
                  })
                )
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (declarationIsCertified && hasIssueScope()) {
            actions.push({
              label: props.intl.formatMessage(buttonMessages.issue),
              handler: (
                e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
              ) => {
                e && e.stopPropagation()

                navigate(
                  generateIssueCertificateUrl({ registrationId: reg.id })
                )
              },
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          } else if (shouldShowReviewButton) {
            actions.push({
              label:
                declarationIsRejected || declarationIsInProgress
                  ? props.intl.formatMessage(constantsMessages.update)
                  : props.intl.formatMessage(constantsMessages.review),
              handler: () =>
                navigate(
                  generateGoToPageUrl({
                    pageRoute:
                      reg.declarationStatus === 'CORRECTION_REQUESTED'
                        ? REVIEW_CORRECTION
                        : REVIEW_EVENT_PARENT_FORM_PAGE,
                    declarationId: reg.id,
                    pageId: 'review',
                    event: reg.event.toLowerCase()
                  })
                ),
              disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
            })
          }
        }
        actions.push({
          actionComponent: (
            <DownloadButton
              key={reg.id}
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                assignment: reg.assignment ?? undefined,
                refetchQueries: [
                  {
                    query: SEARCH_EVENTS,
                    variables: {
                      advancedSearchParameters: {
                        trackingId:
                          searchType === SearchCriteria.TRACKING_ID
                            ? searchText
                            : '',
                        nationalId:
                          searchType === SearchCriteria.NATIONAL_ID
                            ? searchText
                            : '',
                        registrationNumber:
                          searchType === SearchCriteria.REGISTRATION_NUMBER
                            ? searchText
                            : '',
                        contactNumber:
                          searchType === SearchCriteria.PHONE_NUMBER
                            ? convertToMSISDN(
                                searchText!,
                                window.config.COUNTRY
                              )
                            : '',
                        name:
                          searchType === SearchCriteria.NAME ? searchText : '',
                        declarationLocationId:
                          !canSearchAnywhere() && userDetails
                            ? getUserLocation(userDetails).id
                            : ''
                      },
                      sort: SEARCH_RESULT_SORT
                    }
                  }
                ],
                action:
                  ((declarationIsRegistered || declarationIsCertified) &&
                    DownloadAction.LOAD_CERTIFICATE_DECLARATION) ||
                  (declarationIsRequestedCorrection &&
                    DownloadAction.LOAD_REQUESTED_CORRECTION_DECLARATION) ||
                  DownloadAction.LOAD_REVIEW_DECLARATION
              }}
              status={downloadStatus as DOWNLOAD_STATUS}
              declarationStatus={reg.declarationStatus as SUBMISSION_STATUS}
            />
          )
        })
        const event =
          (reg.event &&
            intl.formatMessage(
              dynamicConstantsMessages[reg.event.toLowerCase()]
            )) ||
          ''
        const dateOfEvent =
          reg.dateOfEvent && formattedDuration(new Date(reg.dateOfEvent))
        const isValidatedOnReview =
          reg.declarationStatus === SUBMISSION_STATUS.VALIDATED &&
          userHasRegisterScope()
            ? true
            : false
        const isArchived = reg.declarationStatus === SUBMISSION_STATUS.ARCHIVED
        const NameComponent = reg.name ? (
          <NameContainer
            id={`name_${index}`}
            onClick={() =>
              navigate(
                formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                  tab: 'search',
                  declarationId: reg.id
                })
              )
            }
          >
            {reg.name}
          </NameContainer>
        ) : (
          <NoNameContainer
            id={`name_${index}`}
            onClick={() =>
              navigate(
                formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                  tab: 'search',
                  declarationId: reg.id
                })
              )
            }
          >
            {intl.formatMessage(constantsMessages.noNameProvided)}
          </NoNameContainer>
        )
        return {
          ...reg,
          event,
          name: reg.name && reg.name.toLowerCase(),
          iconWithName: (
            <IconWithName
              status={reg.declarationStatus}
              name={NameComponent}
              isValidatedOnReview={isValidatedOnReview}
              isDuplicate={isDuplicate}
              isArchived={isArchived}
            />
          ),
          iconWithNameEvent: (
            <IconWithNameEvent
              status={reg.declarationStatus}
              name={NameComponent}
              event={event}
              isDuplicate={isDuplicate}
              isValidatedOnReview={isValidatedOnReview}
              isArchived={isArchived}
            />
          ),
          dateOfEvent,
          actions
        }
      })
  }

  const { intl, userDetails } = props
  const search = location.search
  const params = new URLSearchParams(search)
  const [searchText, searchType] = [
    params.get('searchText'),
    params.get('searchType')
  ]
  return (
    <Frame
      header={
        <Header
          searchText={searchText!}
          selectedSearchType={searchType!}
          mobileSearchBar={true}
          enableMenuSelection={false}
        />
      }
      navigation={<Navigation />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {searchText && searchType && (
        <Query<SearchEventsQuery>
          query={SEARCH_EVENTS}
          variables={{
            advancedSearchParameters: {
              trackingId:
                searchType === SearchCriteria.TRACKING_ID ? searchText : '',
              nationalId:
                searchType === SearchCriteria.NATIONAL_ID ? searchText : '',
              registrationNumber:
                searchType === SearchCriteria.REGISTRATION_NUMBER
                  ? searchText
                  : '',
              contactNumber:
                searchType === SearchCriteria.PHONE_NUMBER
                  ? convertToMSISDN(searchText, window.config.COUNTRY)
                  : '',
              contactEmail:
                searchType === SearchCriteria.EMAIL ? searchText : '',
              name: searchType === SearchCriteria.NAME ? searchText : ''
            },
            sort: SEARCH_RESULT_SORT
          }}
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data }) => {
            const total = loading
              ? -1
              : data?.searchEvents?.results?.length || 0
            return (
              <WQContentWrapper
                title={intl.formatMessage(messages.searchResultFor, {
                  param: searchText
                })}
                isMobileSize={width < props.theme.grid.breakpoints.lg}
                noResultText={intl.formatMessage(messages.noResultFor, {
                  param: searchText
                })}
                noContent={total < 1 && !loading}
              >
                {loading ? (
                  <div id="search_loader">
                    <LoadingIndicator loading={true} />
                  </div>
                ) : error ? (
                  <ErrorText
                    id="search-result-error-text"
                    element="p"
                    variant="h4"
                  >
                    {intl.formatMessage(errorMessages.queryError)}
                  </ErrorText>
                ) : (
                  data?.searchEvents &&
                  total > 0 && (
                    <>
                      <ReactTooltip id="validateTooltip">
                        <ToolTipContainer>
                          {props.intl.formatMessage(
                            registrarHomeMessages.validatedDeclarationTooltipForRegistrar
                          )}
                        </ToolTipContainer>
                      </ReactTooltip>
                      <Workqueue
                        content={transformSearchContent(data.searchEvents)}
                        columns={getColumns()}
                        noResultText={intl.formatMessage(
                          constantsMessages.noResults
                        )}
                        hideLastBorder={true}
                      />
                    </>
                  )
                )}
              </WQContentWrapper>
            )
          }}
        </Query>
      )}
    </Frame>
  )
}
export const SearchResult = connect((state: IStoreState) => ({
  language: state.i18n.language,
  scope: getScope(state),
  userDetails: getUserDetails(state),
  outboxDeclarations: state.declarationsState.declarations
}))(injectIntl(withTheme(SearchResultView)))
