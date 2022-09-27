/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  NUMBER,
  TEL,
  TEXT,
  TEXTAREA,
  BirthSection,
  DeathSection,
  IFormField
} from '@client/forms'
import {
  getIdentifiersFromFieldId,
  IMessage
} from '@client/forms/questionConfig'
import { Event } from '@client/utils/gateway'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import {
  getCertificateHandlebar,
  ICustomConfigField
} from '@client/forms/configuration/formConfig/utils'
import { buttonMessages } from '@client/i18n/messages'
import { customFieldFormMessages } from '@client/i18n/messages/views/customFieldForm'
import { ILanguageState, initLanguages } from '@client/i18n/reducer'
import { getDefaultLanguage } from '@client/i18n/utils'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { Select } from '@opencrvs/components/lib/Select'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { camelCase, debounce } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProp } from 'react-intl'
import { connect } from 'react-redux'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'
import {
  Title,
  Label,
  RequiredToggleAction,
  ToolTip,
  ConditionalToggleAction,
  TitleWrapper
} from './components'
import { messages } from '@client/i18n/messages/views/formConfig'
import { Condition } from '@opencrvs/components/lib/icons'

const DEFAULT_MAX_LENGTH = 250

const CInputField = styled(InputField)`
  label {
    ${({ theme }) => theme.fonts.reg14};
  }
`

const CTextInput = styled(TextInput)`
  ${({ theme }) => theme.fonts.reg14};
  height: 32px;
  border: solid 1px ${({ theme }) => theme.colors.grey600};
`

const CTextArea = styled(TextArea)`
  ${({ theme }) => theme.fonts.reg14};
  height: 32px;
  background: ${({ theme }) => theme.colors.white};
  border: solid 1px ${({ theme }) => theme.colors.grey600};
`

const CPrimaryButton = styled(PrimaryButton)`
  border-radius: 4px;
  margin-bottom: 24px;
  :disabled {
    background: ${({ theme }) => theme.colors.grey300};
  }
`

const FieldContainer = styled.div<{ hide?: boolean }>`
  margin-bottom: 30px;
  ${({ hide }) => {
    return hide ? 'display: none' : 'display: block'
  }}
`

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 26px;
`

const ListRow = styled.div`
  ${({ theme }) => theme.fonts.reg14};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px ${({ theme }) => theme.colors.grey200};
  padding: 8px 0;
`

const LanguageSelect = styled(Select)`
  width: 175px;
  border: solid 2px ${({ theme }) => theme.colors.primaryDark};
  border-radius: 2px;
  .react-select__control {
    max-height: 32px;
    min-height: 32px;
  }
  .react-select__value-container {
    display: block;
  }
  div {
    ${({ theme }) => theme.fonts.reg14};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`

const ListColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const CErrorText = styled(ErrorText)`
  width: 200px;
`

type IFormFieldWrapper = { formField: IFormField }

type IProps = {
  event: Event
  selectedField: ICustomConfigField
  section: BirthSection | DeathSection
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
}

type IFullProps = IProps &
  IFormFieldWrapper &
  IntlShapeProp &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps

interface ICustomField {
  label: string
  placeholder: string
  description: string
  tooltip: string
  errorMessage: string
}

interface IFieldForms {
  [key: string]: ICustomField
}

interface ICustomFieldState {
  isFieldDuplicate: boolean
  selectedLanguage: string
  handleBars: string
  maxLength: number
  fieldForms: IFieldForms
}

interface IOptionalContent {
  [key: string]: IMessage[]
}

class CustomFieldToolsComp extends React.Component<
  IFullProps,
  ICustomFieldState
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidUpdate({ selectedField: { fieldId } }: IFullProps) {
    if (fieldId !== this.props.selectedField.fieldId) {
      this.setState(this.getInitialState())
    }
  }

  getInitialState() {
    const defaultLanguage = getDefaultLanguage()
    const languages = this.getLanguages()
    const { selectedField, formField } = this.props

    const fieldForms: { [key: string]: ICustomField } = {}

    Object.keys(languages).forEach((lang) => {
      const label = this.getIntlMessage(selectedField.label, lang)
      fieldForms[lang] = {
        label,
        placeholder: this.getIntlMessage(selectedField.placeholder, lang),
        description: this.getIntlMessage(selectedField.description, lang),
        tooltip: this.getIntlMessage(selectedField.tooltip, lang),
        errorMessage: this.getIntlMessage(selectedField.errorMessage, lang)
      }
    })
    return {
      isFieldDuplicate: false,
      handleBars:
        getCertificateHandlebar(formField) ||
        camelCase(fieldForms[defaultLanguage].label),
      selectedLanguage: defaultLanguage,
      maxLength: selectedField.maxLength ?? DEFAULT_MAX_LENGTH,
      fieldForms
    }
  }

  getIntlMessage(messages: IMessage[] | undefined, lang: string) {
    if (!messages) return ''
    const message = messages.find((message) => message.lang === lang)
    return message && message.descriptor
      ? message.descriptor.defaultMessage
      : ''
  }

  getLanguages(): ILanguageState {
    return initLanguages()
  }

  setValue(field: string, value: string) {
    const language = this.state.selectedLanguage
    this.setState({
      fieldForms: {
        ...this.state.fieldForms,
        [language]: {
          ...this.state.fieldForms[language],
          [field]: value
        }
      }
    })
  }

  isFormValid(): boolean {
    for (const lang in this.getLanguages()) {
      if (Boolean(this.state.fieldForms[lang].label) === false) return false
    }
    return true
  }

  generateNewFieldID() {
    const { event, sectionId, groupId } = getIdentifiersFromFieldId(
      this.props.selectedField.fieldId
    )

    return `${event}.${sectionId}.${groupId}.${this.state.handleBars}`
  }

  doesContentExist(
    languages: ILanguageState,
    fieldForms: IFieldForms,
    key: string
  ): boolean {
    let contentExists = false
    for (const lang in languages) {
      const customField = fieldForms[lang]
      if (customField[key as keyof typeof customField]) {
        contentExists = true
      }
    }
    return contentExists
  }

  populateOptionalContent(
    fieldName: string,
    languages: ILanguageState,
    fieldForms: IFieldForms,
    key: string,
    optionalContent: IOptionalContent
  ) {
    if (this.doesContentExist(languages, fieldForms, key)) {
      optionalContent[key] = []
      for (const lang in languages) {
        const customField = fieldForms[lang]
        optionalContent[key].push({
          lang,
          descriptor: {
            id: `form.customField.${key}.${fieldName}`,
            description: 'Custom field attribute',
            defaultMessage: customField[key as keyof typeof customField] || ' '
          }
        })
      }
    }
  }

  prepareModifiedFormField(): ICustomConfigField {
    const { selectedField } = this.props
    const { fieldForms, handleBars } = this.state
    const languages = this.getLanguages()
    const newFieldID = this.generateNewFieldID()

    // later we can check the field type and not populate any content that isnt required for the type
    const optionalContent: IOptionalContent = {}
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'placeholder',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'description',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'tooltip',
      optionalContent
    )
    this.populateOptionalContent(
      handleBars,
      languages,
      fieldForms,
      'errorMessage',
      optionalContent
    )

    const label = Object.keys(languages).map((lang) => ({
      lang,
      descriptor: {
        id: `form.customField.label.${handleBars}`,
        description: 'Custom field attribute',
        defaultMessage: this.state.fieldForms[lang].label
      }
    }))

    const modifiedField = {
      ...selectedField,
      placeholder: optionalContent.placeholder,
      tooltip: optionalContent.tooltip,
      description: optionalContent.description,
      errorMessage: optionalContent.errorMessage,
      fieldName: handleBars,
      fieldId: newFieldID,
      /* We can't let maxlength be 0 as it doesn't make any sense */
      maxLength: this.state.maxLength || DEFAULT_MAX_LENGTH,
      label
    }
    return modifiedField
  }

  isFieldNameDuplicate(): boolean {
    const { fieldsMap, selectedField } = this.props
    const newGeneratedFieldID = this.generateNewFieldID()

    if (selectedField.fieldId === newGeneratedFieldID) {
      return false
    }

    return newGeneratedFieldID in fieldsMap
  }

  getHeadingText(): string {
    const { selectedField, intl } = this.props

    switch (selectedField.fieldType) {
      case TEXT:
        return intl.formatMessage(
          customFieldFormMessages.customTextFieldHeading
        )
      case TEXTAREA:
        return intl.formatMessage(customFieldFormMessages.customTextAreaHeading)
      case NUMBER:
        return intl.formatMessage(
          customFieldFormMessages.customNumberFieldHeading
        )
      case TEL:
        return intl.formatMessage(
          customFieldFormMessages.customPhoneFieldHeading
        )
      default:
        return intl.formatMessage(
          customFieldFormMessages.customTextFieldHeading
        )
    }
  }

  getLanguageDropDown() {
    const initializeLanguages = this.getLanguages()
    const languageOptions = []
    for (const index in initializeLanguages) {
      languageOptions.push({
        label: initializeLanguages[index].displayName,
        value: index
      })
    }

    return (
      languageOptions.length > 1 && (
        <FieldContainer>
          <LanguageSelect
            hideBorder={true}
            value={this.state.selectedLanguage}
            onChange={(selectedLanguage: string) => {
              this.setState({ selectedLanguage })
            }}
            options={languageOptions}
          />
        </FieldContainer>
      )
    )
  }

  toggleButtons() {
    const { intl, selectedField } = this.props
    return (
      <ListContainer>
        <Title>{this.getHeadingText()}</Title>
        <ListViewSimplified bottomBorder>
          <ListViewItemSimplified
            label={
              <Label>
                {intl.formatMessage(customFieldFormMessages.requiredFieldLabel)}
                <ToolTip
                  label={intl.formatMessage(
                    messages.requiredForRegistrationTooltip
                  )}
                  id={'required-field-label'}
                />
              </Label>
            }
            actions={<RequiredToggleAction {...selectedField} />}
          />
          <ListViewItemSimplified
            label={
              <Label>
                {intl.formatMessage(
                  customFieldFormMessages.conditionalFieldLabel
                )}
                <ToolTip
                  label={intl.formatMessage(
                    messages.conditionalForRegistrationTooltip
                  )}
                  id={'conditional-field-label'}
                />
              </Label>
            }
            actions={<ConditionalToggleAction {...selectedField} />}
          />
        </ListViewSimplified>
      </ListContainer>
    )
  }

  conditionalParameters() {
    const { intl } = this.props
    return (
      <ListContainer>
        <TitleWrapper>
          <Condition color="grey600" />
          <Title>
            {intl.formatMessage(
              customFieldFormMessages.conditionalFieldHeaderLabel
            )}
          </Title>
        </TitleWrapper>
        <ListViewSimplified bottomBorder>
          <ListViewItemSimplified
            label={intl.formatMessage(
              customFieldFormMessages.conditionalFieldDesc
            )}
            actions={<></>}
          />
        </ListViewSimplified>
      </ListContainer>
    )
  }

  inputFields() {
    const {
      intl,
      selectedField,
      modifyConfigField,
      formField,
      setSelectedField
    } = this.props
    const languages = this.getLanguages()
    const defaultLanguage = getDefaultLanguage()
    const debouncedNullifySelectedField = debounce(() => {
      setSelectedField(null)
    }, 300)
    return (
      <>
        {Object.keys(languages).map((language, index) => {
          return (
            <React.Fragment key={index}>
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  id={`custom-form-label-${language}`}
                  label={intl.formatMessage(customFieldFormMessages.label)}
                  touched={true}
                >
                  <CTextInput
                    value={this.state.fieldForms[language].label}
                    onChange={(event: any) => {
                      const { value } = event.target
                      this.setState({
                        handleBars:
                          defaultLanguage === this.state.selectedLanguage
                            ? camelCase(
                                value || getCertificateHandlebar(formField)
                              )
                            : this.state.handleBars,
                        fieldForms: {
                          ...this.state.fieldForms,
                          [this.state.selectedLanguage]: {
                            ...this.state.fieldForms[
                              this.state.selectedLanguage
                            ],
                            label: value
                          }
                        }
                      })
                    }}
                  />
                </CInputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-placeholder-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.placeholderLabel
                  )}
                  touched={false}
                >
                  <CTextInput
                    value={this.state.fieldForms[language].placeholder}
                    onChange={(event: any) =>
                      this.setValue('placeholder', event.target.value)
                    }
                  />
                </CInputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  id={`custom-form-description-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.descriptionLabel
                  )}
                  required={false}
                  touched={false}
                >
                  <CTextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this.setValue('description', event.target.value)
                      },
                      value: this.state.fieldForms[language].description
                    }}
                  />
                </CInputField>
              </FieldContainer>

              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-tooltip-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.tooltipLabel
                  )}
                  touched={false}
                >
                  <CTextInput
                    onChange={(event: any) =>
                      this.setValue('tooltip', event.target.value)
                    }
                    value={this.state.fieldForms[language].tooltip}
                  />
                </CInputField>
              </FieldContainer>

              {/*errorMessage is not implemented yet*/}
              {/*
              <FieldContainer hide={language !== this.state.selectedLanguage}>
                <CInputField
                  required={false}
                  id={`custom-form-error-message-${language}`}
                  label={intl.formatMessage(
                    customFieldFormMessages.errorMessage
                  )}
                  touched={false}
                >
                  <CTextArea
                    ignoreMediaQuery={true}
                    {...{
                      onChange: (event: any) => {
                        this.setValue('errorMessage', event.target.value)
                      },
                      value: this.state.fieldForms[language].errorMessage
                    }}
                  />
                </CInputField>
              </FieldContainer>
            */}
            </React.Fragment>
          )
        })}
        <FieldContainer>
          <CInputField
            required={false}
            id="custom-form-max-length"
            label={intl.formatMessage(customFieldFormMessages.maxLengthLabel)}
            touched={false}
          >
            <CTextInput
              type="number"
              defaultValue={this.state.maxLength}
              onChange={(event) =>
                this.setState({
                  maxLength: +event.target.value
                })
              }
            />
          </CInputField>
        </FieldContainer>
        <ListContainer>
          <ListRow>
            <ListColumn>
              <CPrimaryButton
                onClick={() => {
                  if (this.isFieldNameDuplicate()) {
                    this.setState({
                      isFieldDuplicate: true
                    })
                    return
                  }
                  const modifiedField = this.prepareModifiedFormField()
                  modifyConfigField(selectedField.fieldId, modifiedField)
                  debouncedNullifySelectedField()
                }}
                disabled={!this.isFormValid()}
              >
                {intl.formatMessage(buttonMessages.save)}
              </CPrimaryButton>
            </ListColumn>
          </ListRow>
        </ListContainer>
      </>
    )
  }

  render(): React.ReactNode {
    const { intl, selectedField } = this.props
    return (
      <>
        {this.toggleButtons()}
        {selectedField.conditionals ? this.conditionalParameters() : null}
        {this.getLanguageDropDown()}
        {this.inputFields()}
        {this.state.isFieldDuplicate && (
          <CErrorText ignoreMediaQuery={true}>
            {intl.formatMessage(customFieldFormMessages.duplicateField)}
          </CErrorText>
        )}
      </>
    )
  }
}

function withFieldDefinition<T extends { selectedField: ICustomConfigField }>(
  WrappedComponent: React.ComponentType<T & IFormFieldWrapper>
) {
  return function WithFieldDefinition(props: T) {
    const formField = useFieldDefinition(props.selectedField)
    return <WrappedComponent formField={formField} {...props} />
  }
}

const mapStateToProps = (store: IStoreState, props: IProps) => {
  const { event, section } = props
  return {
    fieldsMap: selectConfigFields(store, event, section)
  }
}

const mapDispatchToProps = {
  modifyConfigField
}

export const CustomFieldTools = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withFieldDefinition(CustomFieldToolsComp)))
