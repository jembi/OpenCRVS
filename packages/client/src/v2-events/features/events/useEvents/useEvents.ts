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

import { hashKey, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { InferQueryLikeData } from '@trpc/react-query/shared'
import {
  EventConfig,
  EventDocument,
  EventIndex,
  getEventConfiguration
} from '@opencrvs/commons/client'
import { api, queryClient, trpcClient, utils } from '@client/v2-events/trpc'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { useEventAction } from './procedures/action'
import { createEvent } from './procedures/create'
import { useDeleteEventMutation } from './procedures/delete'

function getPendingMutations(
  mutationCreator: Parameters<typeof getQueryKey>[0]
) {
  const key = getQueryKey(mutationCreator)
  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) => mutation.state.status !== 'success')
    .filter(
      (mutation) =>
        mutation.options.mutationKey &&
        hashKey(mutation.options.mutationKey) === hashKey(key)
    )
}

function filterOutboxEventsWithMutation<
  T extends
    | typeof api.event.create
    | typeof api.event.actions.declare
    | typeof api.event.actions.register
>(
  events: EventIndex[],
  mutation: T,
  filter: (
    event: EventIndex,
    parameters: Exclude<ReturnType<T['useMutation']>['variables'], undefined>
  ) => boolean
) {
  return getPendingMutations(mutation).flatMap((m) => {
    const variables = m.state.variables as Exclude<
      ReturnType<T['useMutation']>['variables'],
      undefined
    >
    return events.filter((event) => filter(event, variables))
  })
}

/*
 * This logic overrides the default behaviour of "api.event.get"
 * by making it so all "FILE" or "FILE_WITH_OPTIONS" type data points
 * are parsed from the received event document and prefetched as part of fetching the record
 *
 * This ensures the full record can be browsed even when the user goes offline
 */
const getEventById = getQueryKey(api.event.get, undefined)
queryClient.setQueryDefaults<InferQueryLikeData<typeof api.event.get>>(
  getEventById,
  {
    queryFn: async ({ queryKey, meta }) => {
      const [queryPath, queryKeyOptions] = queryKey as typeof getEventById
      if (!meta) {
        throw new Error(
          'api.event.get was called without passing mandatory event configuration'
        )
      }
      /*
       * This is a query directly to the tRPC server
       */
      const response = await trpcClient.query(
        queryPath.join('.'), // 'event.get'
        queryKeyOptions?.input // UUID
      )

      const eventDocument = EventDocument.parse(response)

      const eventConfig = getEventConfiguration(
        meta.eventConfig as EventConfig[],
        eventDocument.type
      )

      await cacheFiles(eventDocument, eventConfig)
      return eventDocument
    }
  }
)

const getEvent = {
  useQuery: (id: string) => {
    const eventConfig = api.event.config.get.useQuery().data

    return useQuery<EventDocument>({
      queryKey: getQueryKey(api.event.get, id, 'query'),
      meta: { eventConfig }
    })
  },
  useSuspenseQuery: (id: string) => {
    const [eventConfig] = api.event.config.get.useSuspenseQuery()

    return [
      useSuspenseQuery<EventDocument>({
        queryKey: getQueryKey(api.event.get, id, 'query'),
        meta: { eventConfig }
      }).data
    ]
  }
}

export function useEvents() {
  const eventsList = api.event.list.useQuery().data ?? []

  function getDrafts(): EventDocument[] {
    const queries = queryClient.getQueriesData<EventDocument>({
      queryKey: getQueryKey(api.event.get)
    })

    return queries
      .map((query) => query[1])
      .filter((event): event is EventDocument =>
        Boolean(event && event.actions[event.actions.length - 1].draft)
      )
  }

  function getOutbox() {
    const eventFromDeclareActions = filterOutboxEventsWithMutation(
      eventsList,
      api.event.actions.declare,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    const eventFromRegisterActions = filterOutboxEventsWithMutation(
      eventsList,
      api.event.actions.register,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    return eventFromDeclareActions
      .concat(eventFromDeclareActions)
      .concat(eventFromRegisterActions)
      .filter(
        /* uniqueById */
        (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
      )
  }

  return {
    createEvent,
    getEvent,
    getEvents: api.event.list,
    deleteEvent: useDeleteEventMutation(),
    getOutbox,
    getDrafts,
    search: api.event.search.useQuery,
    actions: {
      validate: useEventAction(
        utils.event.actions.validate,
        api.event.actions.validate
      ),
      notify: useEventAction(
        utils.event.actions.notify,
        api.event.actions.notify
      ),
      declare: useEventAction(
        utils.event.actions.declare,
        api.event.actions.declare
      ),
      register: useEventAction(
        utils.event.actions.register,
        api.event.actions.register
      ),
      printCertificate: useEventAction(
        utils.event.actions.printCertificate,
        api.event.actions.printCertificate
      ),
      correction: {
        request: useEventAction(
          utils.event.actions.correction.request,
          api.event.actions.correction.request
        ),
        approve: useEventAction(
          utils.event.actions.correction.approve,
          api.event.actions.correction.approve
        ),
        reject: useEventAction(
          utils.event.actions.correction.reject,
          api.event.actions.correction.reject
        )
      }
    }
  }
}
