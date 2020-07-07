import React from 'react'
import { ApolloProvider } from './src/lib'

export const wrapRootElement = ({ element }) => {
   return <ApolloProvider>{element}</ApolloProvider>
}
