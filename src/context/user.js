import 'twin.macro'
import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useKeycloak } from '@react-keycloak/web'

import { useConfig } from '../lib'
import { CUSTOMER } from '../graphql'
import { PageLoader } from '../components'
import { isEmpty } from 'lodash'

const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
   const { brand } = useConfig()
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         fetchPolicy: 'network-only',
         variables: {
            brandId: brand.id,
            keycloakId: keycloak?.tokenParsed?.sub,
         },
      }
   )

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
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
