import React from 'react'
import PropTypes from 'prop-types'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'

import './src/styles/globals.css'

import { ApolloProvider } from './src/lib'
import { Loader } from './src/components'

const keycloak = new Keycloak({
   realm: process.env.GATSBY_KEYCLOAK_REALM,
   url: process.env.GATSBY_KEYCLOAK_URL,
   clientId: process.env.GATSBY_CLIENTID,
})

export const wrapRootElement = ({ element }) => {
   return (
      <KeycloakProvider
         keycloak={keycloak}
         initConfig={{
            onLoad: 'check-sso',
            promiseType: 'native',
         }}
         LoadingComponent={<Loader />}
      >
         <ApolloProvider>{element}</ApolloProvider>
      </KeycloakProvider>
   )
}

wrapRootElement.propTypes = {
   element: PropTypes.node,
}
