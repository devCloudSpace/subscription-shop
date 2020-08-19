import 'twin.macro'
import React from 'react'
import { useSubscription } from '@apollo/react-hooks'

import { CONVENTIONS } from '../graphql'
import { PageLoader } from '../components'

const ConfigContext = React.createContext()

export const ConfigProvider = ({ children }) => {
   const { loading, data: { conventions = [] } = {} } = useSubscription(
      CONVENTIONS,
      {
         variables: { identifier: { _eq: 'primary-labels' } },
      }
   )

   if (loading) return <PageLoader />
   return (
      <ConfigContext.Provider value={{ primary: { ...conventions[0].value } }}>
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = () => React.useContext(ConfigContext)
