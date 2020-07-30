import React from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery } from '@apollo/react-hooks'

import { Loader } from '../components'
import { CUSTOMER_DETAILS } from '../graphql'

const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const [status, setStatus] = React.useState('PROFILE_LOADING')
   const { data: { customer = {} } = {} } = useQuery(CUSTOMER_DETAILS, {
      variables: {
         keycloakId: keycloak?.tokenParsed?.sub,
      },
   })

   React.useEffect(() => {
      if (customer?.id) {
         const data = {}
         if (customer.subscriptionAddressId) {
            const address = customer?.platform_customer?.addresses.find(
               address => address.id === customer.subscriptionAddressId
            )
            data.defaultAddress = address
         }
         if (customer.subscriptionPaymentMethodId) {
            const paymentMethod = customer?.platform_customer?.paymentMethods.find(
               method => method.id === customer.subscriptionPaymentMethodId
            )
            data.defaultPaymentMethod = paymentMethod
         }
         setUser({ ...customer, ...data })
         setStatus('PROFILE_SUCCESS')
      } else {
         setStatus('NOT_LOGGED_IN')
      }
   }, [customer])

   if (status === 'PROFILE_LOADING') return <Loader />
   return (
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
