import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { useUser } from '../../context'
import { SEO, Layout, StepsNavbar } from '../../components'
import { UPDATE_CUSTOMERS, UPDATE_DAILYKEY_CUSTOMER } from '../../graphql'

import {
   useDelivery,
   AddressSection,
   DeliverySection,
   DeliveryProvider,
} from '../../sections/select-delivery'

const SelectDelivery = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

   return (
      <Layout noHeader>
         <SEO title="Delivery" />
         <StepsNavbar />
         <DeliveryProvider>
            <DeliveryContent />
         </DeliveryProvider>
      </Layout>
   )
}

export default SelectDelivery

const DeliveryContent = () => {
   const { user } = useUser()
   const { state } = useDelivery()
   const { addToast } = useToasts()
   const [updateDailykeyCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {})
   const [updateCustomers] = useMutation(UPDATE_CUSTOMERS, {
      onCompleted: () => {
         addToast('Successfully saved delivery preferences.', {
            appearance: 'success',
         })
         updateDailykeyCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  defaultSubscriptionAddressId: state.address.selected.id,
               },
            },
         })
         navigate('/get-started/select-menu')
         isClient && window.localStorage.removeItem('plan')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const nextStep = () => {
      updateCustomers({
         variables: {
            where: {
               keycloakId: {
                  _eq: user.keycloakId,
               },
            },
            _set: {
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }
   return (
      <Main>
         <header css={tw`flex items-center justify-between border-b`}>
            <h1 css={tw`pt-3 pb-1 mb-3 text-green-600 text-3xl`}>Delivery</h1>
         </header>
         <AddressSection />
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
         <DeliverySection />
         <div tw="mt-4 w-full flex items-center justify-center">
            {isValid() && <Button onClick={() => nextStep()}>Continue</Button>}
         </div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Button = styled.button`
   ${tw`h-10 rounded px-5 text-white bg-green-600 hover:bg-green-700`}
`
