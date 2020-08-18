import 'twin.macro'
import React from 'react'
import { useSubscription } from '@apollo/react-hooks'

import { Loader } from '../components'
import { CONVENTIONS } from '../graphql'

const ConfigContext = React.createContext()

export const ConfigProvider = ({ children }) => {
   const { loading, data: { conventions = [] } = {} } = useSubscription(
      CONVENTIONS,
      {
         variables: { identifier: { _eq: 'primary-labels' } },
      }
   )

   if (loading)
      return (
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
      )
   return (
      <ConfigContext.Provider value={{ primary: { ...conventions[0].value } }}>
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = () => React.useContext(ConfigContext)
