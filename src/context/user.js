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

export const UserProvider = ({ children }) => {
   const { brand } = useConfig()
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const [keycloakId, setKeycloakId] = React.useState('')
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         skip: !keycloakId && !brand.id,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId,
            brandId: brand.id,
         },
      }
   )

   React.useEffect(() => {
      if (isClient) {
         if (isKeycloakSupported()) {
            setKeycloakId(keycloak?.tokenParsed?.sub)
         } else if (localStorage.getItem('token')) {
            setKeycloakId(jwtDecode(localStorage.getItem('token'))?.sub)
         } else if (!localStorage.getItem('token')) {
            setUser({})
         }
      }
   }, [keycloak])

   React.useEffect(() => {
      if (customer?.id) {
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

         setUser({ ...rest, ...sub })
      }
   }, [customer])

   if (loading) return <PageLoader />
   return (
      <UserContext.Provider value={{ user, setUser }}>
         {children}
      </UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
