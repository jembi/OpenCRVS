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

import { getTheme } from '@opencrvs/components/lib/theme'
import type { Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'
import React, { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import {
  createMemoryRouter,
  Outlet,
  RouteObject,
  RouterProvider
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Page } from '@client/components/Page'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import { createStore } from '@client/store'
import { useApolloClient } from '@client/utils/apolloClient'
import { ApolloProvider } from '@client/utils/ApolloProvider'
import { TRPCProvider } from '@client/v2-events/trpc'
import { handlers } from './default-request-handlers'
import WebFont from 'webfontloader'
WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:500', 'Noto+Sans:400']
  }
})

// Initialize MSW
initialize({
  onUnhandledRequest(req, print) {
    if (
      new URL(req.url).pathname.startsWith('/src/') ||
      new URL(req.url).pathname.startsWith('/@fs') ||
      new URL(req.url).pathname.startsWith('/node_modules') ||
      new URL(req.url).pathname.startsWith('/images')
    ) {
      return
    }

    print.warning()
  }
})

const { store } = createStore()

type WrapperProps = PropsWithChildren<{
  store: ReturnType<typeof createStore>['store']
  initialPath: string
  router?: RouteObject
}>

function Wrapper({ store, router, initialPath, children }: WrapperProps) {
  const { client } = useApolloClient(store)

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={getTheme}>
        <Provider store={store}>
          <I18nContainer>
            <TRPCProvider>
              <RouterProvider
                router={createMemoryRouter(
                  [
                    {
                      path: '/',
                      element: (
                        <Page>
                          <Outlet />
                        </Page>
                      ),
                      children: [
                        router || {
                          path: initialPath,
                          element: children
                        }
                      ]
                    }
                  ],
                  {
                    initialEntries: [initialPath]
                  }
                )}
              ></RouterProvider>
            </TRPCProvider>
          </I18nContainer>
        </Provider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export const parameters = {
  layout: 'fullscreen',
  msw: {
    handlers: handlers
  }
}

const preview: Preview = {
  loaders: [mswLoader],
  beforeEach: async () => {
    window.localStorage.setItem(
      'opencrvs',
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1zdWJtaXQtZm9yLXVwZGF0ZXMiLCJyZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiLCJyZWNvcmQuZGVjbGFyYXRpb24tYXJjaGl2ZSIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQucmVnaXN0ZXIiLCJyZWNvcmQucmVnaXN0cmF0aW9uLWNvcnJlY3QiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicmVjb3JkLmNvbmZpcm0tcmVnaXN0cmF0aW9uIiwicmVjb3JkLnJlamVjdC1yZWdpc3RyYXRpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTczNzcyODc1MCwiZXhwIjoxNzM4MzMzNTUwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjc5M2EyZDdmYWQ4NmRhOTQ3YmFjY2YxIn0.I9n81VBdwjgyDh9rK7noCa2F4pl9WPbQJttHN6DI3pD6Xu5pPK25j9FdlQ6JiYG47cWji-J6UzsiZ_Nk7kz9paBlJyS2qts0otuSaz95B-vSRIN18MeF45CoM6ZmNJj2qbk8Enn8ZXs8VB4XH6cN8h30KWsa7-117dGc-Zmm62dkAFS61QR3hmXomexPVFtf5t_w4AOOiAfyyUI6qQHevDA6xXCWdfE2UaIXs5p2_5Hh7qUHLH258PCEgvo__qjmVo3FFAKL6bvmSIPVGwu8pMQK6R0y5ILe1rG-ZFb7nhpvVjywCiN4N4GtRbnQ3beBWG5Up8oKxwovxk9gVCbinw'
    )
  },
  decorators: [
    (Story, context) => {
      return (
        <Wrapper
          store={store}
          router={context.parameters?.reactRouter?.router}
          initialPath={context.parameters?.reactRouter?.initialPath || '/'}
        >
          <Story />
        </Wrapper>
      )
    }
  ]
}

export default preview
