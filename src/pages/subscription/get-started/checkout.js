import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { isClient, formatCurrency, normalizeAddress } from '../../../utils'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'
import { CheckIcon } from '../../../assets/icons'
import {
   CART,
   BRAND,
   UPDATE_CART,
   UPDATE_CUSTOMER,
   UPDATE_DAILYKEY_CUSTOMER,
} from '../../../graphql'
import { BillingDetails } from '../../../sections/select-menu/cart_panel'

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
   const { configOf } = useConfig()

   const { data: { cart = {} } = {} } = useQuery(CART, {
      variables: {
         id: isClient && window.localStorage.getItem('cartId'),
      },
   })

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Saved you preferences.', {
            appearance: 'success',
         })
         navigate(`/subscription/get-started/placing-order`)
      },
   })
   const [updateCustomer] = useMutation(UPDATE_CUSTOMER, {
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

   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: () => {
         updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { isSubscriber: true },
            },
         })
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
               _set: {
                  customerInfo: {
                     customerEmail: user?.platform_customer?.email,
                     customerPhone: state?.profile?.phoneNumber,
                     customerLastName: state?.profile?.lastName,
                     customerFirstName: state?.profile?.firstName,
                  },
                  paymentMethodId: state.payment.selected.id,
                  ...(isCheckout && {
                     status: 'PROCESS',
                     amount: cart.totalPrice,
                  }),
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
         state.payment.selected?.id
      )
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <Main>
         <section>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <SectionTitle theme={theme}>Profile Details</SectionTitle>
            </header>
            <ProfileSection />
            <PaymentSection />
         </section>
         {cart?.cartInfo && (
            <section>
               <section>
                  <header tw="my-3 pb-1 border-b flex items-center justify-between">
                     <h4 tw="text-lg text-gray-700">
                        Your Box ({user?.subscription?.recipes?.count})
                     </h4>
                  </header>
                  <CartProducts>
                     {cart?.cartInfo?.products?.map(
                        product =>
                           !product.isAddOn && (
                              <CartProduct
                                 product={product}
                                 key={product.cartItemId}
                              />
                           )
                     )}
                  </CartProducts>
               </section>
               <section tw="mb-3">
                  <header tw="my-3 pb-1 border-b flex items-center justify-between">
                     <h4 tw="text-lg text-gray-700">Your Add Ons</h4>
                  </header>
                  <CartProducts>
                     {cart?.cartInfo?.products?.map(
                        product =>
                           product.isAddOn && (
                              <CartProduct
                                 product={product}
                                 key={product.cartItemId}
                              />
                           )
                     )}
                  </CartProducts>
               </section>
               <BillingDetails billing={cart?.billingDetails} />
               <Button
                  bg={theme?.accent}
                  onClick={handleSubmit}
                  disabled={!Boolean(isValid())}
               >
                  Confirm & Pay {formatCurrency(cart.totalPrice)}
               </Button>
               <section tw="my-3">
                  {cart?.fulfillmentInfo?.type.includes('DELIVERY') ? (
                     <p tw="text-gray-500 text-sm">
                        Your box will be delivered on{' '}
                        <span>
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'MMM D'
                           )}
                           &nbsp;between{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'hh:mm A'
                           )}
                           &nbsp;-&nbsp;
                           {moment(cart?.fulfillmentInfo?.slot?.to).format(
                              'hh:mm A'
                           )}
                        </span>{' '}
                        at <span>{normalizeAddress(cart?.address)}</span>
                     </p>
                  ) : (
                     <p tw="text-gray-500 text-sm">
                        Pickup your box in between{' '}
                        {moment(
                           cart?.billingDetails?.deliveryPrice?.value
                        ).format('MMM D')}
                        ,{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.from).format(
                           'hh:mm A'
                        )}{' '}
                        -{' '}
                        {moment(cart?.fulfillmentInfo?.slot?.to).format(
                           'hh:mm A'
                        )}{' '}
                        from {normalizeAddress(cart?.fulfillmentInfo?.address)}
                     </p>
                  )}
               </section>
            </section>
         )}
      </Main>
   )
}

export default Checkout

const CartProduct = ({ product }) => {
   return (
      <CartProductContainer>
         <aside tw="flex-shrink-0 relative">
            {product.image ? (
               <img
                  src={product.image}
                  alt={product.name}
                  title={product.name}
                  tw="object-cover rounded w-full h-full"
               />
            ) : (
               <span tw="text-teal-500" title={product.name}>
                  N/A
               </span>
            )}
         </aside>
         <main tw="pl-3">
            <p tw="text-gray-800" title={product.name}>
               {product.name}
            </p>
            {product.isAddOn && (
               <p tw="text-green-600">{formatCurrency(product.unitPrice)}</p>
            )}
            {!product.isAddOn && product.isAutoAdded && (
               <span tw="text-sm px-1 rounded bg-gray-200 text-gray-600 border border-gray-200">
                  Auto Selected
               </span>
            )}
         </main>
      </CartProductContainer>
   )
}

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

const CartProductContainer = styled.li`
   ${tw`h-auto py-2 bg-white border flex items-start px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-gray-300 rounded flex items-start justify-center`}
      span.remove_product {
         display: none;
         background: rgba(0, 0, 0, 0.3);
         ${tw`absolute h-full w-full items-center justify-center`}
         button {
            ${tw`bg-white h-6 w-6 rounded-full flex items-center justify-center`}
         }
      }
      :hover {
         span.remove_product {
            display: flex;
         }
      }
   }
`
