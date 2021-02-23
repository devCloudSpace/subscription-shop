import React from 'react'
import moment from 'moment'
import { Link, navigate } from 'gatsby'
import { uniqBy } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { Tunnel, Button, Loader } from '../../components'
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from '../../assets/icons'
import { isClient, formatCurrency, normalizeAddress } from '../../utils'
import {
   ZIPCODE,
   UPSERT_CART,
   UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
   OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES,
} from '../../graphql'

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig()
   const [updateCart] = useMutation(UPSERT_CART)
   const [open, toggle] = React.useState(false)
   const [showSummaryBar, setShowSummaryBar] = React.useState(true)
   const { loading, data: { zipcode = {} } = {} } = useSubscription(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })

   const setFulfillment = mode => {
      const subscriptionOccurenceCustomers = {
         data: [
            {
               isSkipped: false,
               keycloakId: user.keycloakId,
               subscriptionOccurenceId: state.week.id,
               brand_customerId: user.brandCustomerId,
            },
         ],
         on_conflict: {
            constraint: 'subscriptionOccurence_customer_pkey',
            update_columns: ['isSkipped', 'orderCartId'],
         },
      }
      if (mode === 'DELIVERY') {
         updateCart({
            variables: {
               object: {
                  address: user.defaultAddress,
                  subscriptionOccurenceCustomers,
                  id: state.occurenceCustomer?.cart?.id,
                  fulfillmentInfo: {
                     type: 'PREORDER_DELIVERY',
                     slot: {
                        from: evalTime(
                           state.week.fulfillmentDate,
                           zipcode?.deliveryTime?.from
                        ),
                        to: evalTime(
                           state.week.fulfillmentDate,
                           zipcode?.deliveryTime?.to
                        ),
                     },
                  },
               },
               on_conflict: {
                  constraint: 'orderCart_pkey',
                  update_columns: ['cartInfo', 'address', 'fulfillmentInfo'],
               },
            },
         })
         return
      }
      updateCart({
         variables: {
            object: {
               address: user.defaultAddress,
               subscriptionOccurenceCustomers,
               id: state.occurenceCustomer?.cart?.id,
               fulfillmentInfo: {
                  type: 'PREORDER_PICKUP',
                  slot: {
                     from: evalTime(
                        state.week.fulfillmentDate,
                        zipcode?.pickupOption?.time?.from
                     ),
                     to: evalTime(
                        state.week.fulfillmentDate,
                        zipcode?.pickupOption?.time?.to
                     ),
                  },
                  address: zipcode?.pickupOption?.address,
               },
            },
            on_conflict: {
               constraint: 'orderCart_pkey',
               update_columns: ['cartInfo', 'address', 'fulfillmentInfo'],
            },
         },
      })
   }

   const theme = configOf('theme-color', 'Visual')

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
            <section tw="mt-3">
               <h4 tw="text-lg text-gray-700 border-b mb-2">
                  Fulfillment Mode
               </h4>
               {loading ? (
                  <Loader inline />
               ) : (
                  <section tw="space-y-2">
                     {zipcode.isDeliveryActive && (
                        <FulfillmentOption
                           onClick={() => setFulfillment('DELIVERY')}
                           isActive={
                              state.occurenceCustomer?.validStatus?.hasCart
                                 ? state.occurenceCustomer?.cart?.fulfillmentInfo?.type.includes(
                                      'DELIVERY'
                                   )
                                 : state.fulfillment.type.includes('DELIVERY')
                           }
                        >
                           <aside>
                              <CheckIcon
                                 size={18}
                                 tw="stroke-2 stroke-current text-gray-400"
                              />
                           </aside>
                           <main>
                              {zipcode.deliveryPrice === 0 ? (
                                 <h3>Free Delivery</h3>
                              ) : (
                                 <h3>
                                    Delivery at{' '}
                                    {formatCurrency(zipcode.deliveryPrice)}
                                 </h3>
                              )}
                              <p tw="text-gray-500 text-sm">
                                 Your box will be delivered on{' '}
                                 <span>
                                    {moment(
                                       state?.week?.fulfillmentDate
                                    ).format('MMM D')}
                                    &nbsp;between {zipcode?.deliveryTime?.from}
                                    &nbsp;-&nbsp;
                                    {zipcode?.deliveryTime?.to}
                                 </span>{' '}
                                 at{' '}
                                 <span>
                                    {normalizeAddress(
                                       state?.occurenceCustomer?.cart?.address
                                    )}
                                 </span>
                              </p>
                           </main>
                        </FulfillmentOption>
                     )}
                     {zipcode.isPickupActive && zipcode?.pickupOptionId && (
                        <FulfillmentOption
                           onClick={() => setFulfillment('PICKUP')}
                           isActive={
                              state.occurenceCustomer?.validStatus?.hasCart
                                 ? state.occurenceCustomer?.cart?.fulfillmentInfo?.type.includes(
                                      'PICKUP'
                                   )
                                 : state.fulfillment.type.includes('PICKUP')
                           }
                        >
                           <aside>
                              <CheckIcon
                                 size={18}
                                 tw="stroke-2 stroke-current text-gray-400"
                              />
                           </aside>
                           <main>
                              <h3>Pick Up</h3>
                              <p tw="text-gray-500 text-sm">
                                 Pickup your box in between{' '}
                                 {moment(state?.week?.fulfillmentDate).format(
                                    'MMM D'
                                 )}
                                 , {zipcode?.pickupOption?.time?.from} -{' '}
                                 {zipcode?.pickupOption?.time?.to} from{' '}
                                 {normalizeAddress(
                                    zipcode?.pickupOption?.address
                                 )}
                              </p>
                           </main>
                        </FulfillmentOption>
                     )}
                  </section>
               )}
            </section>
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
               {state?.occurenceCustomer?.validStatus?.itemCountValid && (
                  <button
                     onClick={() => toggle(!open)}
                     tw="focus:outline-none border w-8 h-6 rounded-full flex items-center justify-center border-green-500"
                  >
                     {open ? (
                        <MinusIcon
                           tw="stroke-current text-green-700"
                           size={18}
                        />
                     ) : (
                        <PlusIcon
                           tw="stroke-current text-green-700"
                           size={18}
                        />
                     )}
                  </button>
               )}
            </header>
            {state?.occurenceCustomer?.validStatus?.itemCountValid && open && (
               <BillingDetails
                  billing={state.occurenceCustomer?.cart?.billingDetails}
               />
            )}
         </CartWrapper>
         {isCheckout && (
            <SaveButton
               bg={theme?.accent}
               onClick={() => navigate('/subscription/get-started/checkout/')}
               disabled={
                  !state?.week?.isValid ||
                  !state.occurenceCustomer?.validStatus?.itemCountValid
               }
            >
               Proceed to Checkout
            </SaveButton>
         )}
      </div>
   )
}

const Products = ({ noSkip, setShowSummaryBar }) => {
   const { user } = useUser()
   const { state } = useMenu()
   const { addToast } = useToasts()
   const [tunnel, toggleTunnel] = React.useState(false)
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
               Your Box{' '}
               {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
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
               product =>
                  !product.isAddOn && (
                     <CartProduct product={product} key={product.cartItemId} />
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
            <h4 tw="text-lg text-gray-700">Your Add Ons</h4>
            <button
               onClick={() => toggleTunnel(true)}
               tw="text-green-800 uppercase px-3 py-1 rounded-full border text-sm font-medium border-green-400 flex items-center"
            >
               Explore
               <span tw="pl-2">
                  <PlusIcon size={16} tw="stroke-current text-green-400" />
               </span>
            </button>
         </header>
         <CartProducts>
            {state?.occurenceCustomer?.cart?.cartInfo?.products?.map(
               product =>
                  product.isAddOn && (
                     <CartProduct product={product} key={product.cartItemId} />
                  )
            )}
         </CartProducts>
         {tunnel && (
            <Tunnel
               size="md"
               isOpen={tunnel}
               toggleTunnel={() => toggleTunnel(false)}
            >
               <Tunnel.Header title="Add Ons">
                  <Button size="sm" onClick={() => toggleTunnel(false)}>
                     <CloseIcon size={20} tw="stroke-current" />
                  </Button>
               </Tunnel.Header>
               <Tunnel.Body>
                  <AddOns />
               </Tunnel.Body>
            </Tunnel>
         )}
      </>
   )
}

const AddOns = () => {
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig()

   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: { _eq: state?.week?.id },
            subscriptionId: { _eq: user?.subscriptionId },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const isAdded = id => {
      const products = state.occurenceCustomer?.cart?.cartInfo?.products || []

      const index = products?.findIndex(
         node => node.subscriptionOccurenceProductId === id
      )
      return index === -1 ? false : true
   }

   const theme = configOf('theme-color', 'Visual')
   if (loading) return <Loader inline />
   if (categories.length === 0) return <div>No Add Ons Available</div>
   return (
      <div>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                     ).length
                  }
                  )
               </h4>
               <AddOnProducts>
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                  ).map((node, index) => (
                     <AddOnProduct
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                     />
                  ))}
               </AddOnProducts>
            </section>
         ))}
      </div>
   )
}

export const BillingDetails = ({ billing }) => {
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

const CartProduct = ({ product }) => {
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
                     <button onClick={() => methods.products.delete(product)}>
                        <CloseIcon
                           size={16}
                           tw="stroke-current text-green-400"
                        />
                     </button>
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

const AddOnProduct = ({ node, isAdded, theme }) => {
   const { state, methods } = useMenu()
   const type = node?.simpleRecipeProductOption?.id ? 'SRP' : 'IP'
   const option =
      type === 'SRP'
         ? node.simpleRecipeProductOption
         : node.inventoryProductOption

   const canAdd = () => {
      const conditions = [!node.isSingleSelect, state?.week?.isValid]
      return (
         conditions.every(node => node) ||
         ['PENDING', undefined].includes(state.occurenceCustomer?.cart?.status)
      )
   }
   return (
      <Styles.Product
         theme={theme}
         className={`${isAdded(node?.id) ? 'active' : ''}`}
      >
         <div
            css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
         >
            {node?.cartItem?.image ? (
               <img
                  alt={node?.cartItem?.name}
                  title={node?.cartItem?.name}
                  src={node?.cartItem?.image}
                  css={tw`h-full w-full object-cover select-none`}
               />
            ) : (
               <span>No Photos</span>
            )}
         </div>
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  tw="flex-shrink-0"
                  className={`${isAdded(node?.id) ? 'active' : ''}`}
               />
               <Link
                  tw="text-gray-700"
                  to={`/subscription/${
                     type === 'SRP' ? 'recipes' : 'inventory'
                  }?id=${node?.cartItem?.id}${
                     type === 'SRP'
                        ? `&serving=${option?.simpleRecipeYieldId}`
                        : `&option=${option?.id}`
                  }`}
               >
                  {node?.cartItem?.name}
               </Link>
            </section>
            {canAdd() && (
               <button
                  onClick={() => methods.products.add(node.cartItem)}
                  tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
               >
                  {isAdded(node?.id) ? 'Add Again' : 'Add'}
               </button>
            )}
         </div>
         <p>
            {type === 'SRP'
               ? option?.simpleRecipeProduct?.additionalText
               : option?.inventoryProduct?.additionalText}
         </p>
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li(
      ({ theme }) => css`
         ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
         &.active {
            ${tw`border border-2 border-red-400`}
            border-color: ${theme?.highlight ? theme.highlight : '#38a169'}
         }
      `
   ),
}

const Check = styled(CheckIcon)(
   () => css`
      ${tw`mr-2 stroke-current text-gray-300`}
      &.active {
         ${tw`text-green-700`}
      }
   `
)

const AddOnProducts = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

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

const FulfillmentOption = styled.section`
   ${tw`py-2 pr-2 rounded cursor-pointer flex items-center border text-gray-700`}
   aside {
      ${tw`flex-shrink-0 h-10 w-10 flex items-center justify-center`}
      ${({ isActive }) =>
         isActive &&
         css`
            svg {
               ${tw`text-green-700`}
            }
         `}
   }
   ${({ isActive }) =>
      isActive &&
      css`
         ${tw`border-2 border-green-600`}
      `}
`

const SaveButton = styled.button(
   ({ disabled, bg }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-white
      text-center
      bg-green-500
   `}
      ${bg && `background-color: ${bg};`}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-gray-600
         text-center
         bg-gray-200
         cursor-not-allowed 
      `}
   `
)
