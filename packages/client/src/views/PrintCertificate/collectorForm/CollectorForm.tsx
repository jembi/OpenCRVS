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
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'

import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  modifyDeclaration,
  storeDeclaration,
  writeDeclaration,
  IPrintableDeclaration,
  ICertificate
} from '@client/declarations'
import { FormFieldGenerator } from '@client/components/form'
import {
  IForm,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { getValidationErrorsForForm } from '@client/forms/validation'
import { buttonMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generatePrintCertificatePaymentUrl,
  generatePrintCertificateUrl,
  generateReviewCertificateUrl,
  generateVerifyCollectorUrl
} from '@client/navigation'
import {
  CERTIFICATE_COLLECTOR,
  REGISTRAR_HOME_TAB
} from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  getEvent,
  getEventDate,
  getRegisteredDate,
  isFreeOfCost,
  isCertificateForPrintInAdvance,
  filterPrintInAdvancedOption
} from '@client/views/PrintCertificate/utils'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getCertificateCollectorFormSection } from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getRegisteringOfficeId } from '@client/utils/draftUtils'
import { UserDetails } from '@client/utils/userUtils'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { FormikTouched, FormikValues } from 'formik'

type PropsWhenDeclarationIsFound = {
  registerForm: IForm
  event: EventType
  pageRoute: string
  declarationId: string
  declaration: IPrintableDeclaration
  formSection: IFormSection
  formGroup: IFormSectionGroup
  offlineCountryConfiguration: IOfflineData
  userDetails: UserDetails | null
}
type PropsWhenDeclarationIsNotFound = {
  declaration: undefined
  offlineCountryConfiguration: IOfflineData
  userDetails: UserDetails | null
}

interface IBaseProps {
  theme?: ITheme
}

interface DispatchProps {
  storeDeclaration: typeof storeDeclaration
  writeDeclaration: typeof writeDeclaration
  modifyDeclaration: typeof modifyDeclaration
}

type IProps =
  | (RouteComponentProps<IBaseProps> &
      PropsWhenDeclarationIsFound &
      IntlShapeProps &
      DispatchProps)
  | (RouteComponentProps<IBaseProps> &
      PropsWhenDeclarationIsNotFound &
      IntlShapeProps &
      DispatchProps)

function getNextSectionIds(
  formSection: IFormSection,
  formSectionGroup: IFormSectionGroup,
  declaration?: IPrintableDeclaration
) {
  const certificates = declaration && declaration.data.registration.certificates

  const certificate = (certificates && certificates[0]) || {}
  const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
    formSection,
    (certificate[
      formSection.id as keyof typeof certificate
    ] as IFormSectionData) || {}
  )
  const currentGroupIndex = visibleGroups.findIndex(
    (group: IFormSectionGroup) => group.id === formSectionGroup.id
  )

  if (currentGroupIndex === visibleGroups.length - 1) {
    return null
  }
  return {
    sectionId: formSection.id,
    groupId: visibleGroups[currentGroupIndex + 1].id
  }
}

const getErrorsOnFieldsBySection = (
  sectionId: keyof IPrintableDeclaration['data'],
  fields: IFormField[],
  draft: IPrintableDeclaration,
  config: IOfflineData,
  user: UserDetails | null
) => {
  const certificates = draft.data.registration.certificates
  const certificate = (certificates && certificates[0]) || {}
  const initialValues = fields.reduce((acc, field) => {
    return {
      ...acc,
      [field.name]: field.initialValue
    }
  })
  const errors = getValidationErrorsForForm(
    fields,
    {
      ...initialValues,
      ...(certificate[
        sectionId as keyof typeof certificate
      ] as IFormSectionData)
    } as IFormSectionData,
    config,
    draft.data,
    user
  )

  return Object.values(errors)
    .map((field) => field.errors[0]?.message)
    .filter(Boolean)
}

interface IState {
  showModalForNoSignedAffidavit: boolean
  isFileUploading: boolean
}

class CollectorFormComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showModalForNoSignedAffidavit: false,
      isFileUploading: false
    }
  }
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  modifyDeclaration = (
    sectionData: ICertificate['collector'],
    declaration: IPrintableDeclaration
  ) => {
    const certificates = declaration.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = { ...(certificate.collector || {}), ...sectionData }
    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        registration: {
          ...declaration.data.registration,
          certificates: [
            {
              collector: collector,
              hasShowedVerifiedDocument: false,
              certificateTemplateId: collector.certificateTemplateId
            }
          ]
        }
      }
    })
  }

  continueButtonHandler = (
    declarationId: string,
    currentGroup: string,
    nextGroup: string | undefined,
    event: EventType,
    sectionId: keyof IPrintableDeclaration['data'],
    fields: IFormField[],
    draft: IPrintableDeclaration | undefined
  ) => {
    if (!draft) return

    const errors = getErrorsOnFieldsBySection(
      sectionId,
      fields,
      draft,
      this.props.offlineCountryConfiguration,
      this.props.userDetails
    )

    const certificates = draft.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = certificate[
      sectionId as keyof typeof certificate
    ] as IFormSectionData

    if (errors.length > 0) {
      const formGroup = (
        this.props as PropsWhenDeclarationIsFound
      ).formGroup.fields.reduce(
        (acc, { name }) => ({ ...acc, [name]: true }),
        {}
      )

      this.setAllFormFieldsTouched(formGroup)
      return
    }

    if (currentGroup === 'affidavit') {
      if (
        collector.affidavitFile &&
        (collector.affidavitFile as IFormSectionData).data
      ) {
        this.props.writeDeclaration(draft)
        this.goToNextFormForSomeoneElse(declarationId, draft, event)

        return
      }

      this.props.writeDeclaration(draft)
      this.setState({ showModalForNoSignedAffidavit: true })

      return
    }

    this.setState({
      showModalForNoSignedAffidavit: false
    })
    if (!nextGroup) {
      this.props.writeDeclaration(draft)

      if (isCertificateForPrintInAdvance(draft)) {
        this.props.router.navigate(
          generateReviewCertificateUrl({
            registrationId: declarationId,
            event
          }),
          {
            state: { isNavigatedInsideApp: true }
          }
        )
      } else {
        this.props.router.navigate(
          generateVerifyCollectorUrl({
            registrationId: declarationId,
            event,
            collector: collector.type as string
          })
        )
      }
    } else {
      this.props.router.navigate(
        generatePrintCertificateUrl({
          registrationId: declarationId,
          event,
          groupId: nextGroup
        })
      )
    }
  }

  goToNextFormForSomeoneElse = (
    declarationId: string,
    declaration: IPrintableDeclaration,
    event: EventType
  ) => {
    const { offlineCountryConfiguration } = this
      .props as PropsWhenDeclarationIsFound
    if (
      isFreeOfCost(
        declaration.data.registration.certificates[0],
        getEventDate(declaration.data, event),
        getRegisteredDate(declaration.data),
        offlineCountryConfiguration
      )
    ) {
      this.props.router.navigate(
        generateReviewCertificateUrl({
          registrationId: declarationId,
          event
        }),
        {
          state: { isNavigatedInsideApp: true }
        }
      )
    } else {
      this.props.router.navigate(
        generatePrintCertificatePaymentUrl({
          registrationId: declarationId,
          event
        })
      )
    }
  }

  toggleSubmitModalOpen = () => {
    this.setState((prevState) => ({
      showModalForNoSignedAffidavit: !prevState.showModalForNoSignedAffidavit
    }))
  }

  resetCertificatesInformation = () => {
    const declaration = Object.assign({}, this.props.declaration)
    declaration.data.registration.certificates = []
    this.props.modifyDeclaration(declaration)
  }

  render() {
    const { showModalForNoSignedAffidavit } = this.state
    const props = this.props
    const { declaration } = props

    const declarationToBeCertified = declaration
    if (!declarationToBeCertified) {
      return (
        <Navigate
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToPrint,
            selectorId: ''
          })}
        />
      )
    }

    const { intl, event, declarationId, formSection, formGroup } = props

    const nextSectionGroup = getNextSectionIds(
      formSection,
      formGroup,
      declaration
    )
    return (
      <>
        <ActionPageLight
          id="collector_form"
          hideBackground
          title={formSection.title && intl.formatMessage(formSection.title)}
          goBack={() => {
            this.props.router.navigate(-1)
          }}
          goHome={() =>
            this.props.router.navigate(
              generateGoToHomeTabUrl({
                tabId: WORKQUEUE_TABS.readyToPrint
              })
            )
          }
        >
          <Content
            title={
              (formGroup.title && intl.formatMessage(formGroup.title)) || ''
            }
            size={ContentSize.SMALL}
            showTitleOnMobile
            bottomActionButtons={[
              <Button
                key="confirm_form"
                id="confirm_form"
                type="primary"
                size="large"
                fullWidth
                onClick={() => {
                  this.continueButtonHandler(
                    declarationToBeCertified.id,
                    formGroup.id,
                    nextSectionGroup ? nextSectionGroup.groupId : undefined,
                    event,
                    formSection.id,
                    formGroup.fields,
                    declarationToBeCertified
                  )
                }}
                disabled={this.state.isFileUploading}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </Button>
            ]}
          >
            <FormFieldGenerator
              id={formGroup.id}
              key={formGroup.id}
              onChange={(values) => {
                this.modifyDeclaration(values, declarationToBeCertified)
              }}
              setAllFieldsDirty={false}
              fields={formGroup.fields}
              draftData={declarationToBeCertified.data}
              onUploadingStateChanged={this.onUploadingStateChanged}
              onSetTouched={(setTouchedFunc) =>
                (this.setAllFormFieldsTouched = setTouchedFunc)
              }
            />
          </Content>
        </ActionPageLight>
        {showModalForNoSignedAffidavit && (
          <ResponsiveModal
            id="noAffidavitAgreementConfirmationModal"
            title={intl.formatMessage(
              certificateMessages.noAffidavitModalTitle
            )}
            contentHeight={96}
            actions={[
              <TertiaryButton
                id="cancel-btn"
                key="cancel"
                onClick={this.toggleSubmitModalOpen}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  this.goToNextFormForSomeoneElse(
                    declarationId,
                    declarationToBeCertified,
                    event
                  )
                }
                disabled={this.state.isFileUploading}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </PrimaryButton>
            ]}
            show={showModalForNoSignedAffidavit}
            handleClose={this.toggleSubmitModalOpen}
          >
            {intl.formatMessage(
              certificateMessages.noAffidavitModalDescription
            )}
          </ResponsiveModal>
        )}
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  props: RouteComponentProps<IBaseProps>
) => {
  const { registrationId, eventType, groupId } = props.router.match.params
  const event = getEvent(eventType)
  const userDetails = getUserDetails(state)
  const offlineCountryConfiguration = getOfflineData(state)

  const declaration = state.declarationsState.declarations.find(
    (declaration) => declaration.id === registrationId
  ) as IPrintableDeclaration | undefined

  if (!declaration) {
    return {
      declaration: undefined,
      offlineCountryConfiguration: getOfflineData(state),
      userDetails
    }
  }

  const userOfficeId = userDetails?.primaryOffice?.id
  const registeringOfficeId = getRegisteringOfficeId(declaration)
  const certFormSection = getCertificateCollectorFormSection(
    declaration,
    state.offline.offlineData.templates?.certificates || []
  )

  const isAllowPrintInAdvance =
    event === EventType.Birth
      ? getOfflineData(state).config.BIRTH.PRINT_IN_ADVANCE
      : event === EventType.Death
      ? getOfflineData(state).config.DEATH.PRINT_IN_ADVANCE
      : getOfflineData(state).config.MARRIAGE.PRINT_IN_ADVANCE

  const formGroup = isAllowPrintInAdvance
    ? certFormSection.groups.find((group) => group.id === groupId) ||
      certFormSection.groups[0]
    : filterPrintInAdvancedOption(
        certFormSection.groups.find((group) => group.id === groupId) ||
          certFormSection.groups[0]
      )

  /**
   * As the field defintions are hard-coded in core, finding
   * by field name, option values are supposed to be fine
   */
  const collectorField = formGroup.fields.find(({ name }) => name === 'type')
  if (collectorField && collectorField.type === 'RADIO_GROUP') {
    const isDifferentOffice =
      userOfficeId &&
      registeringOfficeId &&
      userOfficeId !== registeringOfficeId
    collectorField.options = collectorField.options.map((opt) => ({
      ...opt,
      disabled: opt.value === 'PRINT_IN_ADVANCE' && isDifferentOffice
    }))
  }
  const fields = replaceInitialValues(
    formGroup.fields,
    (declaration &&
      declaration.data.registration.certificates &&
      declaration.data.registration.certificates[
        declaration.data.registration.certificates.length - 1
      ]?.collector) ||
      {},
    declaration && declaration.data,
    offlineCountryConfiguration,
    userDetails
  )

  return {
    registerForm: getRegisterForm(state)[event],
    event,
    pageRoute: CERTIFICATE_COLLECTOR,
    declarationId: registrationId,
    declaration,
    formSection: certFormSection,
    formGroup: {
      ...formGroup,
      fields
    },
    userDetails,
    offlineCountryConfiguration
  }
}

export const CollectorForm = withRouter(
  connect<
    ReturnType<typeof mapStateToProps>,
    DispatchProps,
    RouteComponentProps<IBaseProps>,
    IStoreState
  >(mapStateToProps, {
    storeDeclaration,
    writeDeclaration,
    modifyDeclaration
  })(injectIntl(withTheme(CollectorFormComponent)))
)
