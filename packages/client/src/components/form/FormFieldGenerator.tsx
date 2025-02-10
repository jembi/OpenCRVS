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
import * as React from 'react'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { RadioGroup, RadioSize } from '@opencrvs/components/lib/Radio'
import { Checkbox, CheckboxGroup } from '@opencrvs/components/lib/Checkbox'
import { TextArea } from '@opencrvs/components/lib/TextArea'
import { Select } from '@opencrvs/components/lib/Select'
import { DateField } from '@opencrvs/components/lib/DateField'
import { TimeField } from '@opencrvs/components/lib/TimeField'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Link } from '@opencrvs/components/lib/Link'
import { Text } from '@opencrvs/components/lib/Text'
import {
  internationaliseFieldObject,
  getConditionalActionsForField,
  getFieldOptions,
  getFieldLabel,
  getFieldLabelToolTip,
  getFieldOptionsByValueMapper,
  getFieldType,
  getQueryData,
  getVisibleOptions,
  getFieldHelperText,
  getDependentFields,
  evalExpressionInFieldDefinition,
  handleInitialValue
} from '@client/forms/utils'
import styled, { keyframes } from 'styled-components'
import { gqlToDraftTransformer } from '@client/transformer'
import {
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  RADIO_GROUP,
  CHECKBOX_GROUP,
  CHECKBOX,
  DATE,
  DOCUMENT_UPLOADER_WITH_OPTION,
  TEXTAREA,
  TEL,
  WARNING,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  IDynamicFormField,
  IFileValue,
  IForm,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nFormField,
  INFORMATIVE_RADIO_GROUP,
  ISelectFormFieldWithOptions,
  ITextFormField,
  Ii18nTextFormField,
  LINK,
  BULLET_LIST,
  NUMBER,
  BIG_NUMBER,
  PARAGRAPH,
  DYNAMIC_LIST,
  IDynamicListFormField,
  IListFormField,
  IFormData,
  FETCH_BUTTON,
  ILoaderButton,
  FIELD_GROUP_TITLE,
  IFormSection,
  SIMPLE_DOCUMENT_UPLOADER,
  IAttachmentValue,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  Ii18nRadioGroupWithNestedFieldsFormField,
  LOCATION_SEARCH_INPUT,
  TEXT,
  DATE_RANGE_PICKER,
  IDateRangePickerValue,
  TIME,
  DIVIDER,
  HEADING3,
  SUBSECTION_HEADER,
  HIDDEN,
  SIGNATURE,
  BUTTON,
  HTTP,
  InitialValue,
  DependencyInfo,
  Ii18nButtonFormField,
  LINK_BUTTON,
  IDocumentUploaderWithOptionsFormField,
  ID_READER,
  ID_VERIFICATION_BANNER
} from '@client/forms'
import { getValidationErrorsForForm, Errors } from '@client/forms/validation'
import { InputField } from '@client/components/form/InputField'
import { FetchButtonField } from '@client/components/form/FetchButton'

import { InformativeRadioGroup } from '@client/views/PrintCertificate/InformativeRadioGroup'
import { DocumentUploaderWithOption } from './DocumentUploadField/DocumentUploaderWithOption'
import {
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor,
  useIntl
} from 'react-intl'
import {
  FastField,
  Field,
  FormikProps,
  FieldProps,
  FormikTouched,
  FormikValues,
  Formik
} from 'formik'
import { IOfflineData } from '@client/offline/reducer'
import { isEqual, flatten, cloneDeep, set } from 'lodash'
import { SimpleDocumentUploader } from './DocumentUploadField/SimpleDocumentUploader'
import { getOfflineData } from '@client/offline/selectors'
import { dynamicDispatch } from '@client/declarations'
import { useDispatch, useSelector } from 'react-redux'
import { LocationSearch } from '@opencrvs/components/lib/LocationSearch'
import { REGEXP_NUMBER_INPUT_NON_NUMERIC } from '@client/utils/constants'
import { isMobileDevice } from '@client/utils/commonUtils'
import { generateLocations } from '@client/utils/locationUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { DateRangePickerForFormField } from '@client/components/DateRangePickerForFormField'
import { IAdvancedSearchFormState } from '@client/search/advancedSearch/utils'
import { UserDetails } from '@client/utils/userUtils'
import {
  BulletList,
  Divider,
  IDReader,
  InputLabel,
  Stack
} from '@opencrvs/components'
import { Heading2, Heading3 } from '@opencrvs/components/lib/Headings/Headings'
import { SignatureUploader } from './SignatureField/SignatureUploader'
import { ButtonField } from '@client/components/form/Button'
import { getListOfLocations } from '@client/utils/validate'
import { LinkButtonField } from '@client/components/form/LinkButton'
import { ReaderGenerator } from './ReaderGenerator'
import { IDVerificationBanner } from './IDVerification/Banner'

const SignatureField = styled(Stack)`
  margin-top: 8px;
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div<{
  ignoreBottomMargin?: boolean
}>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '22px'};
`

function handleSelectFocus(id: string, isSearchable: boolean) {
  if (isMobileDevice() && isSearchable) {
    setTimeout(() => {
      const inputElement = document.getElementById(`${id}-form-input`)

      if (inputElement) {
        inputElement.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }, 20)
  }
}

type GeneratedInputFieldProps = {
  fieldDefinition: Ii18nFormField
  fields: IFormField[]
  values: IFormSectionData
  setFieldValue: (name: string, value: IFormFieldValue) => void
  onClick?: () => void
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  resetDependentSelectValues: (name: string) => void
  resetNestedInputValues?: (field: Ii18nFormField) => void
  nestedFields?: { [key: string]: JSX.Element[] }
  value: IFormFieldValue
  touched: boolean
  error: string
  draftData: IFormData
  disabled?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  setFieldTouched: FormikProps<IFormSectionData>['setFieldTouched']
} & Omit<IDispatchProps, 'writeDeclaration'>

const GeneratedInputField = React.memo<GeneratedInputFieldProps>(
  ({
    fieldDefinition,
    onChange,
    onBlur,
    setFieldValue,
    resetDependentSelectValues,
    resetNestedInputValues,
    error,
    touched,
    value,
    nestedFields,
    draftData,
    disabled,
    dynamicDispatch,
    onUploadingStateChanged,
    setFieldTouched,
    requiredErrorMessage,
    fields,
    values
  }) => {
    const inputFieldProps = {
      id: fieldDefinition.name,
      label: fieldDefinition.label,
      helperText: fieldDefinition.helperText,
      tooltip: fieldDefinition.tooltip,
      description: fieldDefinition.description,
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled,
      prefix: fieldDefinition.prefix,
      postfix: fieldDefinition.postfix,
      unit: fieldDefinition.unit,
      hideAsterisk: fieldDefinition.hideAsterisk,
      hideInputHeader: fieldDefinition.hideHeader,
      error,
      touched
    }

    const intl = useIntl()
    const onChangeGroupInput = React.useCallback(
      (val: string) => setFieldValue(fieldDefinition.name, val),
      [fieldDefinition.name, setFieldValue]
    )

    const inputProps = {
      id: fieldDefinition.name,
      onChange,
      onBlur,
      value,
      disabled: fieldDefinition.disabled ?? disabled,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder: fieldDefinition.placeholder
    }
    if (fieldDefinition.type === SELECT_WITH_OPTIONS) {
      return (
        <InputField {...inputFieldProps}>
          <Select
            {...inputProps}
            isDisabled={fieldDefinition.disabled}
            value={value as string}
            onChange={(val: string) => {
              setFieldValue(fieldDefinition.name, val)
              resetDependentSelectValues(fieldDefinition.name)
            }}
            onFocus={() =>
              handleSelectFocus(
                fieldDefinition.name,
                fieldDefinition.options.length > 10
              )
            }
            options={fieldDefinition.options}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === ID_READER) {
      return (
        <InputField {...inputFieldProps}>
          <IDReader
            dividerLabel={fieldDefinition.dividerLabel}
            manualInputInstructionLabel={
              fieldDefinition.manualInputInstructionLabel
            }
          >
            <ReaderGenerator
              readers={fieldDefinition.readers}
              form={values}
              field={fieldDefinition}
              draft={draftData}
              fields={fields}
              setFieldValue={setFieldValue}
            />
          </IDReader>
        </InputField>
      )
    }
    if (fieldDefinition.type === ID_VERIFICATION_BANNER) {
      return (
        <IDVerificationBanner
          type={fieldDefinition.bannerType}
          idFieldName={fieldDefinition.idFieldName}
          setFieldValue={setFieldValue}
        />
      )
    }

    if (fieldDefinition.type === DOCUMENT_UPLOADER_WITH_OPTION) {
      return (
        <InputField {...inputFieldProps}>
          <DocumentUploaderWithOption
            {...inputProps}
            name={fieldDefinition.name}
            options={fieldDefinition.options}
            files={value as IFileValue[]}
            extraValue={fieldDefinition.extraValue || ''}
            hideOnEmptyOption={fieldDefinition.hideOnEmptyOption}
            onComplete={(files: IFileValue[]) => {
              /*
               * calling both setFieldTouched and setFieldValue causes the validate
               * function to be called twice, once with the stale values (due to
               * setFieldTouched) and the other with the updated values (due to
               * setFieldValue). So if setFieldTouched is called after
               * setFieldValue then wrong validations are shown due to the stale
               * values. We can prevent that by supplying shouldRevalidate =
               * false to the setFieldTouch function or calling it before
               * calling setFieldValue.
               */
              setFieldTouched(fieldDefinition.name, true, false)
              setFieldValue(fieldDefinition.name, files)
            }}
            compressImagesToSizeMB={fieldDefinition.compressImagesToSizeMB}
            maxSizeMB={fieldDefinition.maxSizeMB}
            onUploadingStateChanged={onUploadingStateChanged}
            requiredErrorMessage={requiredErrorMessage}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === SIMPLE_DOCUMENT_UPLOADER) {
      return (
        <SimpleDocumentUploader
          {...inputProps}
          name={fieldDefinition.name}
          label={fieldDefinition.label}
          description={fieldDefinition.description}
          allowedDocType={fieldDefinition.allowedDocType}
          files={value as IAttachmentValue}
          error={error}
          onComplete={(file) => {
            setFieldTouched(fieldDefinition.name, true, false)
            setFieldValue(fieldDefinition.name, file)
          }}
          onUploadingStateChanged={onUploadingStateChanged}
          requiredErrorMessage={requiredErrorMessage}
        />
      )
    }
    if (fieldDefinition.type === RADIO_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup
            {...inputProps}
            size={fieldDefinition.size}
            onChange={(val: string) => {
              resetDependentSelectValues(fieldDefinition.name)
              setFieldValue(fieldDefinition.name, val)
            }}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string}
            notice={fieldDefinition.notice}
            flexDirection={fieldDefinition.flexDirection}
          />
        </InputField>
      )
    }

    if (
      fieldDefinition.type === RADIO_GROUP_WITH_NESTED_FIELDS &&
      nestedFields &&
      resetNestedInputValues
    ) {
      const visibleRadioOptions = getVisibleOptions(
        fieldDefinition.options,
        draftData as IFormData
      )
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup
            {...inputProps}
            size={RadioSize.LARGE}
            onChange={(val: string) => {
              setFieldValue(`${fieldDefinition.name}.value`, val)
              resetNestedInputValues(fieldDefinition)
            }}
            nestedFields={nestedFields}
            options={visibleRadioOptions}
            name={fieldDefinition.name}
            value={value as string}
            notice={fieldDefinition.notice}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === INFORMATIVE_RADIO_GROUP) {
      return (
        <InformativeRadioGroup
          inputProps={inputProps}
          value={value as string}
          onSetFieldValue={setFieldValue}
          fieldDefinition={fieldDefinition}
          inputFieldProps={inputFieldProps}
        />
      )
    }

    if (fieldDefinition.type === CHECKBOX_GROUP) {
      return (
        <InputField {...inputFieldProps}>
          <CheckboxGroup
            {...inputProps}
            options={fieldDefinition.options}
            name={fieldDefinition.name}
            value={value as string[]}
            onChange={(val: string[]) =>
              setFieldValue(fieldDefinition.name, val)
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === CHECKBOX) {
      const { checkedValue = true, uncheckedValue = false } = fieldDefinition
      return (
        <InputField {...inputFieldProps}>
          <Checkbox
            {...inputProps}
            label={fieldDefinition.label}
            name={fieldDefinition.name}
            value={String(value)}
            selected={(value as string) === checkedValue}
            onChange={(event: { target: { value: string } }) =>
              setFieldValue(
                fieldDefinition.name,
                event.target.value === String(checkedValue)
                  ? uncheckedValue
                  : checkedValue
              )
            }
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === DATE) {
      return (
        <InputField {...inputFieldProps}>
          <DateField
            {...inputProps}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: string) => setFieldValue(fieldDefinition.name, val)}
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TIME) {
      return (
        <InputField {...inputFieldProps}>
          <TimeField
            {...inputProps}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={onChangeGroupInput}
            value={value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DATE_RANGE_PICKER) {
      return (
        <InputField {...inputFieldProps}>
          <DateRangePickerForFormField
            inputProps={{ ...inputProps }}
            notice={fieldDefinition.notice}
            ignorePlaceHolder={fieldDefinition.ignorePlaceHolder}
            onChange={(val: IDateRangePickerValue) =>
              setFieldValue(fieldDefinition.name, val)
            }
            value={value as IDateRangePickerValue}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEXTAREA) {
      return (
        <InputField {...inputFieldProps}>
          <TextArea
            {...inputProps}
            maxLength={fieldDefinition.maxLength}
            value={value.toString()}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === TEL) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="tel"
            {...inputProps}
            isSmallSized={fieldDefinition.isSmallSized}
            value={inputProps.value as string}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === DIVIDER) {
      return <Divider />
    }
    if (fieldDefinition.type === HEADING3) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === SUBSECTION_HEADER) {
      return (
        <>
          <Heading2>{fieldDefinition.label}</Heading2>
        </>
      )
    }
    if (fieldDefinition.type === FIELD_GROUP_TITLE) {
      return <Heading3>{fieldDefinition.label}</Heading3>
    }
    if (fieldDefinition.type === PARAGRAPH) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.name]: value as any
      })

      return (
        <Text variant={fieldDefinition.fontVariant ?? 'reg16'} element="p">
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Text>
      )
    }
    if (fieldDefinition.type === BULLET_LIST) {
      return (
        <BulletList
          font={'reg16'}
          {...inputProps}
          items={fieldDefinition.items}
        />
      )
    }
    if (fieldDefinition.type === NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="number"
            step={fieldDefinition.step}
            max={fieldDefinition.max}
            {...inputProps}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key.match(REGEXP_NUMBER_INPUT_NON_NUMERIC)) {
                e.preventDefault()
              }
              const maxLength = fieldDefinition.maxLength
              if (maxLength && e.currentTarget.value.length >= maxLength) {
                e.preventDefault()
              }
            }}
            value={inputProps.value as string}
            maxLength={fieldDefinition.maxLength}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === BIG_NUMBER) {
      return (
        <InputField {...inputFieldProps}>
          <TextInput
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            step={fieldDefinition.step}
            {...inputProps}
            value={inputProps.value as string}
            onWheel={(event: React.WheelEvent<HTMLInputElement>) => {
              event.currentTarget.blur()
            }}
          />
        </InputField>
      )
    }
    if (fieldDefinition.type === WARNING) {
      return <ErrorText>{fieldDefinition.label}</ErrorText>
    }

    if (fieldDefinition.type === LINK) {
      return (
        <Link
          type="reg16"
          onClick={() => setFieldValue(fieldDefinition.name, true)}
        >
          {fieldDefinition.label}
        </Link>
      )
    }

    if (
      fieldDefinition.type === LOCATION_SEARCH_INPUT &&
      fieldDefinition.locationList
    ) {
      const selectedLocation = fieldDefinition.locationList.find(
        (location) => location.id === value
      )

      return (
        <InputField {...inputFieldProps}>
          <LocationSearch
            buttonLabel={intl.formatMessage(buttonMessages.search)}
            {...inputProps}
            selectedLocation={selectedLocation}
            locationList={fieldDefinition.locationList}
            searchHandler={(item) => {
              setFieldValue(fieldDefinition.name, item.id)
              if (fieldDefinition.dispatchOptions) {
                dynamicDispatch(fieldDefinition.dispatchOptions.action, {
                  [fieldDefinition.dispatchOptions.payloadKey]: item.id
                })
              }
            }}
          />
        </InputField>
      )
    }

    if (fieldDefinition.type === FETCH_BUTTON) {
      return (
        <FetchButtonField
          id={fieldDefinition.name}
          queryData={fieldDefinition.queryData}
          modalTitle={fieldDefinition.modalTitle}
          label={fieldDefinition.label}
          successTitle={fieldDefinition.successTitle}
          errorTitle={fieldDefinition.errorTitle}
          onFetch={fieldDefinition.onFetch}
          isDisabled={disabled}
        />
      )
    }

    if (fieldDefinition.type === LINK_BUTTON) {
      return (
        <LinkButtonField
          form={values}
          draft={draftData}
          fieldDefinition={fieldDefinition}
          fields={fields}
          setFieldValue={setFieldValue}
          isDisabled={disabled}
        />
      )
    }

    if (fieldDefinition.type === HIDDEN) {
      const { error, touched, ...allowedInputProps } = inputProps

      return (
        <input
          type="hidden"
          {...allowedInputProps}
          value={inputProps.value as string}
        />
      )
    }
    if (fieldDefinition.type === SIGNATURE) {
      const {
        name,
        helperText,
        required,
        label,
        maxSizeMb,
        allowedFileFormats
      } = fieldDefinition
      return (
        <SignatureField direction="column" gap={8} alignItems="start">
          <InputLabel
            {...inputFieldProps}
            htmlFor={name}
            inputDescriptor={helperText}
          >
            {label}
          </InputLabel>
          <SignatureUploader
            {...inputProps}
            name={name}
            modalTitle={label}
            value={value as string}
            maxSizeMb={maxSizeMb}
            allowedFileFormats={allowedFileFormats}
            required={required}
            onChange={(sig) => setFieldValue(name, sig)}
          />
        </SignatureField>
      )
    }

    if (fieldDefinition.type === HTTP) {
      return null
    }

    if (fieldDefinition.type === BUTTON) {
      return (
        <InputField {...inputFieldProps}>
          <ButtonField
            fields={fields}
            fieldDefinition={fieldDefinition as Ii18nButtonFormField}
            values={values}
            draftData={draftData}
            setFieldValue={setFieldValue}
            disabled={disabled}
            setFieldTouched={setFieldTouched}
          />
        </InputField>
      )
    }

    return (
      <InputField {...inputFieldProps}>
        <TextInput
          type="text"
          {...inputProps}
          value={inputProps.value as string}
          maxLength={(fieldDefinition as Ii18nTextFormField).maxLength}
          isDisabled={disabled}
        />
      </InputField>
    )
  },

  // This is a hack to workaround slow renders of Selects.
  // A proper solution would not pass new props to this component everytime,
  // rather they should pass the variable / function references.
  // This may be achieved by useMemo / useCallback'ing the props before passing.

  // If the function returns false, props are not equal and it will re-render
  // If function returns true, they are equal and no rerender happens
  (prevProps, nextProps) =>
    prevProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    nextProps.fieldDefinition.type === 'SELECT_WITH_OPTIONS' &&
    prevProps.value === nextProps.value &&
    prevProps.touched === nextProps.touched &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled &&
    isEqual(
      prevProps.fieldDefinition.options,
      nextProps.fieldDefinition.options
    )
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'

export const mapFieldsToValues = (
  fields: IFormField[],
  ...evalParams: [IFormSectionData, IOfflineData, IFormData, UserDetails | null]
) =>
  fields.reduce((memo, field) => {
    let fieldInitialValue = handleInitialValue(
      field.initialValue as InitialValue,
      ...evalParams
    )

    if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS && !field.initialValue) {
      const nestedFieldsFlatted = flatten(Object.values(field.nestedFields))

      const nestedInitialValues = nestedFieldsFlatted.reduce(
        (nestedValues, nestedField) => ({
          ...nestedValues,
          [nestedField.name]: handleInitialValue(
            nestedField.initialValue as InitialValue,
            ...evalParams
          )
        }),
        {}
      )

      fieldInitialValue = {
        value: handleInitialValue(
          field.initialValue as InitialValue,
          ...evalParams
        ),
        nestedFields: nestedInitialValues
      }
    }

    return { ...memo, [field.name]: fieldInitialValue }
  }, {})

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void
interface IFormSectionProps {
  fields: IFormField[]
  id: string
  fieldsToShowValidationErrors?: IFormField[]
  setAllFieldsDirty: boolean
  onChange: (values: IFormSectionData) => void
  draftData: IFormData
  onSetTouched?: (func: ISetTouchedFunction) => void
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: IAdvancedSearchFormState
}

interface IStateProps {
  offlineCountryConfig: IOfflineData
  userDetails: UserDetails | null
}

interface IDispatchProps {
  dynamicDispatch: typeof dynamicDispatch
}

type Props = IFormSectionProps &
  IStateProps &
  IDispatchProps &
  FormikProps<IFormSectionData> &
  IntlShapeProps

interface IQueryData {
  [key: string]: any
}

export interface ITouchedNestedFields {
  value: boolean
  nestedFields: {
    [fieldName: string]: boolean
  }
}

class FormSectionComponent extends React.Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const userChangedForm = !isEqual(this.props.values, prevProps.values)
    const sectionChanged = prevProps.id !== this.props.id

    if (userChangedForm) {
      prevProps.onChange(this.props.values)
    }

    if (sectionChanged) {
      prevProps.resetForm()
      if (this.props.setAllFieldsDirty) {
        this.showValidationErrors(this.props.fields)
      } else if (
        this.props.fieldsToShowValidationErrors &&
        this.props.fieldsToShowValidationErrors.length > 0
      ) {
        this.showValidationErrors(this.props.fieldsToShowValidationErrors)
      }
    }
  }

  async componentDidMount() {
    if (this.props.setAllFieldsDirty) {
      this.showValidationErrors(this.props.fields)
    }

    if (this.props.onSetTouched) {
      this.props.onSetTouched(this.props.setTouched)
    }

    if (window.location.hash) {
      setTimeout(() => {
        const newScroll = document.documentElement.scrollTop - 100
        window.scrollTo(0, newScroll)

        const focusedElementId = window.location.hash.replace('#', '')
        let focusedElement = document.querySelector(
          `input[id*="${focusedElementId}"]`
        ) as HTMLElement
        if (focusedElement === null) {
          // Handling for Select
          focusedElement = document.querySelector(
            `${window.location.hash} input`
          ) as HTMLElement
          focusedElement && focusedElement.focus()
        } else {
          // Handling for Input
          focusedElement && focusedElement.focus()
        }
      }, 0)
    }
  }

  showValidationErrors(fields: IFormField[]) {
    const touched = fields.reduce((memo, field) => {
      let fieldTouched: boolean | ITouchedNestedFields = true
      if (field.nestedFields) {
        fieldTouched = {
          value: true,
          nestedFields: flatten(Object.values(field.nestedFields)).reduce(
            (nestedMemo, nestedField) => ({
              ...nestedMemo,
              [nestedField.name]: true
            }),
            {}
          )
        }
      }
      return { ...memo, [field.name]: fieldTouched }
    }, {})

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<any>) => {
    this.props.setFieldTouched(e.target.name)
  }

  setFieldValuesWithDependency = (
    fieldName: string,
    value: IFormFieldValue
  ) => {
    const updatedValues = cloneDeep(this.props.values)
    set(updatedValues, fieldName, value)
    const updateDependentFields = (fieldName: string) => {
      const dependentFields = getDependentFields(this.props.fields, fieldName)
      for (const field of dependentFields) {
        updatedValues[field.name] = evalExpressionInFieldDefinition(
          (field.initialValue as DependencyInfo).expression,
          updatedValues,
          this.props.offlineCountryConfig,
          this.props.draftData,
          this.props.userDetails
        )
        updateDependentFields(field.name)
      }
    }
    updateDependentFields(fieldName)

    this.props.setValues(updatedValues)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) =>
        (field.type === SELECT_WITH_DYNAMIC_OPTIONS &&
          field.dynamicOptions.dependency === fieldName) ||
        (field.type === TEXT && field.dependency === fieldName)
    )

    fieldsToReset.forEach((fieldToReset) => {
      this.props.setFieldValue(fieldToReset.name, '')
      this.resetDependentSelectValues(fieldToReset.name)
    })
  }

  resetNestedInputValues = (parentField: Ii18nFormField) => {
    const nestedFields = (
      parentField as Ii18nRadioGroupWithNestedFieldsFormField
    ).nestedFields
    const nestedFieldsToReset = flatten(
      Object.keys(nestedFields).map((key) => nestedFields[key])
    )

    nestedFieldsToReset.forEach((nestedField) => {
      this.props.setFieldValue(
        `${parentField.name}.nestedFields.${nestedField.name}`,
        ''
      )
    })
  }

  render() {
    const {
      values,
      fields,
      setFieldTouched,
      touched,
      offlineCountryConfig,
      intl,
      draftData,
      userDetails,
      setValues,
      dynamicDispatch
    } = this.props

    const language = this.props.intl.locale

    const errors = this.props.errors as unknown as Errors

    const sectionName = this.props.id.split('-')[0]

    return (
      <section>
        {fields.map((field) => {
          let error: string
          const fieldErrors = errors[field.name] && errors[field.name].errors

          if (fieldErrors && fieldErrors.length > 0) {
            const [firstError] = fieldErrors
            error = intl.formatMessage(firstError.message, firstError.props)
          }

          const conditionalActions: string[] = getConditionalActionsForField(
            field,
            { ...draftData?.[sectionName], ...values },
            offlineCountryConfig,
            draftData,
            userDetails
          )

          if (conditionalActions.includes('hide')) {
            return null
          }

          const isFieldDisabled = conditionalActions.includes('disable')
          const isDateField =
            field.type === DATE ||
            (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
              getFieldType(field as IDynamicFormField, values) === DATE)

          const isDateRangePickerField = field.type === DATE_RANGE_PICKER

          const dateFields = [
            `${field.name}-dd`,
            `${field.name}-mm`,
            `${field.name}-yyyy`
          ]
          // for date range picker fields
          const dateRangeFields = [
            `${field.name}exact-dd`,
            `${field.name}exact-mm`,
            `${field.name}exact-yyyy`
          ]

          const areFieldsTouched = (fields: string[]) =>
            fields.every((field) => touched[field])

          if (isDateField && areFieldsTouched(dateFields)) {
            touched[field.name] = areFieldsTouched(dateFields)
          }

          if (isDateRangePickerField && areFieldsTouched(dateRangeFields)) {
            touched[field.name] = areFieldsTouched(dateRangeFields)
          }

          const withDynamicallyGeneratedFields =
            field.type === SELECT_WITH_OPTIONS ||
            field.type === SELECT_WITH_DYNAMIC_OPTIONS
              ? ({
                  ...field,
                  type: SELECT_WITH_OPTIONS,
                  options: getFieldOptions(
                    sectionName,
                    field,
                    values,
                    offlineCountryConfig,
                    draftData
                  )
                } satisfies ISelectFormFieldWithOptions)
              : field.type === DOCUMENT_UPLOADER_WITH_OPTION
              ? ({
                  ...field,
                  options: getFieldOptions(
                    sectionName,
                    field,
                    values,
                    offlineCountryConfig,
                    draftData
                  )
                } satisfies IDocumentUploaderWithOptionsFormField)
              : field.type === FIELD_WITH_DYNAMIC_DEFINITIONS
              ? ({
                  ...field,
                  type: getFieldType(field as IDynamicFormField, values),
                  label: getFieldLabel(field as IDynamicFormField, values),
                  helperText: getFieldHelperText(
                    field as IDynamicFormField,
                    values
                  ),
                  tooltip: getFieldLabelToolTip(
                    field as IDynamicFormField,
                    values
                  )
                } as ITextFormField)
              : field.type === DYNAMIC_LIST
              ? ({
                  ...field,
                  type: BULLET_LIST,
                  items: getFieldOptionsByValueMapper(
                    field as IDynamicListFormField,
                    draftData as IFormData,
                    field.dynamicItems.valueMapper
                  )
                } as IListFormField)
              : field.type === FETCH_BUTTON
              ? ({
                  ...field,
                  queryData: getQueryData(field as ILoaderButton, values),
                  draftData: draftData as IFormData,
                  onFetch: (response) => {
                    const section = {
                      id: this.props.id,
                      groups: [
                        {
                          id: `${this.props.id}-view-group`,
                          fields
                        }
                      ]
                    } as IFormSection

                    const form = {
                      sections: [section]
                    } as IForm

                    const queryData: IQueryData = {}
                    queryData[this.props.id] = response

                    const transformedData = gqlToDraftTransformer(
                      form,
                      queryData
                    )
                    const updatedValues = Object.assign(
                      {},
                      values,
                      transformedData[this.props.id]
                    )
                    setValues(updatedValues)
                  }
                } as ILoaderButton)
              : field.type === LOCATION_SEARCH_INPUT
              ? {
                  ...field,
                  locationList: generateLocations(
                    field.searchableResource.reduce((locations, resource) => {
                      return {
                        ...locations,
                        ...getListOfLocations(offlineCountryConfig, resource)
                      }
                    }, {}),
                    intl,
                    (location) => field.searchableType.includes(location.type),
                    field.userOfficeId
                  )
                }
              : field

          if (
            field.type === FETCH_BUTTON ||
            field.type === FIELD_WITH_DYNAMIC_DEFINITIONS ||
            field.type === SELECT_WITH_DYNAMIC_OPTIONS ||
            field.type === BUTTON
          ) {
            return (
              <FormItem
                key={`${field.name}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      setFieldValue={this.setFieldValuesWithDependency}
                      setFieldTouched={setFieldTouched}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      {...formikFieldProps.field}
                      touched={touched[field.name] || false}
                      error={error}
                      fields={fields}
                      values={values}
                      draftData={draftData}
                      disabled={isFieldDisabled}
                      dynamicDispatch={dynamicDispatch}
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else if (
            field.type === RADIO_GROUP_WITH_NESTED_FIELDS &&
            field.nestedFields
          ) {
            let nestedFieldElements = Object.create(null)

            nestedFieldElements = Object.keys(field.nestedFields).reduce(
              (childElements, key) => ({
                ...childElements,
                [key]: field.nestedFields[key].map((nestedField) => {
                  let nestedError: string
                  const nestedFieldErrors =
                    errors[field.name] &&
                    errors[field.name].nestedFields[nestedField.name]

                  if (nestedFieldErrors && nestedFieldErrors.length > 0) {
                    const [firstError] = nestedFieldErrors
                    nestedError = intl.formatMessage(
                      firstError.message,
                      firstError.props
                    )
                  }

                  const nestedFieldName = `${field.name}.nestedFields.${nestedField.name}`

                  const nestedFieldTouched =
                    touched[field.name] &&
                    (touched[field.name] as unknown as ITouchedNestedFields)
                      .nestedFields &&
                    (touched[field.name] as unknown as ITouchedNestedFields)
                      .nestedFields[nestedField.name]

                  return (
                    <FormItem
                      key={nestedFieldName}
                      ignoreBottomMargin={field.ignoreBottomMargin}
                    >
                      <FastField name={nestedFieldName}>
                        {(formikFieldProps: FieldProps<any>) => (
                          <GeneratedInputField
                            fieldDefinition={internationaliseFieldObject(intl, {
                              ...nestedField,
                              name: nestedFieldName
                            })}
                            setFieldValue={this.setFieldValuesWithDependency}
                            setFieldTouched={setFieldTouched}
                            resetDependentSelectValues={
                              this.resetDependentSelectValues
                            }
                            {...formikFieldProps.field}
                            fields={fields}
                            values={values}
                            touched={nestedFieldTouched || false}
                            error={nestedError}
                            draftData={draftData}
                            dynamicDispatch={dynamicDispatch}
                            onUploadingStateChanged={
                              this.props.onUploadingStateChanged
                            }
                          />
                        )}
                      </FastField>
                    </FormItem>
                  )
                })
              }),
              {}
            )

            return (
              <FormItem
                key={field.name}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={`${field.name}.value`}>
                  {(formikFieldProps: FieldProps<any>) => (
                    <GeneratedInputField
                      fieldDefinition={internationaliseFieldObject(
                        intl,
                        withDynamicallyGeneratedFields
                      )}
                      setFieldValue={this.setFieldValuesWithDependency}
                      setFieldTouched={setFieldTouched}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      resetNestedInputValues={this.resetNestedInputValues}
                      {...formikFieldProps.field}
                      nestedFields={nestedFieldElements}
                      touched={Boolean(touched[field.name]) || false}
                      error={error}
                      fields={fields}
                      values={values}
                      draftData={draftData}
                      dynamicDispatch={dynamicDispatch}
                    />
                  )}
                </Field>
              </FormItem>
            )
          } else {
            return (
              <FormItem
                key={`${field.name}${language}`}
                ignoreBottomMargin={field.ignoreBottomMargin}
              >
                <Field name={field.name}>
                  {(formikFieldProps: FieldProps<any>) => {
                    return (
                      <GeneratedInputField
                        fieldDefinition={internationaliseFieldObject(
                          intl,
                          withDynamicallyGeneratedFields
                        )}
                        setFieldValue={this.setFieldValuesWithDependency}
                        setFieldTouched={setFieldTouched}
                        resetDependentSelectValues={
                          this.resetDependentSelectValues
                        }
                        {...formikFieldProps.field}
                        touched={touched[field.name] || false}
                        error={isFieldDisabled ? '' : error}
                        draftData={draftData}
                        fields={fields}
                        values={values}
                        dynamicDispatch={dynamicDispatch}
                        disabled={isFieldDisabled}
                        onUploadingStateChanged={
                          this.props.onUploadingStateChanged
                        }
                      />
                    )
                  }}
                </Field>
              </FormItem>
            )
          }
        })}
      </section>
    )
  }
}

export const FormFieldGenerator: React.FC<IFormSectionProps> = (props) => {
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  const intl = useIntl()
  const dispatch = useDispatch()

  return (
    <Formik<IFormSectionData>
      initialValues={
        props.initialValues ??
        mapFieldsToValues(
          props.fields,
          {},
          offlineCountryConfig,
          props.draftData,
          userDetails
        )
      }
      onSubmit={() => {}}
      validate={(values) =>
        getValidationErrorsForForm(
          props.fields,
          values,
          offlineCountryConfig,
          props.draftData,
          userDetails,
          props.requiredErrorMessage
        )
      }
    >
      {(formikProps) => (
        <FormSectionComponent
          {...props}
          {...formikProps}
          intl={intl}
          offlineCountryConfig={offlineCountryConfig}
          userDetails={userDetails}
          dynamicDispatch={(...args) => dispatch(dynamicDispatch(...args))}
        />
      )}
    </Formik>
  )
}
