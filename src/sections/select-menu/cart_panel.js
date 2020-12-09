import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import { useLocation } from '@reach/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { CloseIcon } from '../../assets/icons'
import { isClient, formatCurrency } from '../../utils'
import {
   ZIPCODE,
   CREATE_CART,
   UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
   INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS,
} from '../../graphql'

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const [skipCarts] = useMutation(INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS)
   const [upsertCart] = useMutation(CREATE_CART, {
      refetchQueries: () => ['cart'],
      onCompleted: ({ createCart }) => {
         isClient && window.localStorage.setItem('cartId', createCart.id)

         const skipList = new URL(location.href).searchParams.get('previous')

         if (skipList && skipList.split(',').length > 0) {
            skipCarts({
               variables: {
                  objects: skipList.split(',').map(id => ({
                     isSkipped: true,
                     keycloakId: user.keycloakId,
                     subscriptionOccurenceId: id,
                  })),
               },
            })
         }
         addToast('Selected menu has been saved.', {
            appearance: 'success',
         })
         isCheckout && navigate('/subscription/get-started/checkout')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const [updateCartSkipStatus] = useMutation(
      UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
      {
         refetchQueries: ['cart'],
         onCompleted: () => {
            if (week.isSkipped) {
               return addToast('Skipped this week', { appearance: 'warning' })
            }
            addToast('This week is now available for menu selection', {
               appearance: 'success',
            })
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )
   const { data: { zipcode = {} } = {} } = useQuery(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })
   const submitSelection = () => {
      const evalTime = (time, hour) =>
         moment(time).hour(hour).minute(0).second(0).toISOString()
      upsertCart({
         variables: {
            object: {
               status: 'PENDING',
               amount: weekTotal,
               customerId: user.id,
               paymentStatus: 'PENDING',
               cartInfo: {
                  products: week.cart.products,
                  total: user?.subscription?.recipes?.price,
               },
               ...(user?.subscriptionPaymentMethodId && {
                  paymentMethodId: user?.subscriptionPaymentMethodId,
               }),
               cartSource: 'subscription',
               address: user.defaultAddress,
               customerKeycloakId: user.keycloakId,
               subscriptionOccurenceId: state.week.id,
               stripeCustomerId: user?.platform_customer?.stripeCustomerId,
               ...(week.orderCartId && { id: week.orderCartId }),
               customerInfo: {
                  customerEmail: user?.platform_customer?.email || '',
                  customerPhone: user?.platform_customer?.phoneNumber || '',
                  customerLastName: user?.platform_customer?.lastName || '',
                  customerFirstName: user?.platform_customer?.firstName || '',
               },
               fulfillmentInfo: {
                  type: 'PREORDER_DELIVERY',
                  slot: {
                     from: evalTime(state.week.fulfillmentDate, 8),
                     to: evalTime(state.week.fulfillmentDate, 20),
                  },
               },

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
               update_columns: [
                  'amount',
                  'address',
                  'cartInfo',
                  'fulfillmentInfo',
               ],
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
   const addOnTotal = week?.cart?.products
      .filter(node => Object.keys(node).length > 0)
      .reduce((a, b) => a + b.addonPrice || 0, 0)
   const weekTotal =
      user?.subscription?.recipes?.price + addOnTotal + zipcode.price

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
            {['PENDING', undefined].includes(week?.orderCartStatus) &&
               state?.week?.isValid &&
               !noSkip && (
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
               )}
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
                     {formatCurrency(user?.subscription?.recipes?.price)}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">Add on Total</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(addOnTotal)}
                  </td>
               </tr>
               <tr>
                  <td tw="border px-2 py-1">Delivery</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(zipcode.price)}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">This weeks total</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(weekTotal) || 0}
                  </td>
               </tr>
            </tbody>
         </table>
         {['ORDER_PLACED', 'PROCESS'].includes(week?.orderCartStatus) ? (
            <HelperBar type="success">
               <HelperBar.SubTitle>
                  Your order has been placed for this week.
               </HelperBar.SubTitle>
            </HelperBar>
         ) : (
            <SaveButton
               disabled={!state?.week?.isValid || isCartValid()}
               onClick={submitSelection}
            >
               {isCheckout ? 'Save and Proceed to Checkout' : 'Save Selection'}
            </SaveButton>
         )}
      </section>
   )
}

const SkeletonCartProduct = () => {
   return (
      <SkeletonCartProductContainer>
         <aside tw="w-32 h-16 bg-gray-300 rounded" />
         <main tw="w-full h-16 pl-3">
            <span />
            <span />
         </main>
      </SkeletonCartProductContainer>
   )
}

const CartProduct = ({ product }) => {
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const removeRecipe = id => {
      dispatch({
         type: 'REMOVE_RECIPE',
         payload: { weekId: state.week.id, productId: id },
      })
      addToast(`You've removed the recipe ${product.name}.`, {
         appearance: 'warning',
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
            {!['ORDER_PLACED', 'PROCESS'].includes(
               state?.weeks[state?.week?.id]?.orderCartStatus
            ) &&
               state?.week?.isValid && (
                  <span className="remove_product">
                     <button onClick={() => removeRecipe(product.id)}>
                        <CloseIcon
                           size={16}
                           tw="stroke-current text-green-400"
                        />
                     </button>
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
      ${tw`w-24 h-16 bg-gray-300 rounded flex items-center justify-center`}
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
