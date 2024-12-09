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
/* stylelint-disable */
import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import styled from 'styled-components'
import { Text } from '@opencrvs/components'
import { useOnlineStatus } from '@client/utils'
import { useQueryClient } from '@tanstack/react-query'

const Container = styled.div`
  background: #fff;
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  padding: 16px;
  border: 1px dashed #00c142;
  ul {
    list-style: none;
    padding: 0;
  }
`

export const Debug = () => {
  const events = useEvents()
  const online = useOnlineStatus()
  const queryClient = useQueryClient()
  const createMutation = events.createEvent()

  const createEvents = () => {
    createMutation.mutate(
      {
        type: 'TENNIS_CLUB_MEMBERSHIP',
        transactionId: Math.random().toString(36).substring(2)
      },
      {
        onSuccess: (data) => {
          // eslint-disable-next-line no-console
          console.log('Event created', data)
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create event', error)
        }
      }
    )
  }

  const mutations = queryClient.getMutationCache().getAll()
  const storedEvents = events.events
  return (
    <>
      <Container>
        <ul>
          <li>
            <Text variant="reg12" element="span">
              {online ? 'Online' : 'Offline'}
            </Text>
          </li>
          <li>
            <button onClick={createEvents}>Create event</button>
          </li>
          <li>
            <Text variant="reg12" element="span">
              Failed requests in cache{' '}
              {mutations
                .filter((mutation) => mutation.state.isPaused)
                .length.toString()}
            </Text>
          </li>
          <li>
            <Text variant="reg12" element="span">
              Paused requests in cache{' '}
              {mutations
                .filter((mutation) => mutation.state.error)
                .length.toString()}
            </Text>
          </li>
          <li>
            <button onClick={() => queryClient.clear()}>
              Clear React Query buffer
            </button>
          </li>
        </ul>
        <Text variant="h4" element="span">
          Local records
        </Text>
        <ul>
          <li>
            <button onClick={() => console.log(events.events.data)}>
              console.log stored events
            </button>
          </li>
          <li>
            <Text variant="reg12" element="span">
              Events in offline storage: {storedEvents.data?.length}
            </Text>
          </li>
        </ul>
      </Container>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
