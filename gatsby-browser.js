import React from 'react'
import tw from 'twin.macro'
import PropTypes from 'prop-types'
import Keycloak from 'keycloak-js'
import { KeycloakProvider } from '@react-keycloak/web'
import { ToastProvider } from 'react-toast-notifications'

import './src/styles/globals.css'

import { PageLoader } from './src/components'
import { UserProvider } from './src/context'
import { isKeycloakSupported } from './src/utils'
import { ApolloProvider, ConfigProvider } from './src/lib'

const keycloak = new Keycloak({
   realm: process.env.GATSBY_KEYCLOAK_REALM,
   url: process.env.GATSBY_KEYCLOAK_URL,
   clientId: process.env.GATSBY_CLIENTID,
})

export const wrapRootElement = ({ element }) => {
   if (isKeycloakSupported()) {
      return (
         <KeycloakProvider
            keycloak={keycloak}
            initConfig={{
               onLoad: 'check-sso',
               silentCheckSsoRedirectUri: `${window.location.origin}/subscription/silent-check-sso.xhtml`,
            }}
            LoadingComponent={<PageLoader />}
         >
            <App element={element}/>
         </KeycloakProvider>
      )
   }
   return <App element={element}/>
}

const App = ({element}) => <ApolloProvider>
<ConfigProvider>
   <UserProvider>
      <ToastProvider
         autoDismiss
         placement="top-center"
         autoDismissTimeout={3000}
      >
         <div css={tw`overflow-hidden`}>{element}</div>
      </ToastProvider>
   </UserProvider>
</ConfigProvider>
</ApolloProvider>

wrapRootElement.propTypes = {
   element: PropTypes.node,
}
