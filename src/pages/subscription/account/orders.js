import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { ORDER_HISTORY, ORDER } from '../../../graphql'
import {
   formatDate,
   formatCurrency,
   isClient,
   normalizeAddress,
} from '../../../utils'
import { SEO, Layout, HelperBar, ProfileSidebar } from '../../../components'
import { BillingDetails } from '../../../sections/select-menu/cart_panel'

const Orders = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription')
      }
   }, [isAuthenticated])

   return (
      <Layout>
         <SEO title="Order History" />
         <Main>
            <ProfileSidebar />
            <OrderHistory />
         </Main>
      </Layout>
   )
}

export default Orders

const OrderHistory = () => {
   const [current, setCurrent] = React.useState()

   return (
      <Wrapper>
         <Listing current={current} setCurrent={setCurrent} />
         <Details current={current} />
      </Wrapper>
   )
}

const Listing = ({ current, setCurrent }) => {
   const [orderWindow, setOrderWindow] = React.useState(1)
   const { user } = useUser()
   const { configOf } = useConfig()
   const { loading, data: { orders = {} } = {} } = useSubscription(
      ORDER_HISTORY,
      {
         variables: {
            keycloakId: { _eq: user?.keycloakId },
         },
         onSubscriptionData: ({
            subscriptionData: { data: { orders = {} } = {} } = {},
         }) => {
            if (orders.aggregate.count > 0) {
               setCurrent(orders.nodes[0].occurrenceId)
            }
         },
      }
   )
   const theme = configOf('theme-color', 'Visual')

   if (loading)
      return (
         <aside tw="border-r overflow-y-auto">
            <h2 tw="px-3 pt-3 pb-1 mb-2 text-green-600 text-2xl">Orders</h2>
            <ul tw="px-2 space-y-2">
               <li tw="bg-gray-300 px-2 h-10 rounded"></li>
               <li tw="bg-gray-200 px-2 h-10 rounded"></li>
               <li tw="bg-gray-100 px-2 h-10 rounded"></li>
            </ul>
         </aside>
      )
   return (
      <aside tw="border-r overflow-y-auto">
         <Title theme={theme}>Orders</Title>
         <ul tw="px-2 space-y-2">
            {orders.nodes.map(
               (node, i) =>
                  (i + 1 <= orderWindow ||
                     (isClient && window.innerWidth > 786)) && (
                     <Date
                        theme={theme}
                        key={node.occurrenceId}
                        onClick={() => setCurrent(node.occurrenceId)}
                        className={`${
                           node.occurrenceId === current ? 'active' : ''
                        }`}
                     >
                        {formatDate(node.occurrence.date, {
                           month: 'short',
                           day: 'numeric',
                           year: 'numeric',
                        })}
                     </Date>
                  )
            )}
            {orders.nodes.length > orderWindow && (
               <div
                  tw="float-right text-sm text-blue-500 block md:hidden"
                  onClick={() => setOrderWindow(orderWindow + 4)}
               >
                  View More
               </div>
            )}
         </ul>
      </aside>
   )
}

const Details = ({ current }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { error, loading, data: { order = {} } = {} } = useSubscription(
      ORDER,
      {
         skip: !user?.keycloakId && !current && !user?.brandCustomerId,
         variables: {
            keycloakId: user?.keycloakId,
            subscriptionOccurenceId: current,
            brand_customerId: user?.brandCustomerId,
         },
      }
   )

   const paymentMethod = user?.platform_customer?.paymentMethods.find(
      node => node.stripePaymentMethodId === order?.cart?.paymentMethodId
   )
   const theme = configOf('theme-color', 'Visual')

   if (loading)
      return (
         <main tw="mx-3">
            <h2 tw="pt-3 pb-1 mb-2 text-green-600 text-2xl">Order Details</h2>
            <ProductCards>
               <SkeletonCartProduct />
               <SkeletonCartProduct />
            </ProductCards>
         </main>
      )
   if (order.isSkipped)
      return (
         <main tw="mx-3">
            <h2 tw="pt-3 pb-1 mb-2 text-green-600 text-2xl">Order Details</h2>
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  This week has been skipped!
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   return (
      <main tw="mx-3">
         <header tw="flex items-center justify-between">
            <Title theme={theme}>Order Details</Title>
            {order?.cart?.order?.status && (
               <Status status={order?.cart?.order?.status}>
                  {order?.cart?.order?.status}
               </Status>
            )}
         </header>
         <ProductCards>
            {order?.cart?.cartInfo?.products.map(product => (
               <CartProduct
                  product={product}
                  key={`product-${product.cartItemId}`}
               />
            ))}
         </ProductCards>
         <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">Charges</h4>
         <BillingDetails billing={order?.cart?.billingDetails} />
         <h4 tw="text-lg text-gray-700 mt-4 pb-1 border-b">Fulfillment</h4>
         <section tw="mt-2 mb-3">
            {order?.cart?.fulfillmentInfo?.type.includes('DELIVERY') ? (
               <p tw="text-gray-500">
                  Your box will be delivered on{' '}
                  <span>
                     {moment(order?.cart?.fulfillmentInfo?.slot?.from).format(
                        'MMM D'
                     )}
                     &nbsp;between{' '}
                     {moment(order?.cart?.fulfillmentInfo?.slot?.from).format(
                        'hh:mm A'
                     )}
                     &nbsp;-&nbsp;
                     {moment(order?.cart?.fulfillmentInfo?.slot?.to).format(
                        'hh:mm A'
                     )}
                  </span>{' '}
                  at <span>{normalizeAddress(order?.cart?.address)}</span>
               </p>
            ) : (
               <p tw="text-gray-500">
                  Pickup your box in between{' '}
                  {moment(
                     order?.cart?.billingDetails?.deliveryPrice?.value
                  ).format('MMM D')}
                  ,{' '}
                  {moment(order?.cart?.fulfillmentInfo?.slot?.from).format(
                     'hh:mm A'
                  )}{' '}
                  -{' '}
                  {moment(order?.cart?.fulfillmentInfo?.slot?.to).format(
                     'hh:mm A'
                  )}{' '}
                  from {normalizeAddress(order?.cart?.fulfillmentInfo?.address)}
               </p>
            )}
         </section>
         <h4 tw="text-lg text-gray-700 my-4 pb-1 border-b">Payment</h4>
         <section tw="mb-3 p-2 border w-full">
            <div tw="rounded flex items-center justify-between">
               <span tw="text-xl">{paymentMethod?.cardHolderName}</span>
               <div tw="flex items-center">
                  <span tw="font-medium">{paymentMethod?.expMonth}</span>
                  &nbsp;/&nbsp;
                  <span tw="font-medium">{paymentMethod?.expYear}</span>
               </div>
            </div>
            <span>
               <span tw="text-gray-500">Last 4:</span> {paymentMethod?.last4}
            </span>
         </section>
      </main>
   )
}

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
            <h3 tw="text-lg text-gray-800" title={product.name}>
               {product.name}
            </h3>
            {product.isAddOn && (
               <p tw="text-green-600">{formatCurrency(product.unitPrice)}</p>
            )}
            <section tw="space-x-2">
               {!product.isAddOn && product.addOnLabel && (
                  <span tw="text-sm px-1 rounded bg-gray-200 text-gray-600 border border-gray-200">
                     {product.addOnLabel} +{formatCurrency(product.addOnPrice)}
                  </span>
               )}
               {!product.isAddOn && product.isAutoAdded && (
                  <span tw="text-sm px-1 rounded bg-gray-200 text-gray-600 border border-gray-200">
                     Auto Selected
                  </span>
               )}
            </section>
         </main>
      </CartProductContainer>
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

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   grid-template-columns: 240px 1fr;
   @media (max-width: 768px) {
      display: block;
   }
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`px-3 pt-3 pb-1 mb-2 text-green-600 text-2xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Wrapper = styled.div`
   display: grid;
   background: #fff;
   grid-template-columns: 280px 1fr;
   > aside {
      height: calc(100vh - 64px);
   }
   @media (max-width: 768px) {
      display: block;
      > aside {
         height: max-content;
      }
   }
`

const Date = styled.li(
   ({ theme }) => css`
      ${tw`cursor-pointer px-2 py-2 rounded hover:(text-white bg-green-400)`}
      &.active {
         ${tw`text-white bg-green-600 hover:(bg-green-700)`}
         ${theme?.highlight &&
         css`
            background: ${theme.highlight};
            :hover {
               background: ${theme.highlight};
            }
         `}
      }
   `
)

const ProductCards = styled.ul`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
   }
`

const selectColor = variant => {
   switch (variant) {
      case 'PENDING':
         return '#FF5A52'
      case 'UNDER_PROCESSING':
         return '#FBB13C'
      case 'READY_TO_DISPATCH':
         return '#3C91E6'
      case 'OUT_FOR_DELIVERY':
         return '#1EA896'
      case 'DELIVERED':
         return '#53C22B'
      case 'REJECTED_OR_CANCELLED':
         return '#C6C9CA'
      default:
         return '#FF5A52'
   }
}

const Status = styled.span(
   ({ status }) => css`
      background: ${selectColor(status)};
      ${tw`px-2 py-1 rounded text-white`}
   `
)
