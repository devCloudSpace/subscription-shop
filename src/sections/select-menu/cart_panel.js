import React from 'react'
import moment from 'moment'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { CloseIcon, MinusIcon, PlusIcon } from '../../assets/icons'
import { isClient, formatCurrency, normalizeAddress } from '../../utils'
import { UPSERT_OCCURENCE_CUSTOMER_CART_SKIP } from '../../graphql'

export const CartPanel = ({ noSkip }) => {
   const { user } = useUser()
   const { state } = useMenu()
   const [open, toggle] = React.useState(false)
   const [showSummaryBar, setShowSummaryBar] = React.useState(true)
   return (
      <div>
         {isClient && window.innerWidth < 768 && (
            <SummaryBar>
               <div>
                  <h4 tw="text-base text-gray-700">
                     Cart{' '}
                     {state?.occurenceCustomer?.validStatus?.addedProductsCount}
                     /{user?.subscription?.recipes?.count}
                  </h4>
                  <h4
                     tw="text-blue-700 pt-2"
                     onClick={() => setShowSummaryBar(false)}
                  >
                     View full summary <span>&#8657;</span>
                  </h4>
               </div>
            </SummaryBar>
         )}
         <Overlay
            showOverlay={!showSummaryBar}
            onClick={() => setShowSummaryBar(true)}
         />
         <CartWrapper showSummaryBar={showSummaryBar}>
            <Products noSkip={noSkip} setShowSummaryBar={setShowSummaryBar} />
            <header tw="mb-3 h-10 flex items-center justify-between">
               <h4 tw="text-lg text-gray-700">
                  Your Weekly Total:{' '}
                  {state?.occurenceCustomer?.validStatus?.itemCountValid
                     ? formatCurrency(
                          state?.occurenceCustomer?.cart?.billingDetails
                             ?.totalPrice?.value
                       )
                     : 'N/A'}
               </h4>
               <button
                  onClick={() => toggle(!open)}
                  tw="border w-8 h-6 rounded-full flex items-center justify-center border-green-500"
               >
                  {open ? (
                     <MinusIcon tw="stroke-current text-green-700" size={18} />
                  ) : (
                     <PlusIcon tw="stroke-current text-green-700" size={18} />
                  )}
               </button>
            </header>
            {state?.occurenceCustomer?.validStatus?.itemCountValid && open && (
               <BillingDetails />
            )}
            {['ORDER_PLACED', 'PROCESS'].includes(
               state?.occurenceCustomer?.cart?.status
            ) && (
               <HelperBar type="success">
                  <HelperBar.SubTitle>
                     Your order has been placed for this week.
                  </HelperBar.SubTitle>
               </HelperBar>
            )}
            <div tw="mt-4 text-gray-500">
               * Your box will be delivered on{' '}
               <span>
                  {moment(state?.week?.fulfillmentDate).format('MMM D')}
                  &nbsp;between{' '}
                  {moment(
                     state?.occurenceCustomer?.cart?.fulfillmentInfo?.slot?.from
                  ).format('hh:mm A')}
                  &nbsp;-&nbsp;
                  {moment(
                     state?.occurenceCustomer?.cart?.fulfillmentInfo?.slot?.to
                  ).format('hh:mm A')}
               </span>{' '}
               at{' '}
               <span>
                  {normalizeAddress(state?.occurenceCustomer?.cart?.address)}
               </span>
            </div>
         </CartWrapper>
      </div>
   )
}

const Products = ({ noSkip, setShowSummaryBar }) => {
   const { user } = useUser()
   const { state } = useMenu()
   const { addToast } = useToasts()
   const [updateCartSkipStatus] = useMutation(
      UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
      {
         onCompleted: ({ upsertOccurenceCustomerCart = {} }) => {
            if (upsertOccurenceCustomerCart.isSkipped) {
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

   const skipWeek = () => {
      updateCartSkipStatus({
         variables: {
            object: {
               keycloakId: user.keycloakId,
               brand_customerId: user.brandCustomerId,
               subscriptionOccurenceId: state.week.id,
               isSkipped: Boolean(!state.occurenceCustomer?.isSkipped),
            },
         },
      })
   }

   const isSkippable =
      ['PENDING', undefined].includes(state?.occurenceCustomer?.cart?.status) &&
      state?.week?.isValid &&
      !noSkip

   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Cart {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>
            {isSkippable && (
               <SkipWeek>
                  <label htmlFor="skip" tw="mr-2 text-gray-600">
                     Skip
                  </label>
                  <input
                     name="skip"
                     type="checkbox"
                     className="toggle"
                     onChange={skipWeek}
                     checked={state?.occurenceCustomer?.isSkipped}
                     tw="cursor-pointer appearance-none"
                  />
               </SkipWeek>
            )}
            <button
               tw="md:hidden rounded-full border-2 border-green-400 h-6 w-6 "
               onClick={() => setShowSummaryBar(true)}
            >
               <CloseIcon size={16} tw="stroke-current text-green-400" />
            </button>
         </header>
         <CartProducts>
            {state?.occurenceCustomer?.cart?.cartInfo?.products?.map(
               (product, index) =>
                  !product.isAddOn && (
                     <CartProduct
                        index={index}
                        product={product}
                        key={product.cartItemId}
                     />
                  )
            )}
            {Array.from(
               {
                  length:
                     state?.occurenceCustomer?.validStatus
                        ?.pendingProductsCount,
               },
               (_, index) => (
                  <SkeletonCartProduct key={index} />
               )
            )}
         </CartProducts>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">Add Ons</h4>
            <button tw="text-green-800 uppercase px-3 py-1 rounded-full border text-sm font-medium border-green-400 flex items-center ">
               Explore
               <span tw="pl-2">
                  <PlusIcon size={16} tw="stroke-current text-green-400" />
               </span>
            </button>
         </header>
         <CartProducts>
            {state?.occurenceCustomer?.cart?.cartInfo?.products?.map(
               (product, index) =>
                  product.isAddOn && (
                     <CartProduct
                        index={index}
                        product={product}
                        key={product.cartItemId}
                     />
                  )
            )}
         </CartProducts>
      </>
   )
}

const BillingDetails = () => {
   const {
      state: {
         occurenceCustomer: {
            cart: { billingDetails: billing = {} } = {},
         } = {},
      } = {},
   } = useMenu()

   return (
      <Table tw="my-3 w-full table-auto">
         <tbody>
            <tr>
               <td
                  tw="border px-2 py-1"
                  title={billing?.itemTotal?.description}
               >
                  {billing?.itemTotal?.label}
                  <p tw="text-sm text-gray-600">
                     {billing?.itemTotal?.comment.replace(
                        /\{\{([^}]+)\}\}/g,
                        () => {
                           return formatCurrency(
                              billing?.itemTotal?.comment
                                 .match(/\{\{([^}]+)\}\}/g)[0]
                                 .slice(2, -2)
                           )
                        }
                     )}
                  </p>
               </td>
               <td tw="text-right border px-2 py-1">
                  {formatCurrency(billing?.itemTotal?.value)}
               </td>
            </tr>
            <tr>
               <td
                  tw="border px-2 py-1"
                  title={billing?.deliveryPrice?.description}
               >
                  {billing?.deliveryPrice?.label}
                  <p tw="text-sm text-gray-600">
                     {billing?.deliveryPrice?.comment.replace(
                        /\{\{([^}]+)\}\}/g,
                        () => {
                           return formatCurrency(
                              billing?.deliveryPrice?.comment
                                 .match(/\{\{([^}]+)\}\}/g)[0]
                                 .slice(2, -2)
                           )
                        }
                     )}
                  </p>
               </td>
               <td tw="text-right border px-2 py-1">
                  {formatCurrency(billing?.deliveryPrice?.value)}
               </td>
            </tr>
            {!billing?.isTaxIncluded && (
               <tr>
                  <td
                     tw="border px-2 py-1"
                     title={billing?.subTotal?.description}
                  >
                     {billing?.subTotal?.label}
                     <p tw="text-sm text-gray-600">
                        {billing?.subTotal?.comment.replace(
                           /\{\{([^}]+)\}\}/g,
                           () => {
                              return formatCurrency(
                                 billing?.subTotal?.comment
                                    .match(/\{\{([^}]+)\}\}/g)[0]
                                    .slice(2, -2)
                              )
                           }
                        )}
                     </p>
                  </td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(billing?.subTotal?.value)}
                  </td>
               </tr>
            )}
            {!billing?.isTaxIncluded && (
               <tr>
                  <td tw="border px-2 py-1" title={billing?.tax?.description}>
                     {billing?.tax?.label}
                     <p tw="text-sm text-gray-600">
                        {billing?.tax?.comment.replace(
                           /\{\{([^}]+)\}\}/g,
                           () => {
                              return formatCurrency(
                                 billing?.tax?.comment
                                    .match(/\{\{([^}]+)\}\}/g)[0]
                                    .slice(2, -2)
                              )
                           }
                        )}
                     </p>
                  </td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(billing?.tax?.value)}
                  </td>
               </tr>
            )}
            <tr>
               <td
                  tw="border px-2 py-1"
                  title={billing?.totalPrice?.description}
               >
                  {billing?.totalPrice?.label}
                  <p tw="text-sm text-gray-600">
                     {billing?.totalPrice?.comment.replace(
                        /\{\{([^}]+)\}\}/g,
                        () => {
                           return formatCurrency(
                              billing?.totalPrice?.comment
                                 .match(/\{\{([^}]+)\}\}/g)[0]
                                 .slice(2, -2)
                           )
                        }
                     )}
                  </p>
               </td>
               <td tw="text-right border px-2 py-1">
                  {formatCurrency(billing?.totalPrice?.value)}
               </td>
            </tr>
         </tbody>
      </Table>
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

const CartProduct = ({ product, index }) => {
   const { state, methods } = useMenu()
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
               state?.occurenceCustomer?.cart?.status
            ) &&
               state?.week?.isValid && (
                  <span className="remove_product">
                     <button
                        onClick={() => methods.products.delete(product, index)}
                     >
                        <CloseIcon
                           size={16}
                           tw="stroke-current text-green-400"
                        />
                     </button>
                  </span>
               )}
         </aside>
         <main tw="h-16 pl-3">
            <p tw="text-gray-800" title={product.name}>
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

const SummaryBar = styled.div`
   ${tw`md:hidden fixed left-0 right-0 bottom-0 z-10 bg-white flex p-3 border-2 justify-between items-center`}
`
const CartWrapper = styled.section(
   ({ showSummaryBar }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 30%;
         bottom: 0px;
         background-color: #ffff;
         padding: 1rem;
         z-index: 1020;
         overflow: scroll;
         ${showSummaryBar
            ? `display: none`
            : `display: block;
            top: 100%;
            animation: slide 0.5s forwards;
            @keyframes slide{
               100% { top: 30%; }
            }
         `}
      }
   `
)

const Overlay = styled.div(
   ({ showOverlay }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 0px;
         bottom: 0px;
         background-color: rgba(0, 0, 0, 0.6);
         z-index: 1010;
         ${showOverlay ? `display: block` : `display: none`}
      }
   `
)

const Table = styled.table`
   tr:nth-child(even) {
      ${tw`bg-gray-100`}
   }
`
