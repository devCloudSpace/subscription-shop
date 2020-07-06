import React from 'react'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'

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

const Loading = () => <div>Loading...</div>

export const wrapRootElement = ({ element }) => {
   return (
      <KeycloakProvider
         keycloak={keycloak}
         initConfig={{
            promiseType: 'native',
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri:
               window.location.origin + '/silent-check-sso.xhtml',
         }}
         LoadingComponent={<Loading />}
      >
         {element}
      </KeycloakProvider>
   )
}
