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

/* eslint-disable */
import { InputField } from '@client/components/form/InputField'
import { TEXT } from '@client/forms'
import { Text as TextComponent } from '@opencrvs/components/lib/Text'
import * as React from 'react'

import styled, { keyframes } from 'styled-components'
import {
  evalExpressionInFieldDefinition,
  FIELD_SEPARATOR,
  getConditionalActionsForField,
  getDependentFields,
  handleInitialValue,
  hasInitialValueDependencyInfo,
  makeDatesFormatted
} from './utils'
import { Errors, getValidationErrorsForForm } from './validation'

import {
  ActionFormData,
  AddressFieldValue,
  CheckboxFieldValue,
  FieldConfig,
  FieldType,
  FieldValue,
  FileFieldValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isFacilityFieldType,
  isBulletListFieldType,
  isCheckboxFieldType,
  isCountryFieldType,
  isDateFieldType,
  isDividerFieldType,
  isFileFieldType,
  isLocationFieldType,
  isOfficeFieldType,
  isPageHeaderFieldType,
  isParagraphFieldType,
  isRadioGroupFieldType,
  isSelectFieldType,
  isTextFieldType
} from '@opencrvs/commons/client'
import {
  Field,
  FieldProps,
  Formik,
  FormikProps,
  FormikTouched,
  FormikValues
} from 'formik'
import { cloneDeep, isEqual, set } from 'lodash'
import {
  WrappedComponentProps as IntlShapeProps,
  MessageDescriptor,
  useIntl
} from 'react-intl'
import { File } from './inputs/FileInput/FileInput'

import {
  BulletList,
  Checkbox,
  Date as DateField,
  RadioGroup,
  LocationSearch,
  Select,
  SelectCountry,
  Text,
  AdministrativeArea
} from '@client/v2-events/features/events/registered-fields'

import { SubHeader } from '@opencrvs/components'
import { formatISO } from 'date-fns'
import { Divider } from '@opencrvs/components'
import { Address } from '@client/v2-events/features/events/registered-fields/Address'

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

interface GeneratedInputFieldProps<T extends FieldConfig> {
  fieldDefinition: T
  fields: FieldConfig[]
  values: ActionFormData
  setFieldValue: (name: string, value: FieldValue | undefined) => void
  onClick?: () => void
  onChange: (e: React.ChangeEvent) => void
  onBlur: (e: React.FocusEvent) => void
  resetDependentSelectValues: (name: string) => void
  value: FieldValue
  touched: boolean
  error: string
  formData: ActionFormData
  disabled?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  setFieldTouched: (name: string, isTouched?: boolean) => void
}

const GeneratedInputField = React.memo(
  <T extends FieldConfig>({
    fieldDefinition,
    onChange,
    onBlur,
    setFieldValue,
    resetDependentSelectValues,
    error,
    touched,
    value,
    formData,
    disabled,
    setFieldTouched,
    requiredErrorMessage,
    fields,
    values
  }: GeneratedInputFieldProps<T>) => {
    const intl = useIntl()

    const inputFieldProps = {
      id: fieldDefinition.id,
      label: fieldDefinition.hideLabel
        ? undefined
        : intl.formatMessage(fieldDefinition.label),
      // helperText: fieldDefinition.helperText,
      // tooltip: fieldDefinition.tooltip,
      // description: fieldDefinition.description,
      required: fieldDefinition.required,
      disabled: fieldDefinition.disabled,
      // prefix: fieldDefinition.prefix,
      // postfix: fieldDefinition.postfix,
      // unit: fieldDefinition.unit,
      // hideAsterisk: fieldDefinition.hideAsterisk,
      // hideInputHeader: fieldDefinition.hideHeader,
      error,
      touched
    }

    const inputProps = {
      id: fieldDefinition.id,
      name: fieldDefinition.id,
      onChange,
      onBlur,
      value,
      disabled: fieldDefinition.disabled ?? disabled,
      error: Boolean(error),
      touched: Boolean(touched),
      placeholder:
        fieldDefinition.placeholder &&
        intl.formatMessage(fieldDefinition.placeholder)
    }

    const handleFileChange = React.useCallback(
      (value: FileFieldValue | undefined) =>
        setFieldValue(fieldDefinition.id, value),
      [fieldDefinition.id, setFieldValue]
    )

    /**
     * Combines the field definition with the current value and input field props
     * USED FOR: rendering the correct input field based on the FieldConfig guards
     */
    const field = {
      inputFieldProps,
      config: fieldDefinition,
      value
    }

    if (isDateFieldType(field)) {
      return (
        <InputField {...field.inputFieldProps}>
          <DateField.Input
            {...inputProps}
            value={field.value}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }
    if (isPageHeaderFieldType(field)) {
      return <SubHeader>{intl.formatMessage(fieldDefinition.label)}</SubHeader>
    }

    if (isParagraphFieldType(field)) {
      const label = fieldDefinition.label as unknown as MessageDescriptor & {
        values: Record<string, string>
      }
      const values = label.values || {}

      const message = intl.formatMessage(label, {
        ...values,
        [fieldDefinition.id]: field.value
      })

      return (
        <TextComponent
          element="p"
          variant={field.config.configuration?.styles?.fontVariant ?? 'reg16'}
        >
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </TextComponent>
      )
    }

    if (isTextFieldType(field)) {
      return (
        <InputField
          {...inputFieldProps}
          prefix={
            field.config.configuration?.prefix &&
            intl.formatMessage(field.config.configuration?.prefix)
          }
          postfix={
            field.config.configuration?.postfix &&
            intl.formatMessage(field.config.configuration?.postfix)
          }
        >
          <Text.Input
            type={field.config.configuration?.type ?? 'text'}
            {...inputProps}
            isDisabled={disabled}
            maxLength={field.config.configuration?.maxLength}
            value={field.value}
          />
        </InputField>
      )
    }

    if (isFileFieldType(field)) {
      const value = formData[fieldDefinition.id] as FileFieldValue
      return (
        <InputField {...inputFieldProps}>
          <File.Input
            {...inputProps}
            value={value}
            onChange={handleFileChange}
          />
        </InputField>
      )
    }
    if (isBulletListFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <BulletList {...field.config} />
        </InputField>
      )
    }
    if (isAddressFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Address.Input
            value={field.value}
            onChange={(val) => setFieldValue(fieldDefinition.id, val)}
            {...field.config}
          />
        </InputField>
      )
    }
    if (isSelectFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <Select.Input
            {...field.config}
            value={field.value}
            onChange={(val: string) => setFieldValue(fieldDefinition.id, val)}
          />
        </InputField>
      )
    }
    if (isCountryFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <SelectCountry.Input
            {...field.config}
            value={field.value}
            setFieldValue={setFieldValue}
          />
        </InputField>
      )
    }
    if (isCheckboxFieldType(field)) {
      return (
        <Checkbox.Input
          {...field.config}
          value={field.value}
          setFieldValue={setFieldValue}
        />
      )
    }
    if (isRadioGroupFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <RadioGroup.Input
            {...field.config}
            value={field.value}
            setFieldValue={setFieldValue}
          />
        </InputField>
      )
    }
    if (isAdministrativeAreaFieldType(field)) {
      return (
        <InputField {...inputFieldProps}>
          <AdministrativeArea.Input
            {...field.config}
            value={field.value}
            partOf={'0'} // @todo add partof property from field config
            setFieldValue={setFieldValue}
          />
        </InputField>
      )
    }

    if (isLocationFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          value={field.value}
          searchableResource={['locations']}
          setFieldValue={setFieldValue}
        />
      )
    }

    if (isOfficeFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          value={field.value}
          searchableResource={['offices']}
          setFieldValue={setFieldValue}
        />
      )
    }

    if (isFacilityFieldType(field)) {
      return (
        <LocationSearch.Input
          {...field.config}
          value={field.value}
          searchableResource={['facilities']}
          setFieldValue={setFieldValue}
        />
      )
    }
    if (isDividerFieldType(field)) {
      return <Divider />
    }

    throw new Error(`Unsupported field ${JSON.stringify(fieldDefinition)}`)
  }
)

GeneratedInputField.displayName = 'MemoizedGeneratedInputField'

type FormData = Record<string, FieldValue>

const mapFieldsToValues = (fields: FieldConfig[], formData: FormData) =>
  fields.reduce((memo, field) => {
    const fieldInitialValue = handleInitialValue(field, formData)
    return { ...memo, [field.id]: fieldInitialValue }
  }, {})

type ISetTouchedFunction = (touched: FormikTouched<FormikValues>) => void

interface ExposedProps {
  fields: FieldConfig[]
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  setAllFieldsDirty: boolean
  onChange: (values: ActionFormData) => void
  formData: Record<string, FieldValue>
  onSetTouched?: (func: ISetTouchedFunction) => void
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: ActionFormData
}

type AllProps = ExposedProps &
  IntlShapeProps &
  FormikProps<ActionFormData> & {
    className?: string
  }

class FormSectionComponent extends React.Component<AllProps> {
  componentDidUpdate(prevProps: AllProps) {
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

  showValidationErrors(fields: FieldConfig[]) {
    const touched = fields.reduce((memo, field) => {
      return { ...memo, [field.id]: true }
    }, {})

    this.props.setTouched(touched)
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.setFieldTouched(e.target.name)
  }

  setFieldValuesWithDependency = (
    fieldName: string,
    value: FieldValue | undefined
  ) => {
    const updatedValues = cloneDeep(this.props.values)
    set(updatedValues, fieldName, value)
    const updateDependentFields = (fieldName: string) => {
      const dependentFields = getDependentFields(this.props.fields, fieldName)
      for (const field of dependentFields) {
        if (
          !field.initialValue ||
          !hasInitialValueDependencyInfo(field.initialValue)
        ) {
          continue
        }

        updatedValues[field.id] = evalExpressionInFieldDefinition(
          field.initialValue.expression,
          { $form: updatedValues }
        )
        updateDependentFields(field.id)
      }
    }
    updateDependentFields(fieldName)

    this.props.setValues(updatedValues)
  }

  resetDependentSelectValues = (fieldName: string) => {
    const fields = this.props.fields
    const fieldsToReset = fields.filter(
      (field) => field.type === TEXT && field.dependsOn?.includes(fieldName)
    )

    fieldsToReset.forEach((fieldToReset) => {
      this.props.setFieldValue(fieldToReset.id, '')
      this.resetDependentSelectValues(fieldToReset.id)
    })
  }

  render() {
    const {
      values,
      fields: fieldsWithDotIds,
      setFieldTouched,
      touched,
      intl,
      className,
      formData
    } = this.props

    const language = this.props.intl.locale

    const errors = makeFormFieldIdsFormikCompatible(
      this.props.errors as unknown as Errors
    )

    const fields = fieldsWithDotIds.map((field) => ({
      ...field,
      id: field.id.replaceAll('.', FIELD_SEPARATOR)
    }))
    const valuesWithFormattedDate = makeDatesFormatted(fieldsWithDotIds, values)

    return (
      <section className={className}>
        {fields.map((field) => {
          let error: string
          const fieldErrors = errors[field.id] && errors[field.id].errors

          if (fieldErrors && fieldErrors.length > 0) {
            const [firstError] = fieldErrors
            error = intl.formatMessage(firstError.message, firstError.props)
          }

          const conditionalActions: string[] = getConditionalActionsForField(
            field,
            {
              $form: makeFormikFieldIdsOpenCRVSCompatible(
                valuesWithFormattedDate
              ),
              $now: formatISO(new Date(), { representation: 'date' })
            }
          )

          if (conditionalActions.includes('HIDE')) {
            return null
          }

          const isFieldDisabled = conditionalActions.includes('disable')

          return (
            <FormItem
              ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
              key={`${field.id}${language}`}
            >
              <Field name={field.id}>
                {(formikFieldProps: FieldProps<any>) => {
                  return (
                    <GeneratedInputField
                      fieldDefinition={field}
                      resetDependentSelectValues={
                        this.resetDependentSelectValues
                      }
                      setFieldTouched={setFieldTouched}
                      setFieldValue={this.setFieldValuesWithDependency}
                      {...formikFieldProps.field}
                      disabled={isFieldDisabled}
                      error={isFieldDisabled ? '' : error}
                      fields={fields}
                      formData={formData}
                      touched={touched[field.id] || false}
                      values={values}
                      onUploadingStateChanged={
                        this.props.onUploadingStateChanged
                      }
                    />
                  )
                }}
              </Field>
            </FormItem>
          )
        })}
      </section>
    )
  }
}

function makeFormFieldIdsFormikCompatible<T>(data: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key.replaceAll('.', FIELD_SEPARATOR),
      value
    ])
  )
}

function makeFormikFieldIdsOpenCRVSCompatible<T>(data: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key.replaceAll(FIELD_SEPARATOR, '.'),
      value
    ])
  )
}

export const FormFieldGenerator: React.FC<ExposedProps> = (props) => {
  const intl = useIntl()

  const nestedFormData = makeFormFieldIdsFormikCompatible(props.formData)

  const onChange = (values: ActionFormData) => {
    props.onChange(makeFormikFieldIdsOpenCRVSCompatible(values))
  }

  const initialValues = makeFormFieldIdsFormikCompatible<FieldValue>(
    props.initialValues ?? mapFieldsToValues(props.fields, nestedFormData)
  )

  return (
    <Formik<ActionFormData>
      enableReinitialize={true}
      initialValues={initialValues}
      validate={(values) =>
        getValidationErrorsForForm(
          props.fields,
          makeFormikFieldIdsOpenCRVSCompatible(
            makeDatesFormatted(props.fields, values)
          ),
          props.requiredErrorMessage
        )
      }
      onSubmit={() => {}}
    >
      {(formikProps) => {
        return (
          <FormSectionComponent
            {...props}
            {...formikProps}
            formData={nestedFormData}
            intl={intl}
            onChange={onChange}
          />
        )
      }}
    </Formik>
  )
}
