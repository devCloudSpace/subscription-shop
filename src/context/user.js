import 'twin.macro'
import React from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery } from '@apollo/react-hooks'

import { Loader } from '../components'
import { CUSTOMER_DETAILS } from '../graphql'

const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER_DETAILS,
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
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
