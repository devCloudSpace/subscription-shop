import React from 'react'
import tw from 'twin.macro'
import PropTypes from 'prop-types'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'
import { ToastProvider } from 'react-toast-notifications'

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
            flow: 'implicit',
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: `${window.location.origin}${
               process.env.NODE_ENV === 'production' ? '/subscription' : ''
            }/silent-check-sso.xhtml`,
         }}
         LoadingComponent={<Loader />}
      >
         <ApolloProvider>
            <ToastProvider
               autoDismiss
               placement="bottom-center"
               autoDismissTimeout={3000}
            >
               <div css={tw`overflow-hidden`}>{element}</div>
            </ToastProvider>
         </ApolloProvider>
      </KeycloakProvider>
   )
}

wrapRootElement.propTypes = {
   element: PropTypes.node,
}
