import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useUser } from '../../context'
import { CloseIcon } from '../../assets/icons'
import {
   ZIPCODE,
   CREATE_CART,
   UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
} from '../../graphql'

export const CartPanel = () => {
   const { user } = useUser()
   const { state, dispatch } = useMenu()
   const [upsertCart] = useMutation(CREATE_CART, {
      refetchQueries: () => ['cart'],
   })
   const [updateCartSkipStatus] = useMutation(
      UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
      {
         refetchQueries: ['cart'],
      }
   )
   const { data: { zipcode = {} } = {} } = useQuery(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultSubscriptionAddress?.zipcode,
      },
   })

   const submitSelection = () => {
      upsertCart({
         variables: {
            object: {
               status: 'PENDING',
               customerId: user.id,
               paymentStatus: 'PENDING',
               cartInfo: {
                  total: weekTotal,
                  products: week.cart.products,
               },
               cartSource: 'subscription',
               customerKeycloakId: user.keycloakId,
               subscriptionOccurenceId: state.week.id,
               address: user.defaultSubscriptionAddress,
               ...(week.orderCartId && { id: week.orderCartId }),
               subscriptionOccurenceCustomers: {
                  data: [
                     {
                        isSkipped: week.isSkipped,
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: state.week.id,
                     },
                  ],
                  on_conflict: {
                     constraint: 'subscriptionOccurence_customer_pkey',
                     update_columns: ['isSkipped', 'orderCartId'],
                  },
               },
            },
            on_conflict: {
               constraint: 'orderCart_pkey',
               update_columns: ['cartInfo'],
            },
         },
      })
   }

   const skipWeek = e => {
      dispatch({
         type: 'SKIP_WEEK',
         payload: { weekId: state.week.id, checked: e.target.checked },
      })
      updateCartSkipStatus({
         variables: {
            isSkipped: e.target.checked,
            keycloakId: user.keycloakId,
            subscriptionOccurenceId: state.week.id,
         },
      })
   }

   const isCartValid = () => {
      return (
         week?.cart.products.filter(node => Object.keys(node).length !== 0)
            .length !== user?.subscription?.recipes?.count
      )
   }

   const week = state?.weeks[state.week.id]
   const addOnTotal = week?.cart.products.reduce(
      (a, b) => b.addonPrice || 0 + a,
      0
   )
   const weekTotal =
      user?.subscription?.recipes?.price +
      week?.cart.products.reduce((a, b) => b.addonPrice || 0 + a, 0) +
      zipcode.price

   return (
      <section>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Cart{' '}
               {
                  week?.cart.products.filter(
                     node => Object.keys(node).length !== 0
                  ).length
               }
               /{user?.subscription?.recipes?.count}
            </h4>
            <SkipWeek>
               <label htmlFor="skip" tw="mr-2 text-gray-600">
                  Skip
               </label>
               <input
                  name="skip"
                  type="checkbox"
                  className="toggle"
                  onChange={skipWeek}
                  checked={week?.isSkipped}
                  tw="cursor-pointer appearance-none"
               />
            </SkipWeek>
         </header>
         <CartProducts>
            {week?.cart.products.map((product, index) =>
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
                     {user?.subscription?.recipes?.price}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">Add on Total</td>
                  <td tw="text-right border px-2 py-1">{addOnTotal}</td>
               </tr>
               <tr>
                  <td tw="border px-2 py-1">Delivery</td>
                  <td tw="text-right border px-2 py-1">{zipcode.price}</td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">This weeks total</td>
                  <td tw="text-right border px-2 py-1">{weekTotal || 0}</td>
               </tr>
            </tbody>
         </table>
         <SaveButton disabled={isCartValid()} onClick={submitSelection}>
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
   const { state, dispatch } = useMenu()
   const removeRecipe = id => {
      dispatch({
         type: 'REMOVE_RECIPE',
         payload: { weekId: state.week.id, productId: id },
      })
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

const SkipWeek = styled.span(
   () => css`
      ${tw`flex items-center`}

      .toggle {
         height: 18px;
         transition: all 0.2s ease;
         ${tw`relative w-8 inline-block rounded-full border border-gray-400`}
      }
      .toggle:after {
         content: '';
         top: 1px;
         left: 1px;
         width: 14px;
         height: 14px;
         transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
         ${tw`absolute bg-green-500 rounded-full`}
      }
      .toggle:checked {
         ${tw`border-green-500 bg-green-500`}
      }
      .toggle:checked:after {
         transform: translatex(14px);
         ${tw`bg-white`}
      }
   `
)
