import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import * as Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import {
  goToTab as goToTabAction,
  goToReviewTab as goToReviewTabAction
} from '../../navigation'
import { IForm, IFormSection, IFormField, IFormSectionData } from '../../forms'
import { FormFieldGenerator, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from '../../store'
import { IDraft, modifyDraft, deleteDraft } from '../../drafts'
import { getRegisterForm } from '../../forms/register/selectors'
import { getReviewForm } from '../../forms/review/selectors'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { PreviewSection } from './PreviewSection'
import { StickyFormTabs } from './StickyFormTabs'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import processDraftData from './ProcessDraftData'

const FormSectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const messages = defineMessages({
  newBirthRegistration: {
    id: 'register.form.newBirthRegistration',
    defaultMessage: 'New birth declaration',
    description: 'The message that appears for new birth registrations'
  },
  previewBirthRegistration: {
    id: 'register.form.previewBirthRegistration',
    defaultMessage: 'Birth Application Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewBirthRegistration: {
    id: 'register.form.reviewBirthRegistration',
    defaultMessage: 'Birth Application Review',
    description: 'The message that appears for new birth registrations'
  },
  saveDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save draft',
    description: 'Save draft button'
  },
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  },
  preview: {
    id: 'register.form.modal.preview',
    defaultMessage: 'Preview',
    description: 'Preview button on submit modal'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Submit',
    description: 'Submit button on submit modal'
  }
})

const FormContainer = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
`

const FormViewContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`

function getActiveSectionId(
  form: IForm,
  viewParams: { tabId?: string },
  isReviewForm: boolean
) {
  return (
    viewParams.tabId ||
    (isReviewForm && form.sections[form.sections.length - 1].id) ||
    form.sections[0].id
  )
}

function getNextSection(sections: IFormSection[], fromSection: IFormSection) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === sections.length - 1) {
    return null
  }

  return sections[currentIndex + 1]
}

function getPreviousSection(
  sections: IFormSection[],
  fromSection: IFormSection
) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === 0) {
    return null
  }

  return sections[currentIndex - 1]
}

type DispatchProps = {
  goToRegistrationTab: typeof goToTabAction
  goToReviewTab: typeof goToReviewTabAction
  modifyDraft: typeof modifyDraft
  deleteDraft: typeof deleteDraft
  handleSubmit: (values: unknown) => void
}

type Props = {
  draft: IDraft
  registerForm: IForm
  activeSection: IFormSection
  setAllFieldsDirty: boolean
  isReviewForm: boolean | undefined
}

type FullProps = Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  showSubmitModal: boolean
  selectedTabId: string
}

const postMutation = gql`
  mutation submitBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      selectedTabId: ''
    }
  }

  modifyDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [activeSection.id]: sectionData
      }
    })
  }

  modifyReviewDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    this.props.modifyDraft(
      {
        ...draft,
        data: {
          ...draft.data,
          [activeSection.id]: sectionData
        }
      },
      true
    )
  }

  successfulSubmission = (response: string) => {
    const { history, draft } = this.props
    history.push('/saved', {
      trackingId: response
    })
    this.props.deleteDraft(draft)
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState: State) => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }

  onSwiped = (
    draftId: number,
    selectedSection: IFormSection | null,
    goToTab: (draftId: number, tabId: string) => void
  ): void => {
    if (selectedSection) {
      goToTab(draftId, selectedSection.id)
    }
  }

  processSubmitData = () => processDraftData(this.props.draft.data)

  render() {
    const {
      goToRegistrationTab,
      goToReviewTab,
      intl,
      activeSection,
      setAllFieldsDirty,
      draft,
      history,
      registerForm,
      handleSubmit,
      isReviewForm
    } = this.props

    const nextSection = getNextSection(registerForm.sections, activeSection)
    const goToTab = isReviewForm ? goToReviewTab : goToRegistrationTab
    const changeDraft = isReviewForm ? this.modifyReviewDraft : this.modifyDraft
    const title = isReviewForm
      ? messages.reviewBirthRegistration
      : activeSection.viewType === 'preview'
        ? messages.previewBirthRegistration
        : messages.newBirthRegistration

    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(title)}
        >
          <StickyFormTabs
            sections={registerForm.sections}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) => goToTab(draft.id, tabId)}
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Swipeable
            id="swipeable_block"
            trackMouse
            onSwipedLeft={() => this.onSwiped(draft.id, nextSection, goToTab)}
            onSwipedRight={() =>
              this.onSwiped(
                draft.id,
                getPreviousSection(registerForm.sections, activeSection),
                goToTab
              )
            }
          >
            {activeSection.viewType === 'preview' && (
              <PreviewSection draft={draft} onSubmit={this.submitForm} />
            )}
            {activeSection.viewType === 'review' && (
              <PreviewSection draft={draft} onSubmit={this.submitForm} />
            )}
            {activeSection.viewType === 'form' && (
              <Box>
                <FormSectionTitle id={`form_section_title_${activeSection.id}`}>
                  {intl.formatMessage(activeSection.title)}
                </FormSectionTitle>
                <form
                  id={`form_section_id_${activeSection.id}`}
                  onSubmit={handleSubmit}
                >
                  <FormFieldGenerator
                    id={activeSection.id}
                    onChange={changeDraft}
                    setAllFieldsDirty={setAllFieldsDirty}
                    fields={activeSection.fields}
                  />
                </form>
                <FormAction>
                  {nextSection && (
                    <FormPrimaryButton
                      onClick={() => goToTab(draft.id, nextSection.id)}
                      id="next_section"
                      icon={() => <ArrowForward />}
                    >
                      {intl.formatMessage(messages.next)}
                    </FormPrimaryButton>
                  )}
                </FormAction>
              </Box>
            )}
          </Swipeable>
        </FormContainer>
        <ViewFooter>
          <FooterAction>
            <FooterPrimaryButton
              id="save_draft"
              onClick={() => history.push('/saved')}
            >
              {intl.formatMessage(messages.saveDraft)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
        <Mutation
          mutation={postMutation}
          variables={{ details: this.processSubmitData() }}
        >
          {(submitBirthRegistration, { data }) => {
            if (data && data.createBirthRegistration) {
              this.successfulSubmission(data.createBirthRegistration)
            }

            return (
              <Modal
                title="Are you ready to submit?"
                actions={[
                  <PrimaryButton
                    key="submit"
                    id="submit_confirm"
                    onClick={() => submitBirthRegistration()}
                  >
                    {intl.formatMessage(messages.submitButton)}
                  </PrimaryButton>,
                  <PreviewButton
                    key="preview"
                    onClick={() => {
                      this.toggleSubmitModalOpen()
                      document.documentElement.scrollTop = 0
                    }}
                  >
                    {intl.formatMessage(messages.preview)}
                  </PreviewButton>
                ]}
                show={this.state.showSubmitModal}
                handleClose={this.toggleSubmitModalOpen}
              >
                {intl.formatMessage(messages.submitDescription)}
              </Modal>
            )
          }}
        </Mutation>
      </FormViewContainer>
    )
  }
}

function replaceInitialValues(fields: IFormField[], sectionValues: object) {
  return fields.map(field => ({
    ...field,
    initialValue: sectionValues[field.name] || field.initialValue
  }))
}

function mapStateToProps(
  state: IStoreState,
  props: Props &
    RouteComponentProps<{ tabId: string; draftId: string; review: string }>
) {
  const { match } = props
  const isReviewForm = match.params.review === 'review'
  const registerForm = isReviewForm
    ? getReviewForm(state)
    : getRegisterForm(state)
  const activeSectionId = getActiveSectionId(
    registerForm,
    match.params,
    isReviewForm
  )

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )
  const draft = state.drafts.drafts.find(
    ({ id }) => id === parseInt(match.params.draftId, 10)
  )

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
  }

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.tabId}" missing!`)
  }

  const visitedSections = registerForm.sections.filter(({ id }) =>
    Boolean(draft.data[id])
  )

  const rightMostVisited = visitedSections[visitedSections.length - 1]

  const setAllFieldsDirty =
    rightMostVisited &&
    registerForm.sections.indexOf(activeSection) <
      registerForm.sections.indexOf(rightMostVisited)

  const fields = replaceInitialValues(
    activeSection.fields,
    draft.data[activeSectionId] || {}
  )

  return {
    registerForm,
    setAllFieldsDirty,
    activeSection: {
      ...activeSection,
      fields
    },
    draft,
    isReviewForm
  }
}

export const RegisterForm = connect<Props, DispatchProps>(mapStateToProps, {
  modifyDraft,
  deleteDraft,
  goToRegistrationTab: goToTabAction,
  goToReviewTab: goToReviewTabAction,
  handleSubmit: values => {
    console.log(values)
  }
})(injectIntl<FullProps>(RegisterFormView))
