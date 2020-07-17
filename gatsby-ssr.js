import React from 'react'
import { ApolloProvider } from './src/lib'
import { ToastProvider } from 'react-toast-notifications'

export const wrapRootElement = ({ element }) => {
   return (
      <ApolloProvider>
         <ToastProvider
            autoDismiss
            placement="bottom-center"
            autoDismissTimeout={3000}
         >
            {element}
         </ToastProvider>
      </ApolloProvider>
   )
}
