import * as React from 'react'
import { RadioGroup } from '@opencrvs/components/lib/forms'
import { InputField } from 'src/components/form/InputField'
import {
  Ii18nFormField,
  IFormFieldValue,
  Ii18nRadioGroupFormField,
  Ii18nInformativeRadioGroupFormField
} from 'src/forms'
import { injectIntl } from 'react-intl'
import { ParentDetails } from './ParentDetails'
import styled from '../../styled-components'

const RadioGroupWrapper = styled.div`
  > div > span {
    display: block !important;
  }
`

type IInputProps = {
  id: string
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  value: IFormFieldValue
  disabled?: boolean
  error: boolean
  touched?: boolean
}

type IInputFieldProps = {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  prefix?: string
  postfix?: string
  error: string
  touched: boolean
}

type IProps = {
  value: IFormFieldValue
  inputProps: IInputProps
  inputFieldProps: IInputFieldProps
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
}

function InformativeRadioGroupComponent({
  value,
  inputProps,
  inputFieldProps,
  onSetFieldValue,
  fieldDefinition
}: IProps) {
  return (
    <RadioGroupWrapper>
      <InputField {...inputFieldProps}>
        <ParentDetails
          information={
            (fieldDefinition as Ii18nInformativeRadioGroupFormField).information
          }
        />
        <RadioGroup
          {...inputProps}
          onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
          options={(fieldDefinition as Ii18nRadioGroupFormField).options}
          name={fieldDefinition.name}
          value={value as string}
        />
      </InputField>
    </RadioGroupWrapper>
  )
}

export const InformativeRadioGroup = injectIntl(InformativeRadioGroupComponent)
