import React from 'react'
import { ToastProvider } from 'react-toast-notifications'
import { ApolloProvider, ConfigProvider } from './src/lib'

export const wrapRootElement = ({ element }) => {
   return (
      <ApolloProvider>
         <ConfigProvider>
            <ToastProvider
               autoDismiss
               placement="bottom-center"
               autoDismissTimeout={3000}
            >
               {element}
            </ToastProvider>
         </ConfigProvider>
      </ApolloProvider>
   )
}
