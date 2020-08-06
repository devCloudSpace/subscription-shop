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
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: `${window.location.origin}/subscription/silent-check-sso.xhtml`,
         }}
         LoadingComponent={
            <div>
               <header tw="px-3 top-0 w-screen fixed h-16 border-b border-gray-200 flex items-center justify-between">
                  <aside tw="flex items-center">
                     <span tw="mr-3 w-12 h-12 rounded-full bg-gray-200 border border-gray-300" />
                     <span tw="w-32 h-8 rounded bg-gray-200 border border-gray-300" />
                  </aside>
                  <aside tw="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
               </header>
               <main>
                  <Loader inline />
               </main>
            </div>
         }
      >
         <ApolloProvider>
            <ToastProvider
               autoDismiss
               placement="top-center"
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
