import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { SEO, Layout, StepsNavbar } from '../../../components'
import {
   isClient,
   formatDate,
   formatCurrency,
   normalizeAddress,
} from '../../../utils'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'
import {
   CART,
   BRAND,
   UPDATE_CART,
   UPDATE_CUSTOMER,
   UPDATE_DAILYKEY_CUSTOMER,
} from '../../../graphql'

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
               <header tw="my-3 pb-1 border-b flex items-center justify-between">
                  <SectionTitle theme={theme}>
                     Order Summary ({cart.cartInfo.products.length})
                  </SectionTitle>
               </header>
               <CartProducts>
                  {cart.cartInfo.products.map(product => (
                     <CartProduct
                        product={product}
                        key={`product-${product.cartItemId}`}
                     />
                  ))}
               </CartProducts>
               <Button
                  onClick={handleSubmit}
                  bg={theme?.accent}
                  disabled={!Boolean(isValid())}
               >
                  Confirm & Pay {formatCurrency(cart.totalPrice)}
               </Button>
               <section tw="my-4 text-gray-700">
                  * Your box will be delivered on{' '}
                  <span>
                     {formatDate(cart.fulfillmentInfo.slot.from, {
                        month: 'short',
                        day: 'numeric',
                     })}
                     &nbsp;between{' '}
                     {formatDate(cart.fulfillmentInfo.slot.from, {
                        minute: 'numeric',
                        hour: 'numeric',
                     })}
                     &nbsp;-&nbsp;
                     {formatDate(cart.fulfillmentInfo.slot.to, {
                        minute: 'numeric',
                        hour: 'numeric',
                     })}
                  </span>{' '}
                  at <span>{normalizeAddress(user.defaultAddress)}</span>
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
         <main tw="h-16 pl-3">
            <p tw="truncate text-gray-800" title={product.name}>
               {product.name}
            </p>
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

const CartProducts = styled.ul`
   ${tw`space-y-2 mb-3`}
   overflow-y: auto;
   max-height: 257px;
`

const CartProductContainer = styled.li`
   ${tw`h-20 bg-white border flex items-center px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-gray-300 rounded flex items-center justify-center`}
   }
`

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
      ${disabled && tw`cursor-not-allowed bg-green-300`}
      ${bg && `background-color: ${bg};`}
   `
)
