import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { SEO, Layout, StepsNavbar } from '../../../components'

import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'
import { isClient, formatDate } from '../../../utils'
import { UPDATE_CART, CART, UPDATE_DAILYKEY_CUSTOMER } from '../../../graphql'

const Checkout = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/subscription/get-started/select-plan')
      }
   }, [keycloak])

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
   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: () => {
         addToast('Saved you preferences.', {
            appearance: 'success',
         })
         navigate('/subscription/menu')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'danger',
         })
      },
   })
   const [updateCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         updateCart({
            variables: {
               id: cart.id,
               _set: {
                  customerInfo: {
                     customerEmail: user?.platform_customer?.email,
                     customerPhone: user?.platform_customer?.phoneNumber,
                     customerLastName: user?.platform_customer?.lastName,
                     customerFirstName: user?.platform_customer?.firstName,
                  },
                  paymentMethodId: state.payment.selected.id,
                  ...(isCheckout && { status: 'PROCESS' }),
               },
            },
         })
      },
      onError: error => {
         addToast(error.message, { appearance: 'success' })
      },
   })

   const { data: { cart = {} } = {} } = useQuery(CART, {
      variables: {
         id: isClient && window.localStorage.getItem('cartId'),
      },
   })

   const handleSubmit = () => {
      updateCustomer({
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

   return (
      <Main>
         <section>
            <ProfileSection />
            <PaymentSection />
         </section>
         {cart?.cartInfo && (
            <section>
               <header tw="my-3 pb-1 border-b flex items-center justify-between">
                  <h4 tw="text-lg text-gray-700">
                     Order Summary ({cart.cartInfo.products.length})
                  </h4>
               </header>
               <CartProducts>
                  {cart.cartInfo.products.map(product => (
                     <CartProduct
                        product={product}
                        key={`product-${product.cartItemId}`}
                     />
                  ))}
               </CartProducts>
               <Button onClick={handleSubmit} disabled={!Boolean(isValid())}>
                  Confirm & Pay {cart.amount}
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
                  at{' '}
                  <span>
                     {cart.address?.line1},&nbsp;
                     {cart.address?.line2 && `, ${cart.address?.line2}`}
                     {cart.address?.city}, {cart.address?.state},&nbsp;
                     {cart.address?.zipcode}
                  </span>
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

const CartProducts = styled.ul`
   ${tw`space-y-2 mb-3`}
   overflow-y: auto;
   max-height: 257px;
`

const CartProductContainer = styled.li`
   ${tw`h-20 bg-white border flex items-center px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-green-300 rounded flex items-center justify-center`}
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
   ({ disabled }) => css`
      ${tw`w-full h-10 rounded px-3 text-white bg-green-600 hover:bg-green-700`}
      ${disabled && tw`cursor-not-allowed bg-green-300 hover:bg-green-300`}
   `
)
