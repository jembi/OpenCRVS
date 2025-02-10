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
import { useIntl } from 'react-intl'
import {
  FieldProps,
  SelectOption,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Select as SelectComponent } from '@opencrvs/components'

function SelectInput({
  onChange,
  value,
  ...props
}: Omit<FieldProps<'SELECT'>, 'label'> & {
  onChange: (newValue: string) => void
  value?: string
  label?: TranslationConfig
} & { 'data-testid'?: string }) {
  const intl = useIntl()
  const { options } = props
  const selectedOption = options.find((option) => option.value === value)
  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label: intl.formatMessage(option.label)
  }))

  const inputValue = selectedOption?.value ?? ''
  return (
    <SelectComponent
      {...props}
      options={formattedOptions}
      value={inputValue}
      onChange={onChange}
    />
  )
}

function SelectOutput({
  value,
  options
}: {
  value: string | undefined
  options: SelectOption[]
}) {
  const intl = useIntl()
  const selectedOption = options.find((option) => option.value === value)

  return selectedOption ? intl.formatMessage(selectedOption.label) : ''
}

export const Select = {
  Input: SelectInput,
  Output: SelectOutput
}
