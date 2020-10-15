import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { CART_STATUS } from '../../../graphql'
import { isClient, formatDate } from '../../../utils'
import { Layout, SEO, Loader, HelperBar } from '../../../components'
import { PlacedOrderIllo, CartIllo, PaymentIllo } from '../../../assets/icons'

const PlacingOrder = () => {
   const { configOf } = useConfig()
   const { loading, data: { cart = {} } = {} } = useSubscription(CART_STATUS, {
      variables: {
         id: isClient && window.localStorage.getItem('cartId'),
      },
   })

   React.useEffect(() => {
      if (!cart) {
         navigate('/subscription/menu')
      }
   }, [cart])

   const gotoMenu = () => {
      isClient && window.localStorage.removeItem('cartId')
      isClient && window.localStorage.removeItem('plan')
      navigate('/subscription/menu')
   }
   const hasColor = configOf('theme-color', 'Visual')

   return (
      <Layout>
         <SEO title="Placing Order" />
         <Wrapper>
            <Main tw="pt-4">
               {loading ? (
                  <Loader inline />
               ) : (
                  <Content>
                     {cart && (
                        <>
                           <section>
                              <header tw="my-3 pb-1 border-b flex items-center justify-between">
                                 <SectionTitle hasColor={hasColor}>
                                    Order Summary (
                                    {cart.cartInfo.products.length})
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
                              <section tw="my-4 text-gray-700">
                                 * Your box will be delivered on{' '}
                                 <span>
                                    {formatDate(
                                       cart.fulfillmentInfo.slot.from,
                                       {
                                          month: 'short',
                                          day: 'numeric',
                                       }
                                    )}
                                    &nbsp;between{' '}
                                    {formatDate(
                                       cart.fulfillmentInfo.slot.from,
                                       {
                                          minute: 'numeric',
                                          hour: 'numeric',
                                       }
                                    )}
                                    &nbsp;-&nbsp;
                                    {formatDate(cart.fulfillmentInfo.slot.to, {
                                       minute: 'numeric',
                                       hour: 'numeric',
                                    })}
                                 </span>{' '}
                                 at{' '}
                                 <span>
                                    {cart.address?.line1},&nbsp;
                                    {cart.address?.line2 &&
                                       `, ${cart.address?.line2}`}
                                    {cart.address?.city}, {cart.address?.state}
                                    ,&nbsp;
                                    {cart.address?.zipcode}
                                 </span>
                              </section>
                           </section>
                           <Steps>
                              <Step
                                 className={`${
                                    cart.status !== 'PENDING' ? 'active' : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <CartIllo />
                                 </span>
                                 Saving Cart
                                 {cart.status === 'PENDING' && <Pulse />}
                              </Step>
                              <Step
                                 className={`${
                                    cart.paymentStatus === 'SUCCEEDED'
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PaymentIllo />
                                 </span>
                                 Processing Payment
                                 {cart.paymentStatus !== 'SUCCEEDED' && (
                                    <Pulse />
                                 )}
                              </Step>
                              <Step
                                 className={`${
                                    cart.status === 'ORDER_PLACED' &&
                                    cart.orderId
                                       ? 'active'
                                       : 'null'
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PlacedOrderIllo />
                                 </span>
                                 Order Placed
                                 {cart.status !== 'ORDER_PLACED' ||
                                    (!Boolean(cart.orderId) && <Pulse />)}
                              </Step>
                           </Steps>
                           {cart.status === 'ORDER_PLACED' && cart.orderId && (
                              <HelperBar type="success" tw="mt-3">
                                 <HelperBar.Title>
                                    <span role="img" aria-label="celebrate">
                                       🎉
                                    </span>
                                    Congratulations!{' '}
                                 </HelperBar.Title>
                                 <HelperBar.SubTitle>
                                    Your order has been placed. Continue
                                    selecting menu for others weeks.
                                 </HelperBar.SubTitle>
                                 <HelperBar.Button onClick={() => gotoMenu()}>
                                    Browse Menu
                                 </HelperBar.Button>
                              </HelperBar>
                           )}
                        </>
                     )}
                  </Content>
               )}
            </Main>
         </Wrapper>
      </Layout>
   )
}

export default PlacingOrder

const Pulse = () => (
   <span tw="mt-3 flex h-3 w-3 relative">
      <span tw="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
      <span tw="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
   </span>
)

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

const Wrapper = styled.div`
   ${tw`bg-gray-100`}
`

const SectionTitle = styled.h3(
   ({ hasColor }) => css`
      ${tw`text-green-600 text-lg`}
      ${hasColor?.accent && `color: ${hasColor.accent}`}
   `
)

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   background: #fff;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Content = styled.section`
   margin: auto;
   max-width: 567px;
   width: calc(100% - 40px);
   ${tw`flex flex-col items-center`}
`

const Steps = styled.ul`
   ${tw`w-full flex items-start justify-between`}
`

const Step = styled.li`
   ${tw`flex flex-col items-center justify-center text-gray-600`}
   &.active {
      ${tw`text-green-600`}
   }
`

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
