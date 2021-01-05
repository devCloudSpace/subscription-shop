import 'twin.macro'
import jwtDecode from 'jwt-decode'
import React from 'react'
import { isEmpty } from 'lodash'
import { useQuery } from '@apollo/react-hooks'
import { useKeycloak } from '@react-keycloak/web'

import { useConfig } from '../lib'
import { CUSTOMER } from '../graphql'
import { PageLoader } from '../components'
import { isClient, isKeycloakSupported } from '../utils'

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
            user: {},
            isAuthenticated: false,
         }
   }
}

export const UserProvider = ({ children }) => {
   const { brand } = useConfig()
   const [keycloak] = useKeycloak()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: {
         keycloakId: '',
      },
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
         if (isKeycloakSupported()) {
            setKeycloakId(keycloak?.tokenParsed?.sub)
            dispatch({ type: 'SET_USER', payload: { keycloakId: user?.sub } })
         } else if (localStorage.getItem('token')) {
            const user = jwtDecode(localStorage.getItem('token'))
            setKeycloakId(user?.sub)
            dispatch({ type: 'SET_USER', payload: { keycloakId: user?.sub } })
         } else if (!localStorage.getItem('token')) {
            dispatch({ type: 'CLEAR_USER' })
         }
      }
   }, [keycloak])

   React.useEffect(() => {
      if (!loading && customer?.id) {
         const sub = {}
         const { brandCustomers = [], ...rest } = customer

         if (!isEmpty(brandCustomers)) {
            const [brand_customer] = brandCustomers

            const {
               subscription = null,
               subscriptionId = null,
               subscriptionAddressId = null,
               subscriptionPaymentMethodId = null,
            } = brand_customer

            rest.subscription = subscription
            rest.subscriptionId = subscriptionId
            rest.subscriptionAddressId = subscriptionAddressId
            rest.subscriptionPaymentMethodId = subscriptionPaymentMethodId

            sub.defaultAddress = rest?.platform_customer?.addresses.find(
               address => address.id === subscriptionAddressId
            )

            sub.defaultPaymentMethod = rest?.platform_customer?.paymentMethods.find(
               method =>
                  method.stripePaymentMethodId === subscriptionPaymentMethodId
            )
         }

         dispatch({ type: 'SET_USER', payload: { ...rest, ...sub } })
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
