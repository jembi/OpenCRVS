import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'
import { Omit } from 'utils'

import { InputField as InputFieldComponent } from '@opencrvs/components/lib/forms'

const messages = defineMessages({
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const InputField = injectIntl(function FormInputField(
  props: Omit<IInputFieldProps, 'optionalLabel'> & InjectedIntlProps
) {
  return (
    <InputFieldComponent
      {...props}
      optionalLabel={props.intl.formatMessage(messages.optionalLabel)}
    />
  )
})
