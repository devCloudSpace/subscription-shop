import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { isClient, formatCurrency } from '../../../utils'
import { SEO, Loader, Layout, StepsNavbar } from '../../../components'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'
import {
   CART_SUBSCRIPTION,
   BRAND,
   MUTATIONS,
   UPDATE_CART,
   UPDATE_DAILYKEY_CUSTOMER,
} from '../../../graphql'
import OrderInfo from '../../../sections/OrderInfo'

const Checkout = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/select-plan')
      }
   }, [isAuthenticated])

   return (
      <Layout noHeader>
         <SEO title="Checkout" />
         <StepsNavbar />
         <PaymentProvider>
            <PaymentContent isCheckout />
         </PaymentProvider>
      </Layout>
   )
}

const PaymentContent = ({ isCheckout }) => {
   const { user } = useUser()
   const { state } = usePayment()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()

   const { loading, data: { cart = {} } = {} } = useSubscription(
      CART_SUBSCRIPTION,
      {
         skip: !isClient,
         variables: {
            id: isClient ? new URLSearchParams(location.search).get('id') : '',
         },
      }
   )

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Saved you preferences.', {
            appearance: 'success',
         })
         navigate(`/subscription/get-started/placing-order?id=${cart.id}`)
      },
   })
   const [updateCustomer] = useMutation(MUTATIONS.CUSTOMER.UPDATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         updateBrandCustomer({
            variables: {
               where: {
                  keycloakId: { _eq: user.keycloakId },
               },
               _set: { isSubscriber: true },
            },
         })
      },
      onError: error => {
         addToast(error.message, { appearance: 'danger' })
      },
   })
   const [updateCustomerReferralRecord] = useMutation(
      MUTATIONS.CUSTOMER_REFERRAL.UPDATE,
      {
         refetchQueries: ['customer'],
         onError: error => {
            console.log(error)
            addToast('Referral code not applied!', { appearance: 'error' })
         },
      }
   )

   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: () => {
         updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { isSubscriber: true },
            },
         })
         if (state.code.value) {
            updateCustomerReferralRecord({
               variables: {
                  brandId: brand.id,
                  keycloakId: user.keycloakId,
                  _set: {
                     referredByCode: state.code.value,
                  },
               },
            })
         }
      },
      onError: error => {
         addToast(error.message, { appearance: 'danger' })
      },
   })

   const [updatePlatformCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         updateCart({
            variables: {
               id: cart.id,
               _inc: { paymentRetryAttempt: 1 },
               _set: {
                  amount: cart?.totalPrice,
                  paymentMethodId: state.payment.selected.id,
                  customerInfo: {
                     customerEmail: user?.platform_customer?.email,
                     customerPhone: state?.profile?.phoneNumber,
                     customerLastName: state?.profile?.lastName,
                     customerFirstName: state?.profile?.firstName,
                  },
               },
            },
         })
      },
      onError: error => {
         addToast(error.message, { appearance: 'success' })
      },
   })

   const handleSubmit = () => {
      updatePlatformCustomer({
         variables: {
            keycloakId: user.keycloakId,
            _set: {
               ...state.profile,
            },
         },
      })
   }

   const isValid = () => {
      return (
         state.profile.firstName &&
         state.profile.lastName &&
         state.profile.phoneNumber &&
         state.payment.selected?.id &&
         state.code.isValid
      )
   }
   const theme = configOf('theme-color', 'Visual')

   if (loading) return <Loader inline />
   return (
      <Main>
         <section>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <SectionTitle theme={theme}>Profile Details</SectionTitle>
            </header>
            <ProfileSection />
            <PaymentSection />
         </section>
         {cart?.products?.length > 0 && (
            <section>
               <OrderInfo cart={cart} />
               <Button
                  bg={theme?.accent}
                  onClick={handleSubmit}
                  disabled={!Boolean(isValid())}
               >
                  Confirm & Pay {formatCurrency(cart.totalPrice)}
               </Button>
            </section>
         )}
      </Main>
   )
}

export default Checkout

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   margin: auto;
   margin-bottom: 24px;
   width: calc(100vw - 48px);
   min-height: calc(100vh - 160px);
   ${tw`grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`

const Button = styled.button(
   ({ disabled, bg }) => css`
      ${tw`w-full h-10 rounded px-3 text-white bg-green-600`}
      ${bg && `background-color: ${bg};`}
      ${disabled && tw`cursor-not-allowed bg-gray-400`}
   `
)

const CartProducts = styled.ul`
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`
