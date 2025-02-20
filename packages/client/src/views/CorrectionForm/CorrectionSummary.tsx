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
import { FormFieldGenerator } from '@client/components/form'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  IDeclaration,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import {
  CorrectionSection,
  IForm,
  IFormData,
  IFormField,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IPreviewGroup,
  REVIEW_OVERRIDE_POSITION,
  ReviewSection,
  SubmissionAction,
  IFormFieldValue
} from '@client/forms'
import { CorrectorRelationship } from '@client/forms/correction/corrector'
import { correctionFeesPaymentSection } from '@client/forms/correction/payment'
import { CorrectionReason } from '@client/forms/correction/reason'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as registerMessages } from '@client/i18n/messages/views/register'
import { getLanguage } from '@client/i18n/selectors'
import {
  generateCertificateCorrectionUrl,
  generateGoToHomeTabUrl,
  generateGoToPageGroupUrl
} from '@client/navigation'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { UserDetails } from '@client/utils/userUtils'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { getCurrencySymbol } from '@client/views/SysAdmin/Config/Application/utils'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import { LinkButton, SecondaryButton } from '@opencrvs/components/lib/buttons'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Check, PaperClip } from '@opencrvs/components/lib/icons'
import { get } from 'lodash'
import * as React from 'react'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  getNestedFieldValue,
  getOverriddenFieldsListForPreview,
  getRenderableField,
  getViewableSection,
  hasFieldChanged,
  isViewOnly,
  isVisibleField,
  renderValue,
  sectionHasError,
  updateDeclarationRegistrationWithCorrection,
  RenderableFieldType
} from './utils'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

const SupportingDocument = styled.div`
  display: flex;
  margin: 8px 0;
  & span:last-child {
    padding-left: 8px;
  }
`
interface IProps {
  userPrimaryOffice?: UserDetails['primaryOffice']
  userDetails: UserDetails | null
  registerForm: { [key: string]: IForm }
  offlineResources: IOfflineData
  language: string
  scopes: Scope[] | null
}

type IStateProps = RouteComponentProps<{
  declaration: IDeclaration
}>

type IState = {
  isFileUploading: boolean
  showPrompt: boolean
}

type IDispatchProps = {
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
}

type IFullProps = IProps & IStateProps & IDispatchProps & IntlShapeProps
type NestedItemType = RenderableFieldType | undefined | IFormFieldValue

class CorrectionSummaryComponent extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      isFileUploading: false,
      showPrompt: false
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      isFileUploading: isUploading
    })
  }

  togglePrompt = () => {
    this.setState((prevState) => ({ showPrompt: !prevState.showPrompt }))
  }

  render() {
    const {
      registerForm,
      declaration,
      intl,
      declaration: { event },
      userDetails,
      offlineResources,
      router
    } = this.props

    const currencySymbol = getCurrencySymbol(offlineResources.config.CURRENCY)
    const section = correctionFeesPaymentSection(currencySymbol)

    const group = {
      ...section.groups[0],
      fields: replaceInitialValues(
        section.groups[0].fields,
        this.props.declaration.data[section.id] || {},
        this.props.declaration.data,
        offlineResources,
        userDetails
      )
    }

    const { showPrompt } = this.state
    const formSections = getViewableSection(registerForm[event], declaration)
    const relationShip = (
      declaration.data.corrector.relationship as IFormSectionData
    ).value as string

    const noIdCheck =
      relationShip !== CorrectorRelationship.REGISTRAR &&
      relationShip !== CorrectorRelationship.ANOTHER_AGENT

    const backToReviewButton = (
      <SecondaryButton
        id="back_to_review"
        key="back_to_review"
        onClick={this.gotoReviewPage}
      >
        {intl.formatMessage(registerMessages.backToReviewButton)}
      </SecondaryButton>
    )

    const continueButton = (
      <Button
        id="make_correction"
        key="make_correction"
        type="positive"
        size="large"
        onClick={this.togglePrompt}
        disabled={
          sectionHasError(
            group,
            section,
            declaration,
            this.props.offlineResources,
            this.props.declaration.data,
            userDetails
          ) || this.state.isFileUploading
        }
      >
        <Check />
        {this.props.scopes?.includes(
          SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
        )
          ? intl.formatMessage(buttonMessages.sendForApproval)
          : intl.formatMessage(buttonMessages.makeCorrection)}
      </Button>
    )

    return (
      <>
        <ActionPageLight
          id="corrector_form"
          title={intl.formatMessage(messages.title)}
          hideBackground
          goBack={() => router.navigate(-1)}
          goHome={() =>
            router.navigate(
              generateGoToHomeTabUrl({
                tabId: WORKQUEUE_TABS.readyForReview
              })
            )
          }
        >
          <Content
            title={intl.formatMessage(messages.correctionSummaryTitle)}
            topActionButtons={[backToReviewButton]}
            bottomActionButtons={[continueButton]}
            showTitleOnMobile={true}
          >
            <Table
              id="diff"
              isLoading={false}
              noPagination
              content={this.getChanges(formSections)}
              hideTableBottomBorder={true}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryItem),
                  alignment: ColumnContentAlignment.LEFT,
                  width: 34,
                  key: 'item'
                },
                {
                  label: intl.formatMessage(messages.correctionSummaryOriginal),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'original'
                },
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryCorrection
                  ),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'changed'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <Table
              id="requestedBy"
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  requestedBy: this.getRequestedBy()
                }
              ]}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryRequestedBy
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'requestedBy'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            {noIdCheck && (
              <Table
                id="idCheck"
                hideTableBottomBorder={true}
                isLoading={false}
                content={[
                  {
                    idCheck: this.getIdCheck()
                  }
                ]}
                columns={[
                  {
                    label: intl.formatMessage(
                      messages.correctionSummaryIdCheck
                    ),
                    width: 100,
                    alignment: ColumnContentAlignment.LEFT,
                    key: 'idCheck'
                  }
                ]}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
              ></Table>
            )}

            <Table
              id="reason"
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  reasonForRequest: this.getReasonForRequest()
                }
              ]}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryReasonForRequest
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'reasonForRequest'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <Table
              id="comments"
              hideTableBottomBorder={true}
              isLoading={false}
              content={[
                {
                  comments: this.getComments()
                }
              ]}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryComments),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'comments'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <Table
              id="supportingDocuments"
              isLoading={false}
              content={[
                {
                  supportingDocuments: this.getSupportingDocuments()
                }
              ]}
              columns={[
                {
                  label: intl.formatMessage(
                    messages.correctionSummarySupportingDocuments
                  ),
                  width: 100,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'supportingDocuments'
                }
              ]}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
            ></Table>
            <FormFieldGenerator
              id={group.id}
              onChange={(values) => {
                this.modifyDeclaration(
                  values,
                  correctionFeesPaymentSection(currencySymbol),
                  declaration
                )
              }}
              setAllFieldsDirty={false}
              fields={group.fields}
              draftData={declaration.data}
              onUploadingStateChanged={this.onUploadingStateChanged}
              requiredErrorMessage={messages.correctionRequiredLabel}
            />
          </Content>
        </ActionPageLight>
        <Dialog
          id="withoutCorrectionForApprovalPrompt"
          isOpen={showPrompt}
          title={intl.formatMessage(
            this.props.scopes?.includes(
              SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
            )
              ? messages.correctionForApprovalDialogTitle
              : messages.correctRecordDialogTitle
          )}
          onClose={this.togglePrompt}
          actions={[
            <Button
              id="cancel"
              key="cancel"
              size="medium"
              type="tertiary"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(messages.correctionForApprovalDialogCancel)}
            </Button>,
            <Button
              type="positive"
              size="medium"
              id="send"
              key="continue"
              onClick={() => {
                this.makeCorrection()
                this.togglePrompt()
              }}
            >
              {intl.formatMessage(messages.correctionForApprovalDialogConfirm)}
            </Button>
          ]}
        >
          <p>
            <Text element="p" variant="reg16">
              {intl.formatMessage(
                this.props.scopes?.includes(
                  SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
                )
                  ? messages.correctionForApprovalDialogDescription
                  : messages.correctRecordDialogDescription
              )}
            </Text>
          </p>
        </Dialog>
      </>
    )
  }

  getFieldValue = (
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    intl: IntlShape,
    offlineResources: IOfflineData,
    language: string,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean
  ) => {
    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineResources,
      language
    )

    if (replaceEmpty && !value) {
      value = '-'
    }

    return field.nestedFields && !Boolean(ignoreNestedFieldWrapping)
      ? (
          (data[section.id] &&
            data[section.id][field.name] &&
            (data[section.id][field.name] as IFormSectionData).value &&
            field.nestedFields[
              (data[section.id][field.name] as IFormSectionData).value as string
            ]) ||
          []
        ).reduce((groupedValues, nestedField) => {
          // Value of the parentField resembles with IFormData as a nested form
          const nestedValue =
            (data[section.id] &&
              data[section.id][field.name] &&
              renderValue(
                data[section.id][field.name] as IFormData,
                'nestedFields',
                nestedField,
                intl,
                offlineResources,
                language
              )) ||
            ''
          return (
            <>
              {groupedValues}
              {nestedValue && <div></div>}
              {nestedValue}
            </>
          )
        }, <>{value}</>)
      : value
  }

  getSinglePreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    ignoreNestedFieldWrapping?: boolean
  ) => {
    const { declaration, intl, offlineResources, language } = this.props
    if (
      declaration.originalData &&
      hasFieldChanged(
        field,
        declaration.data[section.id],
        declaration.originalData[section.id]
      )
    ) {
      const changed = this.getFieldValue(
        section,
        declaration.data,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping
      )
      const original = this.getFieldValue(
        section,
        declaration.originalData,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping,
        true
      )

      return getRenderableField(
        section,
        { fieldLabel: field.label, fieldLabelParams: field.labelParam },
        original,
        changed,
        intl
      )
    }
  }

  getPreviewGroupsField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) => {
    const { declaration, intl, offlineResources, language, userDetails } =
      this.props
    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(
            field,
            section,
            declaration,
            offlineResources,
            userDetails
          ) &&
          !isViewOnly(field)
        ) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                isVisibleField(
                  tempField,
                  section,
                  declaration,
                  offlineResources,
                  userDetails
                ) &&
                !isViewOnly(tempField) &&
                tempField.previewGroup === baseTag
              ) {
                taggedFields.push(tempField)
              }
            })
          }
        }
      })

      const tagDef =
        (group.previewGroups &&
          (group.previewGroups.filter(
            (previewGroup) => previewGroup.id === baseTag
          ) as IPreviewGroup[])) ||
        []
      const values = taggedFields
        .map((field) =>
          this.getFieldValue(
            section,
            declaration.data,
            field,
            intl,
            offlineResources,
            language
          )
        )
        .filter((value) => value)

      let completeValue = values[0]
      values.shift()
      values.forEach(
        (value) =>
          (completeValue = (
            <>
              {completeValue}
              {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
              {value}
            </>
          ))
      )

      const hasAnyFieldChanged = taggedFields.reduce(
        (accum, field) => accum || hasFieldChanged(field, data, originalData),
        false
      )

      const declarationOriginalData = declaration.originalData
      if (declarationOriginalData && hasAnyFieldChanged) {
        const previousValues = taggedFields
          .map((field, index) =>
            this.getFieldValue(
              section,
              declarationOriginalData,
              field,
              intl,
              offlineResources,
              language,
              undefined,
              !!index
            )
          )
          .filter((value) => value)
        let previousCompleteValue = previousValues[0]
        previousValues.shift()
        previousValues.forEach(
          (previousValue) =>
            (previousCompleteValue = (
              <>
                {previousCompleteValue}
                {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
                {previousValue}
              </>
            ))
        )

        return getRenderableField(
          section,
          {
            fieldLabel: (tagDef[0] && tagDef[0].label) || field.label,
            fieldLabelParams: field.labelParam
          },
          previousCompleteValue,
          completeValue,
          intl
        )
      }
    }
  }

  getNestedPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField
  ) => {
    const {
      declaration: { data, originalData },
      intl,
      offlineResources,
      language
    } = this.props
    const visitedTags: string[] = []
    const nestedItems: NestedItemType[] = []
    // parent field
    let item: NestedItemType
    item = this.getSinglePreviewField(section, group, field, true)

    item && nestedItems.push(item)
    ;(
      (field.nestedFields &&
        data[section.id] &&
        data[section.id][field.name] &&
        (data[section.id][field.name] as IFormSectionData).value &&
        field.nestedFields[
          (data[section.id][field.name] as IFormSectionData).value as string
        ]) ||
      []
    ).forEach((nestedField) => {
      if (nestedField.previewGroup) {
        item = this.getPreviewGroupsField(
          section,
          group,
          nestedField,
          visitedTags,
          (data[section.id][field.name] as IFormData).nestedFields,
          (originalData &&
            (originalData[section.id][field.name] as IFormData).nestedFields) ||
            undefined
        )

        item && nestedItems.push(item)
      } else {
        item = getNestedFieldValue(
          section,
          data[section.id][field.name] as IFormData,
          nestedField,
          intl,
          offlineResources,
          language
        )
        item && nestedItems.push(item)
      }
    })
    return nestedItems
  }

  getOverRiddenPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    overriddenField: IFormField,
    field: IFormField,
    items: any[],
    item: any,
    deathForm: IForm
  ) => {
    overriddenField.label =
      get(overriddenField, 'reviewOverrides.labelAs') || overriddenField.label
    const residingSectionId = get(
      overriddenField,
      'reviewOverrides.residingSection'
    )
    const residingSection = deathForm.sections.find(
      (section) => section.id === residingSectionId
    ) as IFormSection

    const result = this.getSinglePreviewField(
      residingSection,
      group,
      overriddenField
    )

    const { sectionID, groupID, fieldName } =
      overriddenField!.reviewOverrides!.reference
    if (
      sectionID === section.id &&
      groupID === group.id &&
      fieldName === field.name
    ) {
      if (
        overriddenField!.reviewOverrides!.position ===
        REVIEW_OVERRIDE_POSITION.BEFORE
      ) {
        items = items.concat(result)
        items = items.concat(item)
      } else {
        items = items.concat(item)
        items = items.concat(result)
      }
      return items
    }

    items = items.concat(item)
    return items
  }

  getChanges = (formSections: IFormSection[]) => {
    const { declaration, offlineResources, userDetails } = this.props
    const overriddenFields = getOverriddenFieldsListForPreview(
      formSections,
      declaration,
      offlineResources,
      userDetails
    )
    let tempItem: any

    let items: any[] = []
    formSections.forEach((section) => {
      const visitedTags: string[] = []
      const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
        section,
        declaration.data[section.id] || {},
        declaration.data
      )
      visibleGroups.forEach((group) => {
        group.fields
          .filter(
            (field) =>
              isVisibleField(
                field,
                section,
                declaration,
                offlineResources,
                userDetails
              ) && !isViewOnly(field)
          )
          .filter((field) => !Boolean(field.hideInPreview))
          .filter((field) => !Boolean(field.reviewOverrides))
          .forEach((field) => {
            tempItem = field.previewGroup
              ? this.getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  declaration.data[section.id],
                  declaration.originalData &&
                    declaration.originalData[section.id]
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? this.getNestedPreviewField(section, group, field)
              : this.getSinglePreviewField(section, group, field)

            overriddenFields.forEach((overriddenField) => {
              items = this.getOverRiddenPreviewField(
                section,
                group,
                overriddenField as IFormField,
                field,
                items,
                tempItem,
                this.props.registerForm.death
              )
            })

            if (!overriddenFields.length) {
              items = items.concat(tempItem)
            }
          })
      })
    })
    return items.filter((item) => item)
  }

  modifyDeclaration = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    declaration: IDeclaration
  ) => {
    this.props.modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        [activeSection.id]: {
          ...declaration.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  getName = (person: IFormSectionData) => {
    return [
      person.firstNamesEng as string,
      person.familyNameEng as string
    ].join(' ')
  }

  getRequestedBy = () => {
    const corrector = this.props.declaration.data.corrector as IFormSectionData

    const relationship =
      corrector &&
      ((corrector.relationship as IFormSectionData).value as string)
    switch (relationship) {
      case CorrectorRelationship.INFORMANT:
        return this.getName(this.props.declaration.data.informant)
      case CorrectorRelationship.MOTHER:
        return this.getName(this.props.declaration.data.mother)
      case CorrectorRelationship.FATHER:
        return this.getName(this.props.declaration.data.father)
      case CorrectorRelationship.CHILD:
        return this.getName(this.props.declaration.data.child)
      case CorrectorRelationship.LEGAL_GUARDIAN:
        return this.props.intl.formatMessage(messages.legalGuardian)
      case CorrectorRelationship.ANOTHER_AGENT:
        return this.props.intl.formatMessage(messages.anotherRegOrFieldAgent)
      case CorrectorRelationship.REGISTRAR:
        return this.props.intl.formatMessage(messages.me)
      case CorrectorRelationship.COURT:
        return this.props.intl.formatMessage(messages.court)
      case CorrectorRelationship.OTHER:
        return (
          (corrector.relationship as IFormSectionData)
            .nestedFields as IFormSectionData
        ).otherRelationship as string

      default:
        return '-'
    }
  }

  getIdCheck = () => {
    const corrector = this.props.declaration.data.corrector as IFormSectionData
    const idChecked =
      corrector &&
      ((corrector as IFormSectionData).hasShowedVerifiedDocument as boolean)
    return idChecked
      ? this.props.intl.formatMessage(messages.idCheckVerify)
      : this.props.intl.formatMessage(messages.idCheckWithoutVerify)
  }

  getReasonForRequest = () => {
    const reason = this.props.declaration.data.reason as IFormSectionData
    const reasonType = reason && (reason.type as IFormSectionData)
    const reasonValue = reasonType && (reasonType.value as string)
    switch (reasonValue) {
      case CorrectionReason.CLERICAL_ERROR:
        return this.getReason(
          this.props.intl.formatMessage(messages.clericalError)
        )
      case CorrectionReason.MATERIAL_ERROR:
        return this.getReason(
          this.props.intl.formatMessage(messages.materialError)
        )
      case CorrectionReason.MATERIAL_OMISSION:
        return this.getReason(
          this.props.intl.formatMessage(messages.materialOmission)
        )
      case CorrectionReason.JUDICIAL_ORDER:
        return this.getReason(
          this.props.intl.formatMessage(messages.judicialOrder)
        )
      case CorrectionReason.OTHER:
        return this.getReason(
          (reasonType.nestedFields as IFormSectionData).otherReason as string
        )
      default:
        return '-'
    }
  }

  getReason = (message: string) => {
    return (
      <div>
        <div>{message}</div>
        <LinkButton
          id="change-reason-link"
          onClick={() =>
            this.props.router.navigate(
              generateCertificateCorrectionUrl({
                declarationId: this.props.declaration.id,
                pageId: CorrectionSection.Reason
              })
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.change)}
        </LinkButton>
      </div>
    )
  }

  getComments = () => {
    const reason = this.props.declaration.data.reason as IFormSectionData
    const comments = reason && (reason.additionalComment as string)

    return (
      <div>
        <div>{comments}</div>
        <LinkButton
          id="change-comment-link"
          onClick={() =>
            this.props.router.navigate(
              generateCertificateCorrectionUrl({
                declarationId: this.props.declaration.id,
                pageId: CorrectionSection.Reason
              })
            )
          }
        >
          {comments && comments.length > 0
            ? this.props.intl.formatMessage(buttonMessages.change)
            : this.props.intl.formatMessage(
                messages.correctionSummaryAddComments
              )}
        </LinkButton>
      </div>
    )
  }

  getSupportingDocuments = () => {
    const supportingDocuments = this.props.declaration.data
      .supportingDocuments as IFormSectionData
    const proofOfDoc =
      supportingDocuments &&
      (supportingDocuments.uploadDocForLegalProof as IFormSectionData[])

    return (
      <div>
        {proofOfDoc &&
          proofOfDoc.map((proof, i) => {
            const doc = proof.optionValues as IFormSectionData[]
            return (
              <SupportingDocument key={`proof-${i}`}>
                <PaperClip />
                <span>{doc[1] as any}</span>
              </SupportingDocument>
            )
          })}
        <LinkButton
          id="upload-supporting-doc-link"
          onClick={() =>
            this.props.router.navigate(
              generateCertificateCorrectionUrl({
                declarationId: this.props.declaration.id,
                pageId: CorrectionSection.SupportingDocuments
              })
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.upload)}
        </LinkButton>
      </div>
    )
  }

  makeCorrection = () => {
    let declaration = this.props.declaration
    // Delete certificate properties during print record corrections
    // since correction flow doesn't handle certificates
    if (declaration?.data?.registration.certificates) {
      const { certificates, ...rest } = declaration.data.registration
      declaration = {
        ...declaration,
        data: {
          ...declaration.data,
          registration: {
            ...rest
          }
        }
      }
    }
    if (
      this.props.scopes?.includes(SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION)
    ) {
      declaration.action = SubmissionAction.REQUEST_CORRECTION
      declaration.submissionStatus =
        SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
    } else {
      declaration.action = SubmissionAction.MAKE_CORRECTION
      declaration.submissionStatus =
        SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
    }
    const correction = updateDeclarationRegistrationWithCorrection(
      declaration.data,
      {
        userPrimaryOffice: this.props.userDetails?.primaryOffice
      }
    )

    declaration.data.registration.correction = {
      ...((declaration.data.registration.correction as IFormSectionData) || {}),
      ...correction
    }

    this.props.writeDeclaration(declaration)

    if (
      this.props.scopes?.includes(SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION)
    ) {
      this.props.router.navigate(
        generateGoToHomeTabUrl({
          tabId: WORKQUEUE_TABS.sentForApproval
        })
      )
    } else {
      this.props.router.navigate(
        generateGoToHomeTabUrl({
          tabId: WORKQUEUE_TABS.readyForReview
        })
      )
    }
  }

  gotoReviewPage = () => {
    this.props.router.navigate(
      generateGoToPageGroupUrl({
        pageRoute: CERTIFICATE_CORRECTION_REVIEW,
        declarationId: this.props.declaration.id,
        pageId: ReviewSection.Review,
        groupId: 'review-view-group',
        event: this.props.declaration.event
      })
    )
  }
}

export const CorrectionSummary = withRouter(
  connect(
    (state: IStoreState) => ({
      registerForm: getRegisterForm(state),
      offlineResources: getOfflineData(state),
      language: getLanguage(state),
      userPrimaryOffice: getUserDetails(state)?.primaryOffice,
      scopes: getScope(state),
      userDetails: getUserDetails(state)
    }),
    {
      modifyDeclaration,
      writeDeclaration
    }
  )(injectIntl(CorrectionSummaryComponent))
)
