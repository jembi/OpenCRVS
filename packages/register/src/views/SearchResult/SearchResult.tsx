import { SecondaryButton } from '@opencrvs/components/lib/buttons'
import {
  Duplicate,
  Edit,
  StatusCertified,
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ActionPage,
  ISearchInputProps,
  ISelectGroupValue,
  ListItem,
  ListItemExpansion,
  SearchInput,
  Spinner,
  Loader
} from '@opencrvs/components/lib/interface'
import { DataTable } from '@opencrvs/components/lib/interface/DataTable'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLComment,
  GQLDeathRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import * as Sentry from '@sentry/browser'
import * as moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IViewHeadingProps } from 'src/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToSearchResult
} from 'src/navigation'
import { REVIEW_EVENT_PARENT_FORM_TAB } from 'src/navigation/routes'
import { getScope, getUserDetails } from 'src/profile/profileSelectors'
import { messages as rejectionMessages } from 'src/review/reject-registration'
import { messages } from 'src/search/messages'
import { SEARCH_EVENTS } from 'src/search/queries'
import { transformData } from 'src/search/transformer'
import { IStoreState } from 'src/store'
import { Scope } from 'src/utils/authUtils'
import {
  CERTIFICATE_DATE_FORMAT,
  DECLARED,
  LANG_EN,
  LOCAL_DATE_FORMAT,
  REJECTED,
  REJECT_REASON,
  REJECT_COMMENTS
} from 'src/utils/constants'
import {
  createNamesMap,
  extractCommentFragmentValue
} from 'src/utils/data-formatting'
import { formatLongDate } from 'src/utils/date-formatting'
import { IGQLLocation, IIdentifier, IUserDetails } from 'src/utils/userUtils'
import styled, { withTheme } from 'styled-components'
import { goToTab as goToTabAction } from '../../navigation'
import { FETCH_REGISTRATION_BY_COMPOSITION } from './queries'

const ListItemExpansionSpinner = styled(Spinner)`
  width: 70px;
  height: 70px;
  top: 0px !important;
`
const ExpansionSpinnerContainer = styled.div`
  min-height: 70px;
  min-width: 70px;
  display: flex;
  justify-content: center;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

const Container = styled.div`
  margin: 35px 250px 0px 250px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 20px;
    margin-right: 20px;
  }
`
const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  margin-right: 3px;
`
const StyledValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  text-transform: capitalize !important;
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 1.3em;
  & span:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.copyAlpha80};
    margin-right: 10px;
    padding-right: 10px;
  }
`
export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
const SearchResultText = styled.div`
  left: 268px;
  margin-top: 30px;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0.4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
    margin-top: 24px;
  }
`
const TotalResultText = styled.div`
  left: 268px;
  margin-top: 6px;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 12px;
  font-weight: bold;
  line-height: 24px;
  letter-spacing: 0.4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    left: 24px;
  }
`
function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

function ValuesWithSeparator(props: { strings: string[] }): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => (
        <span key={index}>{value}</span>
      ))}
    </ValueContainer>
  )
}

function formatRoleCode(str: string) {
  const sections = str.split('_')
  const formattedString: string[] = []
  sections.map(section => {
    section = section.charAt(0) + section.slice(1).toLowerCase()
    formattedString.push(section)
  })

  return formattedString.join(' ')
}

export function getRejectionReasonDisplayValue(reason: string) {
  switch (reason.toLowerCase()) {
    case 'duplicate':
      return rejectionMessages.rejectionReasonDuplicate
    case 'misspelling':
      return rejectionMessages.rejectionReasonMisspelling
    case 'missing_supporting_doc':
      return rejectionMessages.rejectionReasonMissingSupportingDoc
    case 'other':
      return rejectionMessages.rejectionReasonOther
    default:
      return rejectionMessages.rejectionReasonOther
  }
}

const ExpansionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`
const ExpansionContentContainer = styled.div`
  flex: 1;
  margin-left: 10px;
`

const StyledSecondaryButton = styled(SecondaryButton)`
  border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  color: ${({ theme }) => theme.colors.primary} !important;
  font-weight: bold;
  svg {
    margin-right: 15px;
  }
  &:hover {
    background: inherit;
    border: solid 1px ${({ theme }) => theme.colors.disabledButton};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`
const StatusIcon = styled.div`
  margin-top: 3px;
`
interface IBaseSearchResultProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  goToSearchResult: typeof goToSearchResult
}

interface IMatchParams {
  searchText: string
}

type ISearchResultProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseSearchResultProps &
  RouteComponentProps<IMatchParams>

interface ISearchResultState {
  printCertificateModalVisible: boolean
  regId: string | null
  currentPage: number
  sortBy?: string
  eventType?: string
  status?: string
  searchContent?: string
}
export class SearchResultView extends React.Component<
  ISearchResultProps,
  ISearchResultState
> {
  state = {
    printCertificateModalVisible: false,
    regId: null,
    currentPage: 1,
    sortBy: 'asc',
    eventType: '',
    status: '',
    searchContent: ''
  }
  pageSize = 10

  getDeclarationStatusIcon = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIcon>
            <StatusCertified />
          </StatusIcon>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  getDeclarationStatusLabel = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return this.props.intl.formatMessage(messages.application)
      case 'REGISTERED':
        return this.props.intl.formatMessage(messages.registered)
      case 'REJECTED':
        return this.props.intl.formatMessage(messages.rejected)
      case 'CERTIFIED':
        return this.props.intl.formatMessage(messages.collected)
      default:
        return this.props.intl.formatMessage(messages.application)
    }
  }

  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'DECLARED':
        return messages.workflowStatusDateApplication
      case 'REGISTERED':
        return messages.workflowStatusDateRegistered
      case 'REJECTED':
        return messages.workflowStatusDateRejected
      case 'CERTIFIED':
        return messages.workflowStatusDateCollected
      default:
        return messages.workflowStatusDateApplication
    }
  }

  getEventLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BIRTH':
        return this.props.intl.formatMessage(messages.filtersBirth)
      case 'DEATH':
        return this.props.intl.formatMessage(messages.filtersDeath)
      default:
        return this.props.intl.formatMessage(messages.filtersBirth)
    }
  }

  transformDataToTaskHistory = (data: GQLQuery) => {
    const { locale } = this.props.intl
    const registration =
      data && data.fetchRegistration && data.fetchRegistration.registration
    const deathReg = data && (data.fetchRegistration as GQLDeathRegistration)
    const informant = deathReg && deathReg.informant
    const contactInfo =
      informant &&
      informant.individual &&
      informant.individual.telecom &&
      informant.individual.telecom[0]

    if (!registration || !registration.status) {
      return []
    }

    return registration.status.map((status, index) => {
      const certificate =
        registration.certificates && registration.certificates[index]
      const collector = certificate && certificate.collector

      return {
        type: status && status.type,
        practitionerName:
          (status &&
            status.user &&
            (createNamesMap(status.user.name as GQLHumanName[])[
              this.props.language
            ] as string)) ||
          (status &&
            status.user &&
            (createNamesMap(status.user.name as GQLHumanName[])[
              ''
            ] as string)) ||
          '',
        timestamp: status && formatLongDate(status.timestamp, locale),
        practitionerRole:
          status && status.user && status.user.role
            ? this.props.intl.formatMessage(
                messages[status.user.role as string]
              )
            : '',
        officeName:
          locale === LANG_EN
            ? status && status.office && status.office.name
            : status && status.office && status.office.alias,
        collectorName:
          (collector &&
            collector.individual &&
            (createNamesMap(collector.individual.name as GQLHumanName[])[
              this.props.language
            ] as string)) ||
          (collector &&
            collector.individual &&
            (createNamesMap(collector.individual.name as GQLHumanName[])[
              LANG_EN
            ] as string)) ||
          '',
        collectorType: collector && collector.relationship,
        rejectReasons:
          (status &&
            status.type === REJECTED &&
            extractCommentFragmentValue(
              status.comments as GQLComment[],
              REJECT_REASON
            )) ||
          '',
        rejectComments:
          (status &&
            status.type === REJECTED &&
            extractCommentFragmentValue(
              status.comments as GQLComment[],
              REJECT_COMMENTS
            )) ||
          '',
        informantContactNumber: contactInfo && contactInfo.value
      }
    })
  }

  renderExpansionContent = (id: string): JSX.Element => {
    return (
      <>
        <Query
          query={FETCH_REGISTRATION_BY_COMPOSITION}
          variables={{
            id
          }}
        >
          {({ loading, error, data }) => {
            const { intl, language } = this.props
            moment.locale(language)
            if (error) {
              Sentry.captureException(error)
            } else if (loading) {
              return (
                <ExpansionSpinnerContainer>
                  <ListItemExpansionSpinner
                    id="list-expansion-spinner"
                    baseColor={this.props.theme.colors.background}
                  />
                </ExpansionSpinnerContainer>
              )
            }

            const statusData = this.transformDataToTaskHistory(data)

            return statusData
              .map((status, index) => {
                const {
                  practitionerName,
                  practitionerRole,
                  collectorName,
                  collectorType,
                  rejectReasons,
                  rejectComments,
                  informantContactNumber
                } = status
                const type = status.type as string
                const officeName = status.officeName as string
                const timestamp = moment(
                  status.timestamp as string,
                  LOCAL_DATE_FORMAT
                ).format(CERTIFICATE_DATE_FORMAT)
                const collectorInfo = collectorName + ' (' + collectorType + ')'

                return (
                  <ExpansionContainer key={index} id={type + '-' + index}>
                    {this.getDeclarationStatusIcon(type)}
                    <ExpansionContentContainer>
                      <LabelValue
                        label={intl.formatMessage(
                          this.getWorkflowDateLabel(type)
                        )}
                        value={timestamp}
                      />
                      {type === DECLARED && informantContactNumber && (
                        <LabelValue
                          label={intl.formatMessage(messages.informantContact)}
                          value={informantContactNumber}
                        />
                      )}
                      {collectorType && (
                        <LabelValue
                          label={intl.formatMessage(messages.collectedBy)}
                          value={collectorInfo}
                        />
                      )}
                      <ValueContainer>
                        <StyledLabel>
                          {this.props.intl.formatMessage(
                            collectorType
                              ? messages.issuedBy
                              : messages.workflowPractitionerLabel
                          )}
                          :
                        </StyledLabel>
                        <ValuesWithSeparator
                          strings={[
                            practitionerName,
                            formatRoleCode(practitionerRole),
                            officeName
                          ]}
                        />
                      </ValueContainer>
                      {rejectReasons && (
                        <>
                          <LabelValue
                            label={intl.formatMessage(messages.rejectReason)}
                            value={rejectReasons}
                          />
                          <LabelValue
                            label={intl.formatMessage(messages.rejectComments)}
                            value={rejectComments}
                          />
                        </>
                      )}
                    </ExpansionContentContainer>
                  </ExpansionContainer>
                )
              })
              .reverse()
          }}
        </Query>
      </>
    )
  }

  renderCell = (
    item: { [key: string]: string & Array<{ [key: string]: string }> },
    key: number
  ): JSX.Element => {
    const applicationIsRegistered = item.declaration_status === 'REGISTERED'
    const applicationIsCertified = item.declaration_status === 'CERTIFIED'
    const applicationIsRejected = item.declaration_status === 'REJECTED'
    const info = []
    const status = []
    const icons = []

    info.push({
      label: this.props.intl.formatMessage(messages.listItemName),
      value: item.name
    })
    if (item.dob) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemDob),
        value: item.dob
      })
    }
    if (item.dod) {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemDod),
        value: item.dod
      })
    }
    if (applicationIsRegistered || applicationIsCertified) {
      info.push({
        label: this.props.intl.formatMessage(
          messages.listItemEventRegistrationNumber,
          { event: item.event.toLowerCase() }
        ),
        value: item.registrationNumber
      })
    } else {
      info.push({
        label: this.props.intl.formatMessage(messages.listItemTrackingNumber),
        value: item.tracking_id
      })
    }

    status.push({
      icon: <StatusGray />,
      label: this.getEventLabel(item.event)
    })
    status.push({
      icon: this.getDeclarationStatusIcon(item.declaration_status),
      label: this.getDeclarationStatusLabel(item.declaration_status)
    })

    if (applicationIsRejected && item.rejection_reasons) {
      const reasons = item.rejection_reasons.split(',')
      const rejectComment = item.rejection_comment

      info.push({
        label: this.props.intl.formatMessage(
          messages.listItemRejectionReasonLabel
        ),
        value:
          reasons &&
          reasons
            .reduce(
              (prev, curr) => [
                ...prev,
                this.props.intl.formatMessage(
                  getRejectionReasonDisplayValue(curr)
                )
              ],
              []
            )
            .join(', ')
      })

      if (rejectComment) {
        info.push({
          label: this.props.intl.formatMessage(messages.listItemCommentLabel),
          value: rejectComment
        })
      }
    }

    if (item.duplicates && item.duplicates.length > 0) {
      icons.push(<Duplicate />)
    }

    const listItemActions = []

    const expansionActions: JSX.Element[] = []
    if (this.userHasCertifyScope()) {
      if (applicationIsRegistered || applicationIsCertified) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.print),
          handler: () => this.props.goToPrintCertificate(item.id, item.event)
        })
      }
    }

    if (this.userHasRegisterScope()) {
      if (
        !(item.duplicates && item.duplicates.length > 0) &&
        !applicationIsRegistered &&
        !applicationIsRejected &&
        !applicationIsCertified
      ) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.review),
          handler: () =>
            this.props.gotoTab(
              REVIEW_EVENT_PARENT_FORM_TAB,
              item.id,
              'review',
              item.event.toLowerCase()
            )
        })
      } else if (applicationIsRejected) {
        listItemActions.push({
          label: this.props.intl.formatMessage(messages.reject),
          handler: () =>
            this.props.gotoTab(
              REVIEW_EVENT_PARENT_FORM_TAB,
              item.id,
              'review',
              item.event.toLowerCase()
            )
        })
      }
    }

    if (
      item.duplicates &&
      item.duplicates.length > 0 &&
      !applicationIsRegistered &&
      !applicationIsRejected
    ) {
      listItemActions.push({
        label: this.props.intl.formatMessage(messages.reviewDuplicates),
        handler: () => this.props.goToReviewDuplicate(item.id)
      })
    }
    if (applicationIsRegistered) {
      expansionActions.push(
        <StyledSecondaryButton
          id={`editBtn_${item.tracking_id}`}
          disabled={true}
        >
          <Edit />
          {this.props.intl.formatMessage(messages.EditBtnText)}
        </StyledSecondaryButton>
      )
    }

    return (
      <ListItem
        index={key}
        infoItems={info}
        statusItems={status}
        icons={icons}
        key={key}
        itemData={{}}
        actions={listItemActions}
        isBoxShadow={true}
        isItemFullHeight={true}
        expandedCellRenderer={() => (
          <ListItemExpansion>
            {this.renderExpansionContent(item.id)}
          </ListItemExpansion>
        )}
      />
    )
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasCertifyScope() {
    return this.props.scope && this.props.scope.includes('certify')
  }

  getLocalLocationId() {
    const area = this.props.userDetails && this.props.userDetails.catchmentArea
    const identifier =
      area &&
      area.find((location: IGQLLocation) => {
        return (
          (location.identifier &&
            location.identifier.find((areaIdentifier: IIdentifier) => {
              return (
                areaIdentifier.system.endsWith('jurisdiction-type') &&
                areaIdentifier.value === 'UNION'
              )
            })) !== undefined
        )
      })

    return identifier && identifier.id
  }
  onPageChange = async (newPageNumber: number) => {
    this.setState({ currentPage: newPageNumber })
  }
  onSortChange = (sortBy: string) => {
    this.setState({ sortBy })
  }
  onFilterChange = (
    value: ISelectGroupValue,
    changedValue: ISelectGroupValue
  ) => {
    this.setState({
      eventType: this.state.eventType,
      status: this.state.status,
      ...changedValue
    })
  }

  render() {
    const { intl, match } = this.props
    const searchParam = match.params.searchText
    return (
      <ActionPageWrapper>
        <ActionPage
          goBack={() => {
            window.location.assign('/')
          }}
          title={intl.formatMessage(messages.title)}
        >
          <Container>
            <HeaderContent>
              <Query
                query={SEARCH_EVENTS}
                variables={{
                  locationIds: [this.getLocalLocationId()],
                  count: this.pageSize,
                  skip: (this.state.currentPage - 1) * this.pageSize,
                  sort: this.state.sortBy,
                  eventType: this.state.eventType,
                  status: this.state.status,
                  searchContent: searchParam
                }}
              >
                {({ loading, error, data }) => {
                  if (loading) {
                    return (
                      <Loader
                        id="search_loader"
                        marginPercent={35}
                        spinnerDiameter={60}
                        loadingText={intl.formatMessage(messages.searchingFor, {
                          param: searchParam
                        })}
                      />
                    )
                  }
                  if (error) {
                    Sentry.captureException(error)

                    return (
                      <ErrorText id="search-result-error-text">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  const transformedData = transformData(data, intl)
                  const total = transformedData.length
                  return (
                    <>
                      <SearchInput
                        id="search-input-text"
                        searchValue={searchParam}
                        placeholder={intl.formatMessage(
                          messages.searchInputPlaceholder
                        )}
                        buttonLabel={intl.formatMessage(
                          messages.searchInputButtonTitle
                        )}
                        onSubmit={this.props.goToSearchResult}
                        {...this.props}
                      />
                      <SearchResultText>
                        {intl.formatMessage(messages.searchResultFor, {
                          total,
                          param: searchParam
                        })}
                      </SearchResultText>
                      {total > 0 && (
                        <>
                          <TotalResultText>
                            {intl.formatMessage(messages.totalResultText, {
                              total
                            })}
                          </TotalResultText>
                          <DataTable
                            data={transformedData}
                            zeroPagination={true}
                            cellRenderer={this.renderCell}
                            resultLabel={intl.formatMessage(
                              messages.dataTableResults
                            )}
                            noResultText={intl.formatMessage(
                              messages.dataTableNoResults
                            )}
                          />
                        </>
                      )}
                    </>
                  )
                }}
              </Query>
            </HeaderContent>
          </Container>
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}
export const SearchResult = connect(
  (state: IStoreState) => ({
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state)
  }),
  {
    goToEvents: goToEventsAction,
    goToSearchResult,
    gotoTab: goToTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(SearchResultView)))
