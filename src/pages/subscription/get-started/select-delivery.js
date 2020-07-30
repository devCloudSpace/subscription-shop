import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../../utils'
import { UPDATE_CUSTOMER } from '../../../graphql'
import { SEO, Layout, StepsNavbar } from '../../../components'

import {
   useDelivery,
   AddressSection,
   DeliverySection,
   DeliveryProvider,
   DeliveryDateSection,
} from '../../../sections/select-delivery'

const SelectDelivery = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/subscription/get-started/select-plan')
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
   const [keycloak] = useKeycloak()
   const { state } = useDelivery()
   const { addToast } = useToasts()
   const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Successfully saved delivery preferences.', {
            appearance: 'success',
         })
         navigate(
            `/subscription/get-started/select-menu?date=${
               state.delivery_date.selected.fulfillmentDate
            }${
               state.skip_list.length > 0 ? `&previous=${state.skip_list}` : ''
            }`
         )
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const nextStep = () => {
      updateCustomer({
         variables: {
            keycloakId: keycloak?.tokenParsed?.sub,
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
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }
   return (
      <Main>
         <header css={tw`flex items-center justify-between border-b`}>
            <h1 css={tw`pt-3 pb-1 mb-3 text-green-600 text-3xl`}>Delivery</h1>
         </header>
         <AddressSection />
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Delivery Day</h2>
         <DeliverySection />
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Delivery Date</h2>
         <DeliveryDateSection />
         <div tw="mt-4 w-full flex items-center justify-center">
            <Button onClick={() => nextStep()} disabled={!isValid()}>
               Continue
            </Button>
         </div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Button = styled.button(
   ({ disabled }) => css`
      ${tw`h-10 rounded px-8 text-white bg-green-600 hover:bg-green-700`}
      ${disabled && tw`cursor-not-allowed bg-green-300 hover:bg-green-300`}
   `
)
