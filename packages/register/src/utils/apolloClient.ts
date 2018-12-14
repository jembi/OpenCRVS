import ApolloClient from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { resolve } from 'url'
import { config } from 'src/config'

const httpLink = createHttpLink({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('opencrvs')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})
