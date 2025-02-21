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

import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn } from '@storybook/test'
import { userEvent, within } from '@storybook/testing-library'
import React from 'react'
import * as selectEvent from 'react-select-event'
import styled from 'styled-components'
import { ActionType, EventConfig } from '@opencrvs/commons/client'
import { AddressFieldValue } from '@opencrvs/commons'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Review } from '@client/v2-events/features/events/components/Review'
import { tennisClubMembershipEvent } from '@client/v2-events/features/events/fixtures'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Address',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const EmptyAddressField: StoryObj<typeof FormFieldGenerator> = {
  name: 'Empty address input',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: 'ADDRESS',
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            }
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const AddressFieldInteraction: StoryObj<typeof FormFieldGenerator> = {
  name: 'Interaction between fields',
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Address/)

    await step(
      'Admin structure dropdowns are shown gradually as the inputs are filled',
      async () => {
        // Verify that `District` select is not visible initially
        await expect(canvas.queryByTestId('location__district')).toBeNull()

        // Select a province
        const province = await canvas.findByTestId('location__province')
        await userEvent.click(province)
        await selectEvent.select(province, 'Central')

        // Verify that `District` becomes visible
        const district = await canvas.findByTestId('location__district')
        await expect(district).toBeInTheDocument()

        // Select a district
        await userEvent.click(district)
        await selectEvent.select(district, 'Ibombo')
      }
    )

    await step(
      'Selecting "Rural" for address details type hides detailed street information',
      async () => {
        // Click on the "RURAL" radio option
        const ruralRadio = await canvas.findByTestId('radio-option__RURAL')
        await userEvent.click(ruralRadio)

        // Verify that the "village" input appears
        const villageInput = await canvas.findByTestId('text__village')
        await expect(villageInput).toBeInTheDocument()
      }
    )
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: 'ADDRESS',
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            },
            defaultValue: {
              country: 'FAR'
            } as AddressFieldValue
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

const eventConfig: EventConfig = tennisClubMembershipEvent

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
const declarationForm = tennisClubMembershipEvent.actions
  .find(({ type }) => type === ActionType.DECLARE)
  ?.forms.find(({ active }) => active)!

export const AddressReviewUrban: StoryObj<typeof Review> = {
  name: 'Review output (Urban)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={eventConfig}
        form={{
          'applicant.address': {
            country: 'FAR',
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'URBAN',
            town: 'Example Town',
            residentialArea: 'Example Residential Area',
            street: 'Example Street',
            number: '55',
            zipCode: '123456'
          }
        }}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewRural: StoryObj<typeof Review> = {
  name: 'Review output (Rural)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={eventConfig}
        form={{
          'applicant.address': {
            country: 'FAR',
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'RURAL',
            village: 'Example Village'
          }
        }}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewInvalid: StoryObj<typeof Review> = {
  name: 'Review output (Invalid)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={eventConfig}
        form={{
          'applicant.address': {
            country: 'FAR',
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c'
          } as AddressFieldValue
        }}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewEmpty: StoryObj<typeof Review> = {
  name: 'Review output (Empty)',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={eventConfig}
        form={{}}
        formConfig={declarationForm}
        title="My address form with address output"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressReviewChanged: StoryObj<typeof Review> = {
  name: 'Review with changed address',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={eventConfig}
        form={{
          'applicant.address': {
            country: 'FAR',
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'URBAN',
            town: 'Example Town',
            residentialArea: 'Example Residential Area',
            street: 'Example Street',
            number: '55',
            zipCode: '123456'
          }
        }}
        formConfig={declarationForm}
        previousFormValues={{
          'applicant.address': {
            country: 'FAR',
            province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
            district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
            urbanOrRural: 'RURAL',
            village: 'Example Village'
          }
        }}
        title="My address form with address changed"
        // eslint-disable-next-line no-console
        onEdit={(values) => console.log(values)}
      >
        <div />
      </Review.Body>
    )
  }
}
export const AddressInCopy: StoryObj<typeof Review> = {
  name: 'Address to string',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    const allFields = declarationForm.pages.map((page) => page.fields).flat()
    const stringifier = useFormDataStringifier()
    const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
    const FORM_DATA = {
      'applicant.address': {
        country: 'FAR',
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
        urbanOrRural: 'URBAN' as const,
        town: 'Example Town',
        residentialArea: 'Example Residential Area',
        street: 'Example Street',
        number: '55',
        zipCode: '123456'
      }
    }
    return (
      <div>
        <p>
          {flattenedIntl.formatMessage(
            {
              id: 'storybook.address.example',
              defaultMessage:
                "This is an example of using formatMessage to format applicant's province: {applicant.address.province}"
            },
            stringifier(allFields, FORM_DATA)
          )}
        </p>
        <pre>{JSON.stringify(stringifier(allFields, FORM_DATA), null, 2)}</pre>
      </div>
    )
  }
}
