import React from 'react'
import tw from 'twin.macro'
import PropTypes from 'prop-types'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'
import { ToastProvider } from 'react-toast-notifications'

import './src/styles/globals.css'

import { PageLoader } from './src/components'
import { ApolloProvider, ConfigProvider } from './src/lib'

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
         LoadingComponent={<PageLoader />}
      >
         <ApolloProvider>
            <ConfigProvider>
               <ToastProvider
                  autoDismiss
                  placement="top-center"
                  autoDismissTimeout={3000}
               >
                  <div css={tw`overflow-hidden`}>{element}</div>
               </ToastProvider>
            </ConfigProvider>
         </ApolloProvider>
      </KeycloakProvider>
   )
}

wrapRootElement.propTypes = {
   element: PropTypes.node,
}
