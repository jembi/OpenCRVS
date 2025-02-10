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
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  Accordion,
  Content,
  ContentSize,
  FormTabs,
  IFormTabProps
} from '@opencrvs/components'
import { EventConfig, FieldValue } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

const messagesToDefine = {
  search: {
    defaultMessage: 'Search',
    description: 'The title of search input submit button',
    id: 'buttons.search'
  },
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  },
  hide: {
    defaultMessage: 'Hide',
    description: 'Label for hide button when accordion is closed',
    id: 'advancedSearch.accordion.hide'
  },
  show: {
    defaultMessage: 'Show',
    description: 'Label for show button when accordion is closed',
    id: 'advancedSearch.accordion.show'
  }
}

const messages = defineMessages(messagesToDefine)

const SearchButton = styled(Button)`
  margin-top: 32px;
`

type AdvancedSearchFormConfig = EventConfig['advancedSearch']

function TabSearch({
  sections,
  activeTabId
}: {
  sections: AdvancedSearchFormConfig
  activeTabId: string
}) {
  const intl = useIntl()
  const events = useEventConfigurations()
  const [formValues, setFormValues] = useState<Record<string, FieldValue>>({})

  const currentEvent = events.filter((e) => e.id === activeTabId)

  // Extract unique fields
  const allUniqueFields = [
    ...new Map(
      currentEvent
        .flatMap((event) =>
          event.actions.flatMap((action) =>
            action.forms.flatMap((form) =>
              form.pages.flatMap((page) => page.fields)
            )
          )
        )
        .map((field) => [field.id, field])
    ).values()
  ]

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const SectionFields = sections.map((section) => {
    const advancedSearchFieldId = section.fields.map(
      (f: { fieldId: string }) => f.fieldId
    )
    const fields = allUniqueFields.filter((field) =>
      advancedSearchFieldId.includes(field.id)
    )

    const modifiedFields = fields.map((f) => {
      return {
        ...f,
        required: false // advanced search fields need not be required
      }
    })

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

  const hasEnoughParams = Object.entries(formValues).length > 0
  const Search = (
    <SearchButton
      key="search"
      fullWidth
      disabled={!hasEnoughParams}
      id="search"
      size="large"
      type="primary"
      onClick={() => {
        alert(JSON.stringify(formValues))
      }}
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

function AdvancedSearch() {
  const intl = useIntl()
  const allEvents = useEventConfigurations()

  const advancedSearchEvents = allEvents.filter(
    (event) => event.advancedSearch.length > 0
  )

  const formTabSections = advancedSearchEvents.map((a) => ({
    id: a.id,
    title: intl.formatMessage(a.label)
  })) satisfies IFormTabProps['sections']

  const [activeTabId, setActiveTabId] = useState<string>(formTabSections[0].id)

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const currentTabSections =
    allEvents.find((e) => e.id === activeTabId)?.advancedSearch ?? []

  return (
    <>
      <Content
        size={ContentSize.SMALL}
        subtitle={intl.formatMessage(messages.advancedSearchInstruction)}
        tabBarContent={
          <FormTabs
            activeTabId={activeTabId}
            sections={formTabSections}
            onTabClick={handleTabClick}
          />
        }
        title={intl.formatMessage(messages.advancedSearch)}
        titleColor={'copy'}
      >
        {currentTabSections.length > 0 && (
          <TabSearch activeTabId={activeTabId} sections={currentTabSections} />
        )}
      </Content>
    </>
  )
}

export default AdvancedSearch
