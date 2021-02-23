import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import { styled } from 'twin.macro'

import { useUser } from '../context'
import { normalizeAddress } from '../utils'
import { Billing, CartProduct } from '../components'

const OrderInfo = ({ cart, showViewOrderButton = false }) => {
   const { user } = useUser()

   const planProducts =
      cart?.cartInfo?.products.filter(node => !node.isAddOn) || []
   const addOnProducts =
      cart?.cartInfo?.products.filter(node => node.isAddOn) || []
   return (
      <div>
         <section>
            <header tw="mt-3 mb-2 pb-1 border-b flex items-center justify-between">
               <h4 tw="text-lg text-gray-700">
                  Your Box ({user?.subscription?.recipes?.count})
               </h4>
            </header>
            <ProductCards>
               {planProducts.map(product => (
                  <CartProduct
                     product={product}
                     isRemovable={false}
                     key={`product-${product.cartItemId}`}
                  />
               ))}
            </ProductCards>
         </section>
         <section>
            <header tw="mt-3 mb-2 pb-1 border-b flex items-center justify-between">
               <h4 tw="text-lg text-gray-700">Your Add Ons</h4>
            </header>
            {addOnProducts.length > 0 ? (
               <ProductCards>
                  {addOnProducts.map(product => (
                     <CartProduct
                        product={product}
                        isRemovable={false}
                        key={`product-${product.cartItemId}`}
                     />
                  ))}
               </ProductCards>
            ) : (
               <span>No Add Ons</span>
            )}
         </section>
         <section>
            <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">Charges</h4>
            <Billing billing={cart?.billingDetails} />
         </section>
         <section tw="mt-2 mb-3">
            {cart?.fulfillmentInfo?.type.includes('DELIVERY') ? (
               <p tw="text-gray-500">
                  Your box will be delivered on{' '}
                  <span>
                     {moment(cart?.fulfillmentInfo?.slot?.from).format('MMM D')}
                     &nbsp;between{' '}
                     {moment(cart?.fulfillmentInfo?.slot?.from).format(
                        'hh:mm A'
                     )}
                     &nbsp;-&nbsp;
                     {moment(cart?.fulfillmentInfo?.slot?.to).format('hh:mm A')}
                  </span>{' '}
                  at <span>{normalizeAddress(cart?.address)}</span>
               </p>
            ) : (
               <p tw="text-gray-500">
                  Pickup your box in between{' '}
                  {moment(cart?.billingDetails?.deliveryPrice?.value).format(
                     'MMM D'
                  )}
                  ,{' '}
                  {moment(cart?.fulfillmentInfo?.slot?.from).format('hh:mm A')}{' '}
                  - {moment(cart?.fulfillmentInfo?.slot?.to).format('hh:mm A')}{' '}
                  from {normalizeAddress(cart?.fulfillmentInfo?.address)}
               </p>
            )}
         </section>
         {showViewOrderButton && (
            <button
               tw="h-10 w-full rounded text-white text-center bg-green-500"
               onClick={() => navigate('/subscription/account/orders')}
            >
               Go to Order
            </button>
         )}
      </div>
   )
}

export default OrderInfo

const ProductCards = styled.ul`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
