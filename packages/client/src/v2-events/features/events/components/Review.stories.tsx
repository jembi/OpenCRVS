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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'

import React from 'react'
import superjson from 'superjson'
import { fireEvent, within } from '@storybook/test'
import { AddressFieldValue } from '@opencrvs/commons/client'
import {
  tennisClueMembershipEventDocument,
  tennisClubMembershipEvent,
  DEFAULT_FORM
} from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'

import { useModal } from '@client/v2-events/hooks/useModal'
import { Review } from './Review'

const mockFormData = {
  'applicant.firstname': 'John',
  'applicant.surname': 'Doe',
  'applicant.dob': '1990-01-01',
  'applicant.address': {
    country: 'FAR',
    province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
    street: '123 Tennis Club Avenue',
    number: '123',
    zipCode: 'Z12345',
    urbanOrRural: 'URBAN' as const,
    town: 'Tennisville',
    residentialArea: 'Example Residential Area'
  }
}

const meta: Meta<typeof Review.Body> = {
  title: 'Review',
  component: Review.Body,
  args: {
    eventConfig: tennisClubMembershipEvent,
    formConfig: DEFAULT_FORM,
    form: mockFormData,
    onEdit: () => undefined,
    title: 'Member declaration for John Doe'
  },
  beforeEach: () => {
    useEventFormData.getState().clear()
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof Review.Body>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ReviewWithoutChanges: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  }
}

export const ReviewButtonTest: StoryObj<typeof Review.Body> = {
  name: 'Review Button Test',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open modal', async () => {
      const [changeButton] = await canvas.findAllByRole('button', {
        name: 'Change'
      })

      await fireEvent.click(changeButton)
    })

    await step('Close modal', async () => {
      const cancelButton = await canvas.findByRole('button', {
        name: 'Cancel'
      })

      await fireEvent.click(cancelButton)
    })
  },
  render: function Component() {
    const [modal, openModal] = useModal()

    async function handleDeclaration() {
      await openModal<boolean | null>((close) => (
        <Review.ActionModal action="Declare" close={close} />
      ))
    }

    async function handleEdit() {
      await openModal<boolean | null>((close) => (
        <Review.EditModal close={close}></Review.EditModal>
      ))

      return
    }

    return (
      <>
        <Review.Body
          eventConfig={tennisClubMembershipEvent}
          form={mockFormData}
          formConfig={DEFAULT_FORM}
          title="My test action"
          onEdit={handleEdit}
        >
          <Review.Actions
            form={mockFormData}
            formConfig={DEFAULT_FORM}
            messages={{
              title: {
                id: 'v2.changeModal.title',
                defaultMessage: 'This is a title',
                description: 'The title for review action'
              },
              description: {
                id: 'v2.changeModal.description',
                defaultMessage: 'This is a description',
                description: 'The title for review action'
              },
              onConfirm: {
                id: 'ourOnConfirm',
                defaultMessage: 'Confirm test',
                description: 'The title for review action'
              }
            }}
            onConfirm={handleDeclaration}
          />
        </Review.Body>
        {modal}
      </>
    )
  }
}

export const ReviewWithValidationErrors: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  },
  args: {
    form: {
      'applicant.firstname': 'Mia',
      // @ts-ignore
      'applicant.surname': undefined,
      // @ts-ignore
      'applicant.dob': undefined,
      'applicant.email': 'mia@',
      'applicant.address': {
        country: 'FAR',
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        urbanOrRural: 'RURAL',
        village: 'Tennisville'
      } as AddressFieldValue
    }
  },
  render: function Component() {
    return (
      <Review.Body
        eventConfig={tennisClubMembershipEvent}
        form={this.args?.form || {}}
        formConfig={DEFAULT_FORM}
        title="My test action"
        onEdit={() => undefined}
      >
        <Review.Actions
          form={this.args?.form || {}}
          formConfig={DEFAULT_FORM}
          messages={{
            title: {
              id: 'v2.changeModal.title',
              defaultMessage: 'This is a title',
              description: 'The title for review action'
            },
            description: {
              id: 'v2.changeModal.description',
              defaultMessage: 'This is a description',
              description: 'The title for review action'
            },
            onConfirm: {
              id: 'ourOnConfirm',
              defaultMessage: 'Confirm test',
              description: 'The title for review action'
            }
          }}
          onConfirm={() => undefined}
        />
      </Review.Body>
    )
  }
}
