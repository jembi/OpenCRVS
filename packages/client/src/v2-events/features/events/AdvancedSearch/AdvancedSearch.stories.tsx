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
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes'
import { tennisClubMembershipEvent } from '@client/v2-events/features/events/fixtures'
import { advancedSearchRouter } from './router'
import AdvancedSearch from './AdvancedSearch'

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch',
  component: AdvancedSearch,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export default meta
type Story = StoryObj<typeof AdvancedSearch>

export const AdvancedSearchStory: Story = {
  parameters: {
    reactRouter: {
      router: advancedSearchRouter,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}
