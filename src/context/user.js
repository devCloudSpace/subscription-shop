import React from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { useSubscription, useQuery } from '@apollo/react-hooks'

import { Loader } from '../components'
import { CUSTOMER_DETAILS, CRM_CUSTOMER_DETAILS } from '../graphql'

const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
   const [keycloak] = useKeycloak()
   const [user, setUser] = React.useState({})
   const {
      loading: crmLoading,
      data: { customers = [] } = {},
   } = useSubscription(CRM_CUSTOMER_DETAILS, {
      variables: {
         keycloakId: keycloak?.tokenParsed?.sub,
      },
   })
   const { loading: platformLoading } = useQuery(CUSTOMER_DETAILS, {
      variables: {
         keycloakId: keycloak?.tokenParsed?.sub,
      },
      onCompleted: ({ platform_customer: customer = {} }) => {
         setUser({
            ...user,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber,
            stripeCustomerId: customer.stripeCustomerId,

            address: customer.customerAddresses,
            defaultAddress: customer.defaultCustomerAddress,
            defaultAddressId: customer.defaultCustomerAddressId,
            defaultSubscriptionAddress: customer.defaultSubscriptionAddress,
            defaultSubscriptionAddressId: customer.defaultSubscriptionAddressId,

            paymentMethods: customer.stripePaymentMethods,
            defaultPaymentMethod: customer.defaultStripePaymentMethod,
            defaultPaymentMethodId: customer.defaultPaymentMethodId,
         })
      },
   })

   React.useEffect(() => {
      if (customers.length === 1) {
         setUser({
            ...user,
            ...customers[0],
            keycloakId: keycloak?.tokenParsed?.sub,
         })
      }
   }, [customers])

   if (crmLoading || platformLoading) return <Loader />
   return (
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
