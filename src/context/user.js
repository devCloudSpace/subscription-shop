import 'twin.macro'
import React from 'react'
import jwtDecode from 'jwt-decode'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../lib'
import {
   CUSTOMER,
   CUSTOMER_REFERRALS,
   LOYALTY_POINTS,
   WALLETS,
} from '../graphql'
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
   const { brand, organization } = useConfig()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: { keycloakId: '' },
   })
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         skip: !keycloakId || !brand.id,
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

   useSubscription(LOYALTY_POINTS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { loyaltyPoints } = data.subscriptionData.data
         if (loyaltyPoints?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { loyaltyPoint: loyaltyPoints[0] },
            })
         }
      },
   })

   useSubscription(WALLETS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { wallets } = data.subscriptionData.data
         if (wallets?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { wallet: wallets[0] },
            })
         }
      },
   })

   useSubscription(CUSTOMER_REFERRALS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { customerReferrals } = data.subscriptionData.data
         if (customerReferrals?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { customerReferral: customerReferrals[0] },
            })
         }
      },
   })

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
      if (!loading) {
         if (customer?.id && organization?.id) {
            const user = processUser(customer, organization?.stripeAccountType)
            dispatch({ type: 'SET_USER', payload: user })
         }
      }
      setIsLoading(false)
   }, [loading, customer, organization])

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
