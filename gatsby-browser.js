import React from 'react'
import tw from 'twin.macro'
import PropTypes from 'prop-types'
import { ToastProvider } from 'react-toast-notifications'

import './src/styles/globals.css'

import { UserProvider } from './src/context'
import { ApolloProvider, ConfigProvider } from './src/lib'

export const wrapRootElement = ({ element }) => {
   return <App element={element} />
}

const App = ({ element }) => (
   <ApolloProvider>
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
)

wrapRootElement.propTypes = {
   element: PropTypes.node,
}
