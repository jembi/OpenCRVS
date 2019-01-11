import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import * as Swipeable from 'react-swipeable'
import { Box, Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from '../../styled-components'
import { goToTab as goToTabAction } from '../../navigation'
import { IForm, IFormSection, IFormField, IFormSectionData } from '../../forms'
import { FormFieldGenerator, ViewHeaderWithTabs } from '../../components/form'
import { IStoreState } from 'src/store'
import { IDraft, modifyDraft, deleteDraft } from 'src/drafts'
import {
  FooterAction,
  FooterPrimaryButton,
  ViewFooter
} from 'src/components/interface/footer'
import { StickyFormTabs } from './StickyFormTabs'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import processDraftData from './ProcessDraftData'
import { ReviewSection } from '../../views/RegisterForm/review/ReviewSection'
import { merge } from 'lodash'
import { RejectRegistrationForm } from 'src/components/review/RejectRegistrationForm'
import {
  SAVED_REGISTRATION,
  REJECTED_REGISTRATION
} from 'src/navigation/routes'

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
    defaultMessage: 'New birth application',
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

function getActiveSectionId(form: IForm, viewParams: { tabId?: string }) {
  return viewParams.tabId || form.sections[0].id
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

export interface IFormProps {
  draft: IDraft
  registerForm: IForm
  tabRoute: string
}

type DispatchProps = {
  goToTab: typeof goToTabAction
  modifyDraft: typeof modifyDraft
  deleteDraft: typeof deleteDraft
  handleSubmit: (values: unknown) => void
}

type Props = {
  activeSection: IFormSection
  setAllFieldsDirty: boolean
}

type FullProps = IFormProps &
  Props &
  DispatchProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

type State = {
  showSubmitModal: boolean
  showRegisterModal: boolean
  isDataAltered: boolean
  rejectFormOpen: boolean
  selectedTabId: string
}

const postMutation = gql`
  mutation submitBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`
const patchMutation = gql`
  mutation markBirthAsRegistered($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
const VIEW_TYPE = {
  REVIEW: 'review',
  PREVIEW: 'preview'
}

interface IFullName {
  fullNameInBn: string
  fullNameInEng: string
}

const getFullName = (childData: IFormSectionData): IFullName => {
  let fullNameInBn = ''
  let fullNameInEng = ''

  if (childData.firstNames) {
    fullNameInBn = `${String(childData.firstNames)} ${String(
      childData.familyName
    )}`
  } else {
    fullNameInBn = String(childData.familyName)
  }

  if (childData.firstNamesEng) {
    fullNameInEng = `${String(childData.firstNamesEng)} ${String(
      childData.familyNameEng
    )}`
  } else {
    fullNameInEng = String(childData.familyNameEng)
  }
  return {
    fullNameInBn,
    fullNameInEng
  }
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      showSubmitModal: false,
      selectedTabId: '',
      isDataAltered: false,
      rejectFormOpen: false,
      showRegisterModal: false
    }
  }

  modifyDraft = (sectionData: IFormSectionData) => {
    const { activeSection, draft } = this.props
    if (draft.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
    this.props.modifyDraft({
      ...draft,
      data: {
        ...draft.data,
        [activeSection.id]: { ...draft.data[activeSection.id], ...sectionData }
      }
    })
  }

  rejectSubmission = () => {
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
    const fullName: IFullName = getFullName(childData)
    history.push(REJECTED_REGISTRATION, {
      rejection: true,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteDraft(draft)
  }

  successfulSubmission = (response: string) => {
    const { history, draft } = this.props
    const childData = this.props.draft.data.child
    const fullName = getFullName(childData)
    history.push(SAVED_REGISTRATION, {
      trackingId: response,
      declaration: true,
      fullNameInBn: fullName.fullNameInBn,
      fullNameInEng: fullName.fullNameInEng
    })
    this.props.deleteDraft(draft)
  }

  successfullyRegistered = () => {
    const { draft } = this.props
    window.location.href = '/work-queue'
    this.props.deleteDraft(draft)
  }

  submitForm = () => {
    this.setState({ showSubmitModal: true })
  }

  registerApplication = () => {
    console.log(this.props.draft)
    this.setState({ showRegisterModal: true })
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState: State) => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }

  toggleRegisterModalOpen = () => {
    this.setState((prevState: State) => ({
      showRegisterModal: !prevState.showRegisterModal
    }))
  }

  onSwiped = (
    draftId: string,
    selectedSection: IFormSection | null,
    tabRoute: string,
    goToTab: (tabRoute: string, draftId: string, tabId: string) => void
  ): void => {
    if (selectedSection) {
      goToTab(tabRoute, draftId, selectedSection.id)
    }
  }

  processSubmitData = () => {
    const { draft } = this.props
    const data = processDraftData(draft.data)
    if (!draft.review) {
      return { details: data }
    } else {
      if (!this.state.isDataAltered) {
        return { id: draft.id }
      } else {
        return { id: draft.id, details: data }
      }
    }
  }

  generateSectionListForReview = (
    disabled: boolean,
    sections: IFormSection[]
  ) => {
    const result: IFormSection[] = []
    sections.map((section: IFormSection) => {
      result.push(
        merge(
          {
            disabled: section.viewType !== VIEW_TYPE.REVIEW && disabled
          },
          section
        )
      )
    })
    return result
  }

  toggleRejectForm = () => {
    this.setState(state => ({
      rejectFormOpen: !state.rejectFormOpen
    }))
  }

  render() {
    const {
      goToTab,
      intl,
      activeSection,
      setAllFieldsDirty,
      draft,
      history,
      registerForm,
      handleSubmit
    } = this.props
    const isReviewForm = draft.review
    const nextSection = getNextSection(registerForm.sections, activeSection)
    const title = isReviewForm
      ? messages.reviewBirthRegistration
      : activeSection.viewType === VIEW_TYPE.PREVIEW
      ? messages.previewBirthRegistration
      : messages.newBirthRegistration
    const isReviewSection = activeSection.viewType === VIEW_TYPE.REVIEW
    const sectionForReview = isReviewForm
      ? this.generateSectionListForReview(
          isReviewSection,
          registerForm.sections
        )
      : registerForm.sections
    return (
      <FormViewContainer>
        <ViewHeaderWithTabs
          breadcrumb="Informant: Parent"
          id="informant_parent_view"
          title={intl.formatMessage(title)}
        >
          <StickyFormTabs
            sections={sectionForReview}
            activeTabId={activeSection.id}
            onTabClick={(tabId: string) =>
              goToTab(this.props.tabRoute, draft.id, tabId)
            }
          />
        </ViewHeaderWithTabs>
        <FormContainer>
          <Swipeable
            disabled={isReviewSection}
            id="swipeable_block"
            trackMouse
            onSwipedLeft={() =>
              this.onSwiped(draft.id, nextSection, this.props.tabRoute, goToTab)
            }
            onSwipedRight={() =>
              this.onSwiped(
                draft.id,
                getPreviousSection(registerForm.sections, activeSection),
                this.props.tabRoute,
                goToTab
              )
            }
          >
            {activeSection.viewType === VIEW_TYPE.PREVIEW && (
              <ReviewSection
                tabRoute={this.props.tabRoute}
                draft={draft}
                submitClickEvent={this.submitForm}
                saveDraftClickEvent={() => history.push('/')}
                deleteApplicationClickEvent={() => {
                  this.props.deleteDraft(draft)
                  history.push('/')
                }}
              />
            )}
            {activeSection.viewType === VIEW_TYPE.REVIEW && (
              <ReviewSection
                tabRoute={this.props.tabRoute}
                draft={draft}
                rejectApplicationClickEvent={() => {
                  this.toggleRejectForm()
                }}
                registerClickEvent={this.registerApplication}
              />
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
                    onChange={this.modifyDraft}
                    setAllFieldsDirty={setAllFieldsDirty}
                    fields={activeSection.fields}
                  />
                </form>
                <FormAction>
                  {nextSection && (
                    <FormPrimaryButton
                      onClick={() =>
                        goToTab(this.props.tabRoute, draft.id, nextSection.id)
                      }
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
              onClick={() => history.push(SAVED_REGISTRATION)}
            >
              {intl.formatMessage(messages.saveDraft)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
        <Mutation mutation={postMutation} variables={this.processSubmitData()}>
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
                      if (document.documentElement) {
                        document.documentElement.scrollTop = 0
                      }
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

        <Mutation mutation={patchMutation} variables={this.processSubmitData()}>
          {(markBirthAsRegistered, { data }) => {
            if (data && data.markBirthAsRegistered) {
              this.successfullyRegistered()
            }

            return (
              <Modal
                title="Are you ready to submit?"
                actions={[
                  <PrimaryButton
                    key="register"
                    id="register_confirm"
                    onClick={() => markBirthAsRegistered()}
                  >
                    {intl.formatMessage(messages.submitButton)}
                  </PrimaryButton>,
                  <PreviewButton
                    key="review"
                    id="register_review"
                    onClick={() => {
                      this.toggleRegisterModalOpen()
                      if (document.documentElement) {
                        document.documentElement.scrollTop = 0
                      }
                    }}
                  >
                    {intl.formatMessage(messages.preview)}
                  </PreviewButton>
                ]}
                show={this.state.showRegisterModal}
                handleClose={this.toggleRegisterModalOpen}
              >
                {intl.formatMessage(messages.submitDescription)}
              </Modal>
            )
          }}
        </Mutation>

        {this.state.rejectFormOpen && (
          <RejectRegistrationForm
            onBack={this.toggleRejectForm}
            confirmRejectionEvent={() => {
              this.rejectSubmission()
            }}
            draftId={draft.id}
          />
        )}
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
  props: IFormProps &
    Props &
    RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match, registerForm, draft } = props

  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.tabId}" missing!`)
  }

  if (!draft) {
    throw new Error(`Draft "${match.params.draftId}" missing!`)
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
    draft
  }
}

export const RegisterForm = connect<Props, DispatchProps>(
  mapStateToProps,
  {
    modifyDraft,
    deleteDraft,
    goToTab: goToTabAction,
    handleSubmit: values => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
