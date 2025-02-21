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
import styled from 'styled-components'
import { useIntl, defineMessages, IntlShape } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { Accordion } from '@opencrvs/components'
import { FieldValue } from '@opencrvs/commons/client'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Button } from '@opencrvs/components/lib/Button'
import { EventConfig } from '@opencrvs/commons'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { ROUTES } from '@client/v2-events/routes'

const SearchButton = styled(Button)`
  margin-top: 32px;
`

const messagesToDefine = {
  search: {
    defaultMessage: 'Search',
    description: 'Label for search button',
    id: 'v2.buttons.search'
  },
  hide: {
    defaultMessage: 'Hide',
    description: 'Label for hide button when accordion is closed',
    id: 'v2.advancedSearch.accordion.hide'
  },
  show: {
    defaultMessage: 'Show',
    description: 'Label for show button when accordion is closed',
    id: 'v2.advancedSearch.accordion.show'
  }
}

const messages = defineMessages(messagesToDefine)

function getSectionFields(
  event: EventConfig,
  formValues: Record<string, FieldValue>,
  handleFieldChange: (fieldId: string, value: FieldValue) => void,
  intl: IntlShape
) {
  const advancedSearchSections = event.advancedSearch
  const allUniqueFields = getAllUniqueFields(event)
  return advancedSearchSections.map((section) => {
    const advancedSearchFieldId = section.fields.map(
      (f: { fieldId: string }) => f.fieldId
    )
    const fields = allUniqueFields.filter((field) =>
      advancedSearchFieldId.includes(field.id)
    )

    const modifiedFields = fields.map((f) => ({
      ...f,
      required: false // advanced search fields need not be required
    }))

    return (
      <Accordion
        key={section.id}
        expand={true}
        label={intl.formatMessage(section.title)}
        labelForHideAction={intl.formatMessage(messages.hide)}
        labelForShowAction={intl.formatMessage(messages.show)}
        name={section.id}
      >
        <FormFieldGenerator
          fields={modifiedFields}
          formData={formValues}
          id={section.id}
          setAllFieldsDirty={false}
          onChange={(updatedValues) => {
            Object.entries(updatedValues).forEach(([fieldId, value]) => {
              handleFieldChange(fieldId, value)
            })
          }}
        />
      </Accordion>
    )
  })
}

export function TabSearch({ currentEvent }: { currentEvent: EventConfig }) {
  const intl = useIntl()
  const [formValues, setFormValues] = React.useState<
    Record<string, FieldValue>
  >({})
  const navigate = useNavigate()

  React.useEffect(() => {
    setFormValues({})
  }, [currentEvent])

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()

    Object.entries(formValues).forEach(([key, value]) => {
      searchParams.append(key, String(value)) // Convert all values to strings
    })

    const navigateTo = ROUTES.V2.SEARCH_RESULT.buildPath({
      eventType: currentEvent.id
    })

    navigate(`${navigateTo}?${searchParams.toString()}`)
  }

  const SectionFields = getSectionFields(
    currentEvent,
    formValues,
    handleFieldChange,
    intl
  )

  const hasEnoughParams = Object.entries(formValues).length > 0
  const Search = (
    <SearchButton
      key="search"
      fullWidth
      disabled={!hasEnoughParams}
      id="search"
      size="large"
      type="primary"
      onClick={handleSearch}
    >
      <Icon name={'MagnifyingGlass'} />
      {intl.formatMessage(messages.search)}
    </SearchButton>
  )

  return (
    <>
      {SectionFields}
      {Search}
    </>
  )
}
