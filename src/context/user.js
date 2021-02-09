import 'twin.macro'
import React from 'react'
import jwtDecode from 'jwt-decode'
import { useQuery } from '@apollo/react-hooks'

import { useConfig } from '../lib'
import { CUSTOMER } from '../graphql'
import { PageLoader } from '../components'
import { isClient, processUser } from '../utils'

const UserContext = React.createContext()

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_USER':
         return {
            ...state,
            isAuthenticated: true,
            user: { ...state.user, ...payload },
         }
      case 'CLEAR_USER':
         return {
            ...state,
            isAuthenticated: false,
            user: { keycloakId: '' },
         }
   }
}

export const UserProvider = ({ children }) => {
   const { brand } = useConfig()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: { keycloakId: '' },
   })
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         skip: !keycloakId && !brand.id,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId,
            brandId: brand.id,
         },
         onError: () => {
            setIsLoading(false)
         },
      }
   )

   React.useEffect(() => {
      if (isClient) {
         const token = localStorage.getItem('token')
         if (token) {
            const user = jwtDecode(token)
            setKeycloakId(user?.sub)
            dispatch({ type: 'SET_USER', payload: { keycloakId: user?.sub } })
         } else {
            dispatch({ type: 'CLEAR_USER' })
         }
      }
   }, [])

   React.useEffect(() => {
      if (!loading && customer?.id) {
         const user = processUser(customer)
         dispatch({ type: 'SET_USER', payload: user })
      }
      setIsLoading(false)
   }, [loading, customer])

   if (isLoading) return <PageLoader />
   return (
      <UserContext.Provider
         value={{
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            dispatch,
         }}
      >
         {children}
      </UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
