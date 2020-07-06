import React from 'react'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'

// Apollo Client Imports
import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloProvider } from '@apollo/react-hooks'

import './src/styles/globals.css'

const keycloak = new Keycloak({
   realm: process.env.GATSBY_KEYCLOAK_REALM,
   url: process.env.GATSBY_KEYCLOAK_URL,
   clientId: process.env.GATSBY_CLIENTID,
   'ssl-required': 'none',
   'public-client': true,
   'bearer-only': false,
   'verify-token-audience': true,
   'use-resource-role-mappings': true,
   'confidential-port': 0,
})

const authLink = setContext((_, { headers }) => {
   return {
      headers: {
         ...headers,
         'x-hasura-admin-secret': `${process.env.GATSBY_ADMIN_SECRET}`,
      },
   }
})

const wsLink = new WebSocketLink({
   uri: process.env.GATSBY_DATA_HUB_WSS,
   options: {
      reconnect: true,
      connectionParams: {
         headers: {
            'x-hasura-admin-secret': `${process.env.GATSBY_ADMIN_SECRET}`,
         },
      },
   },
})

const httpLink = new HttpLink({
   uri: process.env.GATSBY_DATA_HUB_HTTPS,
})

const link = split(
   ({ query }) => {
      const definition = getMainDefinition(query)
      return (
         definition.kind === 'OperationDefinition' &&
         definition.operation === 'subscription'
      )
   },
   wsLink,
   authLink.concat(httpLink)
)

const client = new ApolloClient({
   link,
   cache: new InMemoryCache(),
})

export const wrapRootElement = ({ element }) => {
   return (
      <ApolloProvider client={client}>
         <KeycloakProvider
            keycloak={keycloak}
            initConfig={{
               promiseType: 'native',
               onLoad: 'check-sso',
               silentCheckSsoRedirectUri:
                  window.location.origin + '/silent-check-sso.xhtml',
            }}
            LoadingComponent={<div>Loading...</div>}
         >
            {element}
         </KeycloakProvider>
      </ApolloProvider>
   )
}
