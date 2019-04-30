import {
  ActionTitle,
  Button,
  IButtonProps,
  IconAction,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  Plus,
  StatusOrange,
  StatusProgress,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ISearchInputProps,
  SearchInput,
  Spinner
} from '@opencrvs/components/lib/interface'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface/GridTable'
import { IAction } from '@opencrvs/components/lib/interface/ListItem'
import { HeaderContent } from '@opencrvs/components/lib/layout'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  GQLBirthRegistration,
  GQLDeathRegistration,
  GQLEventRegistration,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema.d'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { HomeViewHeader } from 'components/HomeViewHeader'
import { IViewHeadingProps } from 'components/ViewHeading'
import { IDraft } from 'drafts'
import { Event } from 'forms'
import {
  goToEvents as goToEventsAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToReviewDuplicate as goToReviewDuplicateAction,
  goToTab as goToTabAction,
  goToSearchResult
} from 'navigation'
import {
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_DEATH_FORM,
  REVIEW_EVENT_PARENT_FORM_TAB
} from 'navigation/routes'
import { getScope, getUserDetails } from 'profile/profileSelectors'
import { IStoreState } from 'store'
import { Scope } from 'utils/authUtils'
import { CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT } from 'utils/constants'
import { createNamesMap } from 'utils/data-formatting'
import { formatLongDate } from 'utils/date-formatting'
import { getUserLocation, IUserDetails } from 'utils/userUtils'
import styled, { withTheme } from 'styledComponents'
import { goToWorkQueueTab as goToWorkQueueTabAction } from '../../navigation'
import { COUNT_REGISTRATION_QUERY, FETCH_REGISTRATIONS_QUERY } from './queries'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}
export const IconTabs = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  position: relative;
  white-space: nowrap;
  border-bottom: 1px solid rgb(210, 210, 210);
  margin-top: 50px;
`
export const IconTab = styled(Button).attrs<IProps>({})`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme, active }) => (active ? 'bold' : 'normal')};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  margin-right: 50px;
  outline: none;
  font-size: 16px;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  & div {
    position: relative;
    margin-right: 10px;
  }
  &:focus {
    outline: 0;
  }
`

const messages = defineMessages({
  name: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  dob: {
    id: 'register.workQueue.labels.results.dob',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  dod: {
    id: 'register.workQueue.labels.results.dod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  },
  hello: {
    id: 'register.home.header.hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
  },
  searchInputPlaceholder: {
    id: 'register.workQueue.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.workQueue.buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  queryError: {
    id: 'register.workQueue.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.workQueue.dataTable.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.workQueue.dataTable.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  headerTitle: {
    id: 'register.workQueue.header.title',
    defaultMessage: 'Hello Registrar',
    description: 'The displayed title in the Work Queue header'
  },
  headerDescription: {
    id: 'register.workQueue.header.description',
    defaultMessage: 'Review | Registration | Certification',
    description: 'The displayed description in the Work Queue header'
  },
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New registration',
    description: 'The title of new registration button'
  },
  inProgress: {
    id: 'register.workQueue.tabs.inProgress',
    defaultMessage: 'In progress',
    description: 'The title of In progress'
  },
  readyForReview: {
    id: 'register.workQueue.tabs.readyForReview',
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review'
  },
  sentForUpdates: {
    id: 'register.workQueue.tabs.sentForUpdates',
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  listItemType: {
    id: 'register.workQueue.labels.results.type',
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item'
  },
  listItemTrackingNumber: {
    id: 'register.workQueue.labels.results.trackingID',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in work queue list item'
  },
  listItemApplicantNumber: {
    id: 'register.workQueue.labels.results.applicantNumber',
    defaultMessage: 'Applicant No.',
    description: 'Label for applicant number in work queue list item'
  },
  listItemApplicationDate: {
    id: 'register.workQueue.labels.results.applicationDate',
    defaultMessage: 'Application sent',
    description: 'Label for application date in work queue list item'
  },
  listItemUpdateDate: {
    id: 'register.workQueue.labels.results.updateDate',
    defaultMessage: 'Sent on',
    description: 'Label for rejection date in work queue list item'
  },
  listItemModificationDate: {
    id: 'register.workQueue.labels.results.modificationDate',
    defaultMessage: 'Last edited',
    description: 'Label for rejection date in work queue list item'
  },
  listItemEventDate: {
    id: 'register.workQueue.labels.results.eventDate',
    defaultMessage: 'Date of event',
    description: 'Label for event date in work queue list item'
  },
  reviewDuplicates: {
    id: 'register.workQueue.buttons.reviewDuplicates',
    defaultMessage: 'Review Duplicates',
    description:
      'The title of review duplicates button in expanded area of list item'
  },
  review: {
    id: 'register.workQueue.list.buttons.review',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
  },
  update: {
    id: 'register.workQueue.list.buttons.update',
    defaultMessage: 'Update',
    description: 'The title of update button in list item actions'
  },
  listItemName: {
    id: 'register.workQueue.labels.results.name',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  listItemAction: {
    id: 'register.workQueue.labels.results.action',
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item'
  }
})
const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -30px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);
  background-color: ${({ theme }) => theme.colors.accentLight};
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 28px;
    font-weight: 300;
    margin: -2px 0 -2px 120px;
    line-height: 1.3em;
    color: ${({ theme }) => theme.colors.white};
  }
`
const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`
interface IBaseWorkQueueProps {
  theme: ITheme
  language: string
  scope: Scope
  goToEvents: typeof goToEventsAction
  userDetails: IUserDetails
  gotoTab: typeof goToTabAction
  goToWorkQueueTab: typeof goToWorkQueueTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  tabId: string
  drafts: IDraft[]
  goToSearchResult: typeof goToSearchResult
}

interface IWorkQueueState {
  currentPage: number
}

type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseWorkQueueProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates'
}

export const EVENT_STATUS = {
  DECLARED: 'DECLARED',
  REJECTED: 'REJECTED'
}
export class WorkQueueView extends React.Component<
  IWorkQueueProps,
  IWorkQueueState
> {
  pageSize = 10
  constructor(props: IWorkQueueProps) {
    super(props)
    this.state = {
      currentPage: 1
    }
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDeclaredContent = (data: GQLQuery) => {
    const { locale } = this.props.intl
    if (!data.listEventRegistrations || !data.listEventRegistrations.results) {
      return []
    }

    return data.listEventRegistrations.results.map(
      (reg: GQLEventRegistration) => {
        const lang = 'bn'
        let dateOfEvent
        let names: GQLHumanName[] = []
        if (reg.registration && reg.registration.type === 'BIRTH') {
          const birthReg = reg as GQLBirthRegistration
          dateOfEvent = birthReg && birthReg.child && birthReg.child.birthDate
          names =
            (birthReg &&
              birthReg.child &&
              (birthReg.child.name as GQLHumanName[])) ||
            []
        } else if (reg.registration && reg.registration.type === 'DEATH') {
          const deathReg = reg as GQLDeathRegistration
          dateOfEvent =
            deathReg &&
            deathReg.deceased &&
            deathReg.deceased.deceased &&
            deathReg.deceased.deceased.deathDate
          names =
            (deathReg &&
              deathReg.deceased &&
              (deathReg.deceased.name as GQLHumanName[])) ||
            []
        }
        const actions = [] as IAction[]
        if (this.userHasRegisterScope()) {
          if (
            reg.registration &&
            reg.registration.duplicates &&
            reg.registration.duplicates.length > 0
          ) {
            actions.push({
              label: this.props.intl.formatMessage(messages.reviewDuplicates),
              handler: () => this.props.goToReviewDuplicate(reg.id)
            })
          } else {
            actions.push({
              label: this.props.intl.formatMessage(messages.review),
              handler: () =>
                this.props.gotoTab(
                  REVIEW_EVENT_PARENT_FORM_TAB,
                  reg.id,
                  'review',
                  (reg.registration &&
                    reg.registration.type &&
                    reg.registration.type.toLowerCase()) ||
                    ''
                )
            })
          }
        }

        return {
          id: reg.id,
          name:
            (createNamesMap(names)[lang] as string) ||
            /* tslint:disable:no-string-literal */
            (createNamesMap(names)['default'] as string) ||
            /* tslint:enable:no-string-literal */
            '',
          date_of_event:
            (dateOfEvent &&
              moment(dateOfEvent.toString(), 'YYYY-MM-DD').format(
                CERTIFICATE_MONEY_RECEIPT_DATE_FORMAT
              )) ||
            '',
          event_time_elapsed:
            (dateOfEvent &&
              moment(dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
            '',
          application_time_elapsed:
            (reg.createdAt &&
              moment(reg.createdAt.toString(), 'YYYY-MM-DD').fromNow()) ||
            '',
          tracking_id: (reg.registration && reg.registration.trackingId) || '',
          event:
            (reg.registration &&
              reg.registration.type &&
              reg.registration.type.toString()) ||
            '',
          duplicates: (reg.registration && reg.registration.duplicates) || [],
          actions,
          status:
            (reg.registration &&
              reg.registration.status &&
              reg.registration.status
                .map(status => {
                  return {
                    type: (status && status.type) || null,
                    practitionerName:
                      (status &&
                        status.user &&
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          this.props.language
                        ] as string)) ||
                      (status &&
                        status.user &&
                        /* tslint:disable:no-string-literal */
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          'default'
                        ] as string)) ||
                      /* tslint:enable:no-string-literal */
                      '',
                    timestamp:
                      (status && formatLongDate(status.timestamp, locale)) ||
                      null,
                    practitionerRole:
                      status && status.user && status.user.role
                        ? this.props.intl.formatMessage(
                            messages[status.user.role as string]
                          )
                        : '',
                    officeName:
                      locale === 'en'
                        ? (status && status.office && status.office.name) || ''
                        : (status && status.office && status.office.alias) || ''
                  }
                })
                .reverse()) ||
            null
        }
      }
    )
  }

  transformRejectedContent = (data: GQLQuery) => {
    const { locale } = this.props.intl
    if (!data.listEventRegistrations || !data.listEventRegistrations.results) {
      return []
    }

    return data.listEventRegistrations.results.map(
      (reg: GQLEventRegistration) => {
        let names
        let contactPhoneNumber
        if (reg.registration && reg.registration.type === 'BIRTH') {
          const birthReg = reg as GQLBirthRegistration
          names =
            (birthReg &&
              birthReg.child &&
              (birthReg.child.name as GQLHumanName[])) ||
            []
          contactPhoneNumber =
            (birthReg.registration &&
              birthReg.registration.contactPhoneNumber) ||
            ''
        } else if (reg.registration && reg.registration.type === 'DEATH') {
          const deathReg = reg as GQLDeathRegistration
          names =
            (deathReg &&
              deathReg.deceased &&
              (deathReg.deceased.name as GQLHumanName[])) ||
            []
          const phoneEntry =
            (deathReg.informant &&
              deathReg.informant.individual &&
              deathReg.informant.individual.telecom &&
              deathReg.informant.individual.telecom.find(
                contactPoint =>
                  (contactPoint && contactPoint.system === 'phone') || false
              )) ||
            null
          contactPhoneNumber = (phoneEntry && phoneEntry.value) || ''
        }
        const actions = [] as IAction[]
        if (this.userHasRegisterScope()) {
          if (
            reg.registration &&
            reg.registration.duplicates &&
            reg.registration.duplicates.length > 0
          ) {
            actions.push({
              label: this.props.intl.formatMessage(messages.reviewDuplicates),
              handler: () => this.props.goToReviewDuplicate(reg.id)
            })
          } else {
            actions.push({
              label: this.props.intl.formatMessage(messages.update),
              handler: () =>
                this.props.gotoTab(
                  REVIEW_EVENT_PARENT_FORM_TAB,
                  reg.id,
                  'review',
                  (reg.registration &&
                    reg.registration.type &&
                    reg.registration.type.toLowerCase()) ||
                    ''
                )
            })
          }
        }
        const lang = 'en'
        return {
          id: reg.id,
          name:
            (names && (createNamesMap(names)[lang] as string)) ||
            /* tslint:disable:no-string-literal */
            (names && (createNamesMap(names)['bn'] as string)) ||
            '',
          date_of_rejection:
            reg.registration &&
            reg.registration.status &&
            reg.registration.status[0] &&
            // @ts-ignore
            reg.registration.status[0].timestamp &&
            moment(
              // @ts-ignore
              reg.registration.status[0].timestamp.toString(),
              'YYYY-MM-DD'
            ).fromNow(),
          contact_number: contactPhoneNumber || '',
          event:
            (reg.registration &&
              reg.registration.type &&
              reg.registration.type.toString()) ||
            '',
          duplicates: (reg.registration && reg.registration.duplicates) || [],
          actions,
          status:
            (reg.registration &&
              reg.registration.status &&
              reg.registration.status
                .map(status => {
                  return {
                    type: (status && status.type) || null,
                    practitionerName:
                      (status &&
                        status.user &&
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          this.props.language
                        ] as string)) ||
                      (status &&
                        status.user &&
                        /* tslint:disable:no-string-literal */
                        (createNamesMap(status.user.name as GQLHumanName[])[
                          'default'
                        ] as string)) ||
                      /* tslint:enable:no-string-literal */
                      '',
                    timestamp:
                      (status && formatLongDate(status.timestamp, locale)) ||
                      null,
                    practitionerRole:
                      status && status.user && status.user.role
                        ? this.props.intl.formatMessage(
                            messages[status.user.role as string]
                          )
                        : '',
                    officeName:
                      locale === 'en'
                        ? (status && status.office && status.office.name) || ''
                        : (status && status.office && status.office.alias) || ''
                  }
                })
                .reverse()) ||
            null
        }
      }
    )
  }

  transformDraftContent = () => {
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    return this.props.drafts.map((draft: IDraft) => {
      let name
      let tabRoute: string
      if (draft.event && draft.event.toString() === 'birth') {
        name =
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyNameEng &&
            (!draft.data.child.firstNamesEng
              ? ''
              : draft.data.child.firstNamesEng + ' ') +
              draft.data.child.familyNameEng) ||
          (draft.data &&
            draft.data.child &&
            draft.data.child.familyName &&
            (!draft.data.child.firstNames
              ? ''
              : draft.data.child.firstNames + ' ') +
              draft.data.child.familyName) ||
          ''
        tabRoute = DRAFT_BIRTH_PARENT_FORM
      } else if (draft.event && draft.event.toString() === 'death') {
        name =
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyNameEng &&
            (!draft.data.deceased.firstNamesEng
              ? ''
              : draft.data.deceased.firstNamesEng + ' ') +
              draft.data.deceased.familyNameEng) ||
          (draft.data &&
            draft.data.deceased &&
            draft.data.deceased.familyName &&
            (!draft.data.deceased.firstNames
              ? ''
              : draft.data.deceased.firstNames + ' ') +
              draft.data.deceased.familyName) ||
          ''
        tabRoute = DRAFT_DEATH_FORM
      }
      const lastModificationDate = draft.modifiedOn || draft.savedOn
      const actions = [
        {
          label: this.props.intl.formatMessage(messages.update),
          handler: () =>
            this.props.gotoTab(
              tabRoute,
              draft.id,
              '',
              (draft.event && draft.event.toString()) || ''
            )
        }
      ]
      return {
        id: draft.id,
        event: (draft.event && draft.event.toUpperCase()) || '',
        name: name || '',
        date_of_modification:
          (lastModificationDate && moment(lastModificationDate).fromNow()) ||
          '',
        actions
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ currentPage: newPageNumber })
  }

  render() {
    const { theme, intl, userDetails, language, tabId, drafts } = this.props
    const registrarUnion = userDetails && getUserLocation(userDetails, 'UNION')
    let parentQueryLoading = false

    let fullName = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      fullName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    return (
      <>
        <HomeViewHeader
          title={intl.formatMessage(messages.hello, {
            fullName
          })}
          description={role}
          id="home_view"
        />
        <Container>
          <HeaderContent>
            <StyledIconAction
              id="new_registration"
              icon={() => <StyledPlusIcon />}
              onClick={this.props.goToEvents}
              title={intl.formatMessage(messages.newRegistration)}
            />
            <SearchInput
              placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
              buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
              onSubmit={this.props.goToSearchResult}
              {...this.props}
            />
            <Query
              query={COUNT_REGISTRATION_QUERY}
              variables={{
                locationIds: [registrarUnion]
              }}
            >
              {({ loading, error, data }: any) => {
                if (loading) {
                  parentQueryLoading = true
                  return (
                    <StyledSpinner
                      id="search-result-spinner"
                      baseColor={theme.colors.background}
                    />
                  )
                }
                parentQueryLoading = false
                if (error) {
                  Sentry.captureException(error)
                  return (
                    <ErrorText id="search-result-error-text-count">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }

                return (
                  <>
                    <IconTabs>
                      <IconTab
                        id={`tab_${TAB_ID.inProgress}`}
                        key={TAB_ID.inProgress}
                        active={tabId === TAB_ID.inProgress}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusProgress />}
                        onClick={() =>
                          this.props.goToWorkQueueTab(TAB_ID.inProgress)
                        }
                      >
                        {intl.formatMessage(messages.inProgress)} (
                        {(drafts && drafts.length) || 0})
                      </IconTab>
                      <IconTab
                        id={`tab_${TAB_ID.readyForReview}`}
                        key={TAB_ID.readyForReview}
                        active={tabId === TAB_ID.readyForReview}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusOrange />}
                        onClick={() =>
                          this.props.goToWorkQueueTab(TAB_ID.readyForReview)
                        }
                      >
                        {intl.formatMessage(messages.readyForReview)} (
                        {data.countEventRegistrations.declared})
                      </IconTab>
                      <IconTab
                        id={`tab_${TAB_ID.sentForUpdates}`}
                        key={TAB_ID.sentForUpdates}
                        active={tabId === TAB_ID.sentForUpdates}
                        align={ICON_ALIGNMENT.LEFT}
                        icon={() => <StatusRejected />}
                        onClick={() =>
                          this.props.goToWorkQueueTab(TAB_ID.sentForUpdates)
                        }
                      >
                        {intl.formatMessage(messages.sentForUpdates)} (
                        {data.countEventRegistrations.rejected})
                      </IconTab>
                    </IconTabs>
                  </>
                )
              }}
            </Query>
            {tabId === TAB_ID.inProgress && (
              <GridTable
                content={this.transformDraftContent()}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 15,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(messages.listItemName),
                    width: 35,
                    key: 'name'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemModificationDate
                    ),
                    width: 35,
                    key: 'date_of_modification'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemAction
                    ),
                    width: 15,
                    key: 'actions',
                    isActionColumn: true,
                    alignment: ColumnContentAlignment.CENTER
                  }
                ]}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalPages={Math.ceil(
                  ((drafts && drafts.length) || 0) / this.pageSize
                )}
                initialPage={this.state.currentPage}
              />
            )}
            {tabId === TAB_ID.readyForReview && (
              <Query
                query={FETCH_REGISTRATIONS_QUERY}
                variables={{
                  status: EVENT_STATUS.DECLARED,
                  locationIds: [registrarUnion],
                  count: this.pageSize,
                  skip: (this.state.currentPage - 1) * this.pageSize
                }}
              >
                {({ loading, error, data }: any) => {
                  if (loading) {
                    return (
                      (!parentQueryLoading && (
                        <StyledSpinner
                          id="search-result-spinner"
                          baseColor={theme.colors.background}
                        />
                      )) ||
                      null
                    )
                  }
                  if (error) {
                    Sentry.captureException(error)
                    return (
                      <ErrorText id="search-result-error-text-review">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  return (
                    <GridTable
                      content={this.transformDeclaredContent(data)}
                      columns={[
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemType
                          ),
                          width: 14,
                          key: 'event'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemTrackingNumber
                          ),
                          width: 20,
                          key: 'tracking_id'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemApplicationDate
                          ),
                          width: 23,
                          key: 'application_time_elapsed'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemEventDate
                          ),
                          width: 23,
                          key: 'event_time_elapsed'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemAction
                          ),
                          width: 20,
                          key: 'actions',
                          isActionColumn: true,
                          alignment: ColumnContentAlignment.CENTER
                        }
                      ]}
                      expandedContentRows={[
                        {
                          label: intl.formatMessage(messages.name),
                          key: 'name'
                        },
                        {
                          label: intl.formatMessage(messages.dob),
                          displayForEvents: [Event.BIRTH],
                          key: 'date_of_event'
                        },
                        {
                          label: intl.formatMessage(messages.dod),
                          displayForEvents: [Event.DEATH],
                          key: 'date_of_event'
                        }
                      ]}
                      noResultText={intl.formatMessage(
                        messages.dataTableNoResults
                      )}
                      onPageChange={(currentPage: number) => {
                        this.onPageChange(currentPage)
                      }}
                      pageSize={this.pageSize}
                      totalPages={Math.ceil(
                        ((data.listEventRegistrations &&
                          data.listEventRegistrations.totalItems) ||
                          0) / this.pageSize
                      )}
                      initialPage={this.state.currentPage}
                      expandable={true}
                    />
                  )
                }}
              </Query>
            )}
            {tabId === TAB_ID.sentForUpdates && (
              <Query
                query={FETCH_REGISTRATIONS_QUERY}
                variables={{
                  status: EVENT_STATUS.REJECTED,
                  locationIds: [registrarUnion],
                  count: this.pageSize,
                  skip: (this.state.currentPage - 1) * this.pageSize
                }}
              >
                {({ loading, error, data }: any) => {
                  if (loading) {
                    return (
                      (!parentQueryLoading && (
                        <StyledSpinner
                          id="search-result-spinner"
                          baseColor={theme.colors.background}
                        />
                      )) ||
                      null
                    )
                  }
                  if (error) {
                    Sentry.captureException(error)
                    return (
                      <ErrorText id="search-result-error-text-reject">
                        {intl.formatMessage(messages.queryError)}
                      </ErrorText>
                    )
                  }
                  return (
                    <GridTable
                      content={this.transformRejectedContent(data)}
                      columns={[
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemType
                          ),
                          width: 14,
                          key: 'event'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemName
                          ),
                          width: 23,
                          key: 'name'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemApplicantNumber
                          ),
                          width: 21,
                          key: 'contact_number'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemUpdateDate
                          ),
                          width: 22,
                          key: 'date_of_rejection'
                        },
                        {
                          label: this.props.intl.formatMessage(
                            messages.listItemAction
                          ),
                          width: 20,
                          key: 'actions',
                          isActionColumn: true,
                          alignment: ColumnContentAlignment.CENTER
                        }
                      ]}
                      noResultText={intl.formatMessage(
                        messages.dataTableNoResults
                      )}
                      onPageChange={(currentPage: number) => {
                        this.onPageChange(currentPage)
                      }}
                      pageSize={this.pageSize}
                      totalPages={Math.ceil(
                        ((data.listEventRegistrations &&
                          data.listEventRegistrations.totalItems) ||
                          0) / this.pageSize
                      )}
                      initialPage={this.state.currentPage}
                      expandable={true}
                    />
                  )
                }}
              </Query>
            )}
          </HeaderContent>
        </Container>
      </>
    )
  }
}
function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'review',
    drafts: state.drafts.drafts
  }
}

export const WorkQueue = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    gotoTab: goToTabAction,
    goToWorkQueueTab: goToWorkQueueTabAction,
    goToSearchResult,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(WorkQueueView)))
