import * as React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import {
  Action,
  IconAction,
  ActionTitle
} from '@opencrvs/components/lib/buttons'
import { Plus } from '@opencrvs/components/lib/icons'
import {
  Banner,
  SearchInput,
  ISearchInputProps
} from '@opencrvs/components/lib/interface'
import { goToBirthRegistrationForReview } from 'src/navigation'
import { createDraft, storeDraft } from '../../drafts'
const messages = defineMessages({
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
  bannerTitle: {
    id: 'register.workQueue.applications.banner',
    defaultMessage: 'Applications to register in your area',
    description: 'The title of the banner'
  },
  newRegistration: {
    id: 'register.workQueue.buttons.newRegistration',
    defaultMessage: 'New registration',
    description: 'The title of new registration button'
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
type IWorkQueueProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps & {
    goToBirthRegistrationForReview: () => void
  }

class WorkQueueView extends React.Component<IWorkQueueProps> {
  render() {
    const { intl } = this.props
    return (
      <>
        <HomeViewHeader>
          <ViewHeading
            id="work_queue_view"
            title="Hello Registrar"
            description="Review | Registration | Certification"
            {...this.props}
          />
        </HomeViewHeader>
        <Container>
          <StyledIconAction
            id="new_registration"
            icon={() => <StyledPlusIcon />}
            title={intl.formatMessage(messages.newRegistration)}
          />
          <Banner text={intl.formatMessage(messages.bannerTitle)} count={15} />
          <SearchInput
            placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
            buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
            {...this.props}
          />
        </Container>
        <Action
          id="select_parent_informant"
          title="Review"
          description="Review"
          onClick={this.props.goToBirthRegistrationForReview}
        />
      </>
    )
  }
}

export const WorkQueue = connect(null, function mapDispatchToProps(
  dispatch: Dispatch
) {
  return {
    goToBirthRegistrationForReview: () => {
      const draft = createDraft()
      dispatch(storeDraft(draft, true))
      dispatch(goToBirthRegistrationForReview(draft.id))
      // dispatch(goToBirthRegistrationForReview(1542088554908))
    }
  }
})(injectIntl(WorkQueueView))
