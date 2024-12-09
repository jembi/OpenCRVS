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
import { Field, ComponentsMap, FormFieldRenderer } from './FormFieldRenderer'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { flatten } from './flatten-object'
import { Button } from '../Button'
import { Stack } from '../Stack'

/**
 * Definition of a page of the form wizard
 */
type Page<CM extends ComponentsMap> = {
  fields: Array<Field<CM>>
}

type FormWizardProps<CM extends ComponentsMap> = {
  /** The field type to component map the form wizard will use to render the fields */
  components: CM
  currentPage: number
  pages: Page<CM>[]
  defaultValues?: FieldValues
  /** Callback when the user clicks the "Continue" button */
  onNextPage?: () => void
  /** Callback when the user submits the form wizard */
  onSubmit: (data: FieldValues) => void
}

/**
 * Form Wizard acts as a JSON input to component output mapper.
 * It defines a concept of pages, which are collections of fields.
 */
export const FormWizard = <CM extends ComponentsMap>({
  currentPage,
  pages,
  defaultValues,
  components,
  onNextPage,
  onSubmit
}: FormWizardProps<CM>) => {
  const form = useForm({ defaultValues, mode: 'onBlur' })

  const page = pages[currentPage]

  if (!page) {
    throw new Error(`Page #${currentPage} not found!`)
  }

  /**
   * By default, react-hook-form extracts `foo.bar.baz` as a deep object,
   * but we wanna flatten it to `{ "foo.bar.baz": "value" }`.
   */
  const flatOnSubmit = (data: FieldValues) =>
    onSubmit(flatten<FieldValues>(data))

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(flatOnSubmit)}>
        <Stack direction="column" gap={16} alignItems="stretch">
          {page.fields.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              components={components}
            />
          ))}

          {onNextPage ? (
            <Button type="primary" onClick={onNextPage}>
              Continue
            </Button>
          ) : (
            // Initial simple submit for testing
            <Button type="primary">Submit</Button>
          )}
        </Stack>
      </form>
    </FormProvider>
  )
}
