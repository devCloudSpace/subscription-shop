import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { ORDER_HISTORY, ORDER } from '../../../graphql'
import { formatDate, formatCurrency } from '../../../utils'
import { SEO, Layout, HelperBar, ProfileSidebar } from '../../../components'

const Orders = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.authenticated) {
         navigate('/subscription')
      }
   }, [keycloak])

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
   const { configOf } = useConfig()
   const [keycloak] = useKeycloak()
   const { loading, data: { orders = {} } = {} } = useSubscription(
      ORDER_HISTORY,
      {
         variables: {
            keycloakId: { _eq: keycloak?.tokenParsed?.sub },
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
   const hasColor = configOf('theme-color', 'Visual')

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
         <Title hasColor={hasColor}>Orders</Title>
         <ul tw="px-2 space-y-2">
            {orders.nodes.map(node => (
               <Date
                  hasColor={hasColor}
                  key={node.occurrenceId}
                  onClick={() => setCurrent(node.occurrenceId)}
                  className={`${node.occurrenceId === current ? 'active' : ''}`}
               >
                  {formatDate(node.occurrence.date, {
                     month: 'short',
                     day: 'numeric',
                     year: 'numeric',
                  })}
               </Date>
            ))}
         </ul>
      </aside>
   )
}

const Details = ({ current }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const [keycloak] = useKeycloak()
   const { loading, data: { order = {} } = {} } = useSubscription(ORDER, {
      variables: {
         keycloakId: keycloak?.tokenParsed?.sub,
         subscriptionOccurenceId: current,
      },
   })

   const paymentMethod = user?.platform_customer?.paymentMethods.find(
      node => node.stripePaymentMethodId === order?.cart?.paymentMethodId
   )
   const hasColor = configOf('theme-color', 'Visual')

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
            <Title hasColor={hasColor}>Order Details</Title>
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
         <table tw="my-3 w-full table-auto">
            <tbody>
               <tr>
                  <td tw="border px-2 py-1">Base Price</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(Number(order?.cart?.itemTotal) || 0)}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">Add on Total</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(Number(order?.cart?.addOnTotal) || 0)}
                  </td>
               </tr>
               <tr>
                  <td tw="border px-2 py-1">Delivery</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(Number(order?.cart?.deliveryPrice) || 0)}
                  </td>
               </tr>
               <tr tw="bg-gray-100">
                  <td tw="border px-2 py-1">Total</td>
                  <td tw="text-right border px-2 py-1">
                     {formatCurrency(order?.cart?.amount || 0)}
                  </td>
               </tr>
            </tbody>
         </table>
         <h4 tw="text-lg text-gray-700 my-4 pb-1 border-b">Address</h4>
         <div>
            <span>{order?.cart?.address?.line1 || ''}, </span>
            <span>{order?.cart?.address?.city || ''}, </span>
            <span>{order?.cart?.address?.state || ''}, </span>
            <span>{order?.cart?.address?.country || ''}, </span>
            <span>{order?.cart?.address?.zipcode || ''}</span>
         </div>
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
         <main tw="h-20 pl-3">
            <h3 tw="text-lg text-gray-800" title={product.name}>
               {product.name}
            </h3>
            {(Boolean(product.addOnPrice) || product.addOnLabel) && (
               <h4 tw="mt-2 uppercase tracking-wider text-sm font-medium text-gray-600">
                  Add On
               </h4>
            )}
            {Boolean(product.addOnPrice) && (
               <span
                  tw="mr-2 text-gray-600 truncate"
                  title={product.addOnPrice}
               >
                  Price:{' '}
                  <span tw="text-gray-800">
                     {formatCurrency(Number(product.addOnPrice) || 0)}
                  </span>
               </span>
            )}
            {product.addOnLabel && (
               <span tw="text-gray-600 truncate" title={product.addOnLabel}>
                  Label: <span tw="text-gray-800">{product.addOnLabel}</span>
               </span>
            )}
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
`

const Title = styled.h2(
   ({ hasColor }) => css`
      ${tw`px-3 pt-3 pb-1 mb-2 text-green-600 text-2xl`}
      ${hasColor?.accent && `color: ${hasColor.accent}`}
   `
)

const Wrapper = styled.div`
   display: grid;
   background: #fff;
   grid-template-columns: 280px 1fr;
   > aside {
      height: calc(100vh - 64px);
   }
`

const Date = styled.li(
   ({ hasColor }) => css`
      ${tw`cursor-pointer px-2 py-2 rounded hover:(text-white bg-green-400)`}
      &.active {
         ${tw`text-white bg-green-600 hover:(bg-green-700)`}
         ${hasColor?.highlight &&
         css`
            background: ${hasColor.highlight};
            :hover {
               background: ${hasColor.highlight};
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

const CartProductContainer = styled.li`
   ${tw`h-24 bg-white border flex items-center px-2 rounded`}
   aside {
      ${tw`w-24 h-20 border bg-gray-300 rounded flex items-center justify-center`}
   }
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
