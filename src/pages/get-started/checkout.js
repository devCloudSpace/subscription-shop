import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { SEO, Layout, StepsNavbar } from '../../components'

import {
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../sections/checkout'
import { useUser } from '../../context'
import { UPDATE_CARTS, CARTS_BY_USER } from '../../graphql'
import { useToasts } from 'react-toast-notifications'

const Checkout = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

   return (
      <Layout noHeader>
         <SEO title="Checkout" />
         <StepsNavbar />
         <PaymentProvider>
            <PaymentContent />
         </PaymentProvider>
      </Layout>
   )
}

const PaymentContent = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const [updateCarts] = useMutation(UPDATE_CARTS, {
      onCompleted: () => {
         addToast('Saved you preferences.', {
            appearance: 'success',
         })
         navigate('/menu')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'danger',
         })
      },
   })
   const [paymentMethodId, setPaymentMethodId] = React.useState('')
   const { data: { carts = [] } = {} } = useQuery(CARTS_BY_USER, {
      variables: {
         keycloakId: user.keycloakId,
      },
   })

   const handleSubmit = () => {
      const cartIds = carts.map(cart => cart.id)
      updateCarts({
         variables: {
            _in: cartIds,
            _set: {
               customerInfo: {
                  customerEmail: user.email,
                  customerPhone: user.phoneNumber,
                  customerLastName: user.lastName,
                  customerFirstName: user.firstName,
               },
               paymentMethodId,
            },
         },
      })
   }
   return (
      <Main>
         <header tw="flex items-center justify-between border-b">
            <h1 tw="pt-3 mb-3 text-green-600 text-3xl">Checkout</h1>
            <Button onClick={handleSubmit}>Save</Button>
         </header>
         <ProfileSection />
         <PaymentSection setPaymentMethodId={setPaymentMethodId} />
      </Main>
   )
}

export default Checkout

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   margin-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 160px);
`

const Button = styled.button`
   ${tw`rounded px-3 h-8 bg-transparent hover:bg-green-600 text-green-600 border border-green-600 hover:text-white`}
`
