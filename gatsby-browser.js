import React from 'react'

import './src/styles/globals.css'

import { ApolloProvider, AuthProvider } from './src/lib'

export const wrapRootElement = ({ element }) => {
   return (
      <ApolloProvider>
         <AuthProvider>{element}</AuthProvider>
      </ApolloProvider>
   )
}
