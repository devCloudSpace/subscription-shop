import 'twin.macro'
import React from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery } from '@apollo/react-hooks'

import { CUSTOMER } from '../graphql'
import { PageLoader } from '../components'

const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         fetchPolicy: 'network-only',
         variables: {
            keycloakId: keycloak?.tokenParsed?.sub,
         },
      }
   )

   React.useEffect(() => {
      if (customer?.id) {
         const sub = {}
         if (customer.subscriptionAddressId) {
            const address = customer?.platform_customer?.addresses.find(
               address => address.id === customer.subscriptionAddressId
            )
            sub.defaultAddress = address
         }
         if (customer.subscriptionPaymentMethodId) {
            const paymentMethod = customer?.platform_customer?.paymentMethods.find(
               method =>
                  method.stripePaymentMethodId ===
                  customer.subscriptionPaymentMethodId
            )
            sub.defaultPaymentMethod = paymentMethod
         }
         setUser({ ...customer, ...sub })
      }
   }, [customer])

   if (loading) return <PageLoader />
   return (
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
