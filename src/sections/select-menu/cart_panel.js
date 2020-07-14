import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import tw, { styled, css } from 'twin.macro'

import { useMenu } from './state'
import { useUser } from '../../context'
import { ZIPCODE } from '../../graphql'
import { CloseIcon } from '../../assets/icons'

export const CartPanel = () => {
   const { state } = useMenu()
   const { user } = useUser()
   const { data: { zipcode = {} } = {} } = useQuery(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultSubscriptionAddress?.zipcode,
      },
   })

   return (
      <section>
         <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">
            Cart{' '}
            {
               state.cart.products.filter(
                  node => Object.keys(node).length !== 0
               ).length
            }
            /{user.subscription.recipes.count}
         </h4>
         <CartProducts>
            {state.cart.products.map((product, index) =>
               Object.keys(product).length === 0 ? (
                  <SkeletonCartProduct key={index} />
               ) : (
                  <CartProduct
                     key={`product-${product.cartItemId}`}
                     product={product}
                  />
               )
            )}
         </CartProducts>
         <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">Charges</h4>
         <table tw="my-3 w-full table-auto">
            <tbody>
               <tr>
                  <td tw="border px-2 py-1">Base Price</td>
                  <td tw="text-right border px-2 py-1">
                     {user.subscription.recipes.price}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">Add on Total</td>
                  <td tw="text-right border px-2 py-1">
                     {state.cart.products.reduce(
                        (a, b) => b.addonPrice || 0 + a,
                        0
                     )}
                  </td>
               </tr>
               <tr>
                  <td tw="border px-2 py-1">Delivery</td>
                  <td tw="text-right border px-2 py-1">{zipcode.price}</td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">This weeks total</td>
                  <td tw="text-right border px-2 py-1">
                     {user.subscription.recipes.price +
                        state.cart.products.reduce(
                           (a, b) => b.addonPrice || 0 + a,
                           0
                        ) +
                        zipcode.price}
                  </td>
               </tr>
            </tbody>
         </table>
         <SaveButton
            disabled={
               state.cart.products.filter(
                  node => Object.keys(node).length !== 0
               ).length !== user.subscription.recipes.count
            }
         >
            Save Selection
         </SaveButton>
      </section>
   )
}

const SkeletonCartProduct = () => {
   return (
      <SkeletonCartProductContainer>
         <aside tw="w-32 h-16 bg-green-300 rounded" />
         <main tw="w-full h-16 pl-3">
            <span />
            <span />
         </main>
      </SkeletonCartProductContainer>
   )
}

const CartProduct = ({ product }) => {
   const { dispatch } = useMenu()
   const removeRecipe = id => {
      dispatch({ type: 'REMOVE_RECIPE', payload: id })
   }
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
            <span className="remove_product">
               <button onClick={() => removeRecipe(product.option.id)}>
                  <CloseIcon size={16} tw="stroke-current text-green-400" />
               </button>
            </span>
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
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`

const SkeletonCartProductContainer = styled.li`
   ${tw`h-20 border flex items-center px-2 rounded`}
   main {
      span {
         ${tw`block h-4 w-40 mb-1 bg-gray-200 rounded-full`}
         :last-child {
            ${tw`w-24`}
         }
      }
   }
`

const CartProductContainer = styled.li`
   ${tw`h-20 bg-white border flex items-center px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-green-300 rounded flex items-center justify-center`}
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

const SaveButton = styled.button(
   ({ disabled }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-white
      text-center
      bg-green-500
   `}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-white
         text-center
         bg-green-300
         cursor-not-allowed 
      `}
   `
)
