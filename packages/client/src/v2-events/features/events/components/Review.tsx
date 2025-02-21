/* eslint-disable max-lines */
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

import React from 'react'
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import {
  ActionFormData,
  FieldConfig,
  FormConfig,
  getFieldValidationErrors,
  isFileFieldType,
  isFileFieldWithOptionType,
  SCOPES
} from '@opencrvs/commons/client'
import {
  Accordion,
  Button,
  DocumentViewer,
  Icon,
  IDocumentViewerOptions,
  Link,
  ListReview,
  ResponsiveModal,
  Stack,
  Text
} from '@opencrvs/components'

import { EventConfig, EventIndex } from '@opencrvs/commons'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { isFormFieldVisible } from '@client/v2-events/components/forms/utils'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getCountryLogoFile } from '@client/offline/selectors'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
// eslint-disable-next-line no-restricted-imports
import { getScope } from '@client/profile/profileSelectors'
import { getFullURL } from '@client/v2-events/features/files/useFileUpload'
import { Output } from './Output'

export const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  display: inline-block;
  text-transform: lowercase;

  &::first-letter {
    text-transform: uppercase;
  }
`

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const HeaderContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 16px;
  align-items: center;
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
`

const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.bold14}
  color: ${({ theme }) => theme.colors.supportingCopy};
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h2}
  overflow-wrap: anywhere;
`
const RightColumn = styled.div`
  width: 40%;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const LeftColumn = styled.div`
  flex-grow: 1;
  max-width: 840px;
  overflow: hidden;
`
const ResponsiveDocumentViewer = styled.div<{ isRegisterScope: boolean }>`
  position: fixed;
  width: calc(40% - 24px);
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ isRegisterScope }) => (isRegisterScope ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`

const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  height: 700px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    margin: 0;
  }
`

const FormData = styled.div`
  padding-top: 24px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`

const ReviewContainter = styled.div`
  padding: 0px 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const DeclarationDataContainer = styled.div``

const reviewMessages = defineMessages({
  changeButton: {
    id: 'v2.buttons.change',
    defaultMessage: 'Change',
    description: 'The label for the change button'
  },
  actionModalCancel: {
    id: 'v2.actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  actionModalPrimaryAction: {
    id: 'v2.actionModal.PrimaryAction',
    defaultMessage: '{action, select, declare{Declare} other{{action}}}',
    description: 'The label for primary action button of action modal'
  },
  actionModalTitle: {
    id: 'v2.actionModal.title',
    defaultMessage:
      '{action, select, declare{Declare} other{{action}}} the member?',
    description: 'The title for action modal'
  },
  actionModalDescription: {
    id: 'v2.actionModal.description',
    defaultMessage:
      'The declarant will be notified of this action and a record of this decision will be recorded',
    description: 'The description for action modal'
  },
  changeModalCancel: {
    id: 'v2.changeModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of change modal'
  },
  changeModalContinue: {
    id: 'v2.changeModal.continue',
    defaultMessage: 'Continue',
    description: 'The label for continue button of change modal'
  },
  changeModalTitle: {
    id: 'v2.changeModal.title',
    defaultMessage: 'Edit declaration?',
    description: 'The title for change modal'
  },
  changeModalDescription: {
    id: 'v2.changeModal.description',
    defaultMessage: 'A record will be created of any changes you make',
    description: 'The description for change modal'
  },
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government',
    description: 'Header title that shows govt name'
  },
  zeroDocumentsTextForAnySection: {
    defaultMessage: 'No supporting documents',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsTextForAnySection'
  },
  editDocuments: {
    defaultMessage: 'Add attachement',
    description: 'Edit documents text',
    id: 'review.documents.editDocuments'
  }
})

/**
 * Review component, used to display the "read" version of the form.
 * User can review the data and take actions like declare, reject or edit the data.
 */
function ReviewComponent({
  eventConfig,
  formConfig,
  previousFormValues,
  form,
  metadata,
  onEdit,
  children,
  title,
  isUploadButtonVisible,
  onMetadataChange
}: {
  children: React.ReactNode
  eventConfig: EventConfig
  formConfig: FormConfig
  form: ActionFormData
  metadata?: ActionFormData
  previousFormValues?: EventIndex['data']
  onEdit: ({
    pageId,
    fieldId,
    confirmation
  }: {
    pageId: string
    fieldId?: string
    confirmation?: boolean
  }) => void
  title: string
  isUploadButtonVisible?: boolean
  onMetadataChange?: (values: ActionFormData) => void
}) {
  const scopes = useSelector(getScope)
  const intl = useIntl()
  const countryLogoFile = useSelector(getCountryLogoFile)
  const showPreviouslyMissingValuesAsChanged = previousFormValues !== undefined
  const previousForm = previousFormValues ?? {}

  const pagesWithFile = formConfig.pages
    .filter(({ fields }) =>
      fields.some(({ type }) => type === 'FILE' || type === 'FILE_WITH_OPTIONS')
    )
    .map(({ id }) => id)

  function getOptions(fieldConfig: FieldConfig): IDocumentViewerOptions {
    const value = form[fieldConfig.id]
    if (!value) {
      return {
        selectOptions: [],
        documentOptions: []
      }
    }

    const fieldObj = {
      config: fieldConfig,
      value
    }
    if (isFileFieldType(fieldObj)) {
      return {
        selectOptions: [
          {
            value: fieldObj.config.id,
            label: intl.formatMessage(fieldObj.config.label)
          }
        ],
        documentOptions: [
          {
            value: getFullURL(fieldObj.value.filename),
            label: fieldObj.config.id
          }
        ]
      }
    }

    if (isFileFieldWithOptionType(fieldObj)) {
      const labelPrefix = intl.formatMessage(fieldObj.config.label)

      return fieldObj.config.options.reduce<IDocumentViewerOptions>(
        (acc, { value: val, label }) => {
          const specificValue = fieldObj.value.find(
            ({ option }) => val === option
          )
          if (specificValue) {
            return {
              documentOptions: [
                ...acc.documentOptions,
                { value: getFullURL(specificValue.filename), label: val }
              ],
              selectOptions: [
                ...acc.selectOptions,
                {
                  value: val,
                  label: `${labelPrefix} (${intl.formatMessage(label)})`
                }
              ]
            }
          }
          return acc
        },
        {
          selectOptions: [],
          documentOptions: []
        }
      )
    }

    return {
      selectOptions: [],
      documentOptions: []
    }
  }

  function reduceFields(fieldConfigs: FieldConfig[]): IDocumentViewerOptions {
    return fieldConfigs.reduce<IDocumentViewerOptions>(
      (acc, fieldConfig) => {
        const { selectOptions, documentOptions } = getOptions(fieldConfig)
        return {
          documentOptions: [...acc.documentOptions, ...documentOptions],
          selectOptions: [...acc.selectOptions, ...selectOptions]
        }
      },
      { selectOptions: [], documentOptions: [] }
    )
  }

  const fileOptions = formConfig.pages.reduce<IDocumentViewerOptions>(
    (acc, page) => {
      const { selectOptions, documentOptions } = reduceFields(page.fields)
      return {
        documentOptions: [...acc.documentOptions, ...documentOptions],
        selectOptions: [...acc.selectOptions, ...selectOptions]
      }
    },
    { selectOptions: [], documentOptions: [] }
  )

  return (
    <Row>
      <LeftColumn>
        <Card>
          <HeaderContainer>
            <HeaderContent>
              {countryLogoFile && (
                <CountryLogo size="small" src={countryLogoFile} />
              )}
              <Stack
                alignItems="flex-start"
                direction="column"
                gap={6}
                justify-content="flex-start"
              >
                <TitleContainer id={`header_title`}>
                  {intl.formatMessage(reviewMessages.govtName)} {' – '}
                  {intl.formatMessage(eventConfig.label)}
                </TitleContainer>
                <SubjectContainer id={`header_subject`}>
                  {title}
                </SubjectContainer>
              </Stack>
            </HeaderContent>
          </HeaderContainer>
          <FormData>
            <ReviewContainter>
              {formConfig.pages.map((page) => {
                return (
                  <DeclarationDataContainer
                    key={'Section_' + page.title.defaultMessage}
                  >
                    <Accordion
                      action={
                        <Link
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit({ pageId: page.id })
                          }}
                        >
                          {intl.formatMessage(reviewMessages.changeButton)}
                        </Link>
                      }
                      expand={true}
                      label={intl.formatMessage(page.title)}
                      labelForHideAction="Hide"
                      labelForShowAction="Show"
                      name={'Accordion_' + page.id}
                    >
                      <ListReview id={'Section_' + page.id}>
                        {page.fields
                          .filter((field) => isFormFieldVisible(field, form))
                          .map((field) => {
                            const value = form[field.id]
                            const previousValue = previousForm[field.id]

                            const valueDisplay = (
                              <Output
                                field={field}
                                previousValue={previousValue}
                                showPreviouslyMissingValuesAsChanged={
                                  showPreviouslyMissingValuesAsChanged
                                }
                                value={value}
                              />
                            )

                            const error = getFieldValidationErrors({
                              field,
                              values: form
                            })

                            const errorDisplay =
                              error.errors.length > 0 ? (
                                <ValidationError key={field.id}>
                                  {intl.formatMessage(error.errors[0].message)}
                                </ValidationError>
                              ) : null

                            return (
                              <ListReview.Row
                                key={field.id}
                                actions={
                                  <Link
                                    onClick={(e) => {
                                      e.stopPropagation()

                                      onEdit({
                                        pageId: page.id,
                                        fieldId: field.id
                                      })
                                    }}
                                  >
                                    {intl.formatMessage(
                                      reviewMessages.changeButton
                                    )}
                                  </Link>
                                }
                                id={field.id}
                                label={intl.formatMessage(field.label)}
                                value={
                                  error.errors.length > 0
                                    ? errorDisplay
                                    : valueDisplay
                                }
                              />
                            )
                          })}
                      </ListReview>
                    </Accordion>
                  </DeclarationDataContainer>
                )
              })}
            </ReviewContainter>
          </FormData>

          {metadata &&
            onMetadataChange &&
            formConfig.review.fields.length > 0 && (
              <FormData>
                <ReviewContainter>
                  <FormFieldGenerator
                    fields={formConfig.review.fields}
                    formData={metadata}
                    id={'review'}
                    initialValues={metadata}
                    setAllFieldsDirty={false}
                    onChange={onMetadataChange}
                  />
                </ReviewContainter>
              </FormData>
            )}
        </Card>
        {children}
      </LeftColumn>
      {pagesWithFile.length > 0 && (
        <RightColumn>
          <ResponsiveDocumentViewer
            isRegisterScope={
              scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT) ?? false
            }
          >
            <DocumentViewer id="document_section" options={fileOptions}>
              {fileOptions.documentOptions.length === 0 && (
                <ZeroDocument id={`zero_document`}>
                  {intl.formatMessage(
                    reviewMessages.zeroDocumentsTextForAnySection
                  )}
                  {isUploadButtonVisible && (
                    <Link
                      id="edit-document"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit({
                          pageId: pagesWithFile[0],
                          confirmation: true
                        })
                      }}
                    >
                      {intl.formatMessage(reviewMessages.editDocuments)}
                    </Link>
                  )}
                </ZeroDocument>
              )}
            </DocumentViewer>
          </ResponsiveDocumentViewer>
        </RightColumn>
      )}
    </Row>
  )
}

const Container = styled.div`
  position: relative;
  margin-top: 48px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100vw;
  }
`
const Content = styled.div`
  z-index: 1;
  padding: 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
    padding-bottom: 32px;
  }
`
const UnderLayBackground = styled.div<{ background: string }>`
  background-color: ${({ background, theme }) => {
    if (background === 'error') {
      return theme.colors.redLighter
    }

    return theme.colors.greenLighter
  }};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  margin-bottom: 12px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  margin-bottom: 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16}
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }

  & > button {
    margin-bottom: 8px;
  }
`
const incompleteFormWarning: MessageDescriptor = {
  id: 'v2.reviewAction.incompleteForm',
  defaultMessage:
    'Please add mandatory information correctly before registering.',
  description: 'The label for warning of incomplete form'
}

function PreviewActionComponent({
  onConfirm,
  formConfig,
  form,
  metadata,
  onReject,
  messages
}: {
  onConfirm: () => void
  onReject?: () => void
  formConfig: FormConfig
  form: ActionFormData
  metadata?: ActionFormData
  messages: {
    title: MessageDescriptor
    description: MessageDescriptor
    onConfirm: MessageDescriptor
  }
}) {
  const intl = useIntl()
  const errorExist = validationErrorsInActionFormExist(
    formConfig,
    form,
    metadata
  )
  const background = errorExist ? 'error' : 'success'
  const descriptionMessage = errorExist
    ? incompleteFormWarning
    : messages.description

  return (
    <Container>
      <UnderLayBackground background={background}>
        <Content>
          <Title>{intl.formatMessage(messages.title)}</Title>
          <Description>{intl.formatMessage(descriptionMessage)}</Description>
          <ActionContainer>
            <Button
              disabled={errorExist}
              id="validateDeclarationBtn"
              size="large"
              type="positive"
              onClick={onConfirm}
            >
              <Icon name="Check" />
              {intl.formatMessage(messages.onConfirm)}
            </Button>
          </ActionContainer>
        </Content>
      </UnderLayBackground>
    </Container>
  )
}

function EditModal({
  copy,
  close
}: {
  copy?: {
    cancel?: MessageDescriptor
    continue?: MessageDescriptor
    title?: MessageDescriptor
    description?: MessageDescriptor
  }
  close: (result: boolean | null) => void
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      actions={[
        <Button
          key="cancel_edit"
          id="cancel_edit"
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(copy?.cancel || reviewMessages.changeModalCancel)}
        </Button>,
        <Button
          key="confirm_edit"
          id="confirm_edit"
          type="primary"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(
            copy?.continue || reviewMessages.changeModalContinue
          )}
        </Button>
      ]}
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={intl.formatMessage(copy?.title || reviewMessages.changeModalTitle)}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(
            copy?.description || reviewMessages.changeModalDescription
          )}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

function ActionModal({
  copy,
  close,
  action
}: {
  copy?: {
    cancel?: MessageDescriptor
    primaryAction?: MessageDescriptor
    title?: MessageDescriptor
    description?: MessageDescriptor
  }
  close: (result: boolean | null) => void
  action: string
}) {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      actions={[
        <Button
          key={'cancel_' + action}
          id={'cancel_' + action}
          type="tertiary"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(copy?.cancel || reviewMessages.actionModalCancel)}
        </Button>,
        <Button
          key={'confirm_' + action}
          id={'confirm_' + action}
          type="primary"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(
            copy?.primaryAction || reviewMessages.actionModalPrimaryAction,
            {
              action
            }
          )}
        </Button>
      ]}
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={intl.formatMessage(
        copy?.title || reviewMessages.actionModalTitle,
        { action }
      )}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {intl.formatMessage(
            copy?.description || reviewMessages.actionModalDescription
          )}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

export const Review = {
  Body: ReviewComponent,
  Actions: PreviewActionComponent,
  EditModal: EditModal,
  ActionModal: ActionModal
}
