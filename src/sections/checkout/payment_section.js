import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'

import { usePayment } from './state'
import { useUser } from '../../context'
import { Loader } from '../../components'
import { PaymentTunnel } from './payment_tunnel'
import { PAYMENT_METHODS } from '../../graphql'

export const PaymentSection = ({ setPaymentMethodId }) => {
   const { user } = useUser()
   const { state, dispatch } = usePayment()
   const { loading, data: { paymentMethods = [] } = {} } = useQuery(
      PAYMENT_METHODS,
      {
         variables: {
            keycloakId: user.keycloakId,
         },
      }
   )

   const toggleTunnel = value => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            isVisible: value,
         },
      })
   }

   if (loading) return <Loader inline />
   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">Select Payment Method</h4>
            {paymentMethods.length > 0 && (
               <OutlineButton onClick={() => toggleTunnel(true)}>
                  Add Card
               </OutlineButton>
            )}
         </header>
         {paymentMethods.length === 0 && (
            <NoPaymentInfo>
               <span>Let's start with adding a payment method.</span>
               <button onClick={() => toggleTunnel(true)}>
                  Add Payment Method
               </button>
            </NoPaymentInfo>
         )}
         <PaymentMethods
            onChange={e => setPaymentMethodId(e.target.getAttribute('data-id'))}
         >
            {paymentMethods.map((method, index) => (
               <PaymentMethod key={method.stripePaymentMethodId}>
                  <aside htmlFor="method">
                     <input
                        type="radio"
                        name="method"
                        id={`method-${index}`}
                        css={tw`w-full cursor-pointer`}
                        data-id={method.stripePaymentMethodId}
                     />
                  </aside>
                  <section tw="p-2 w-full">
                     {user.defaultSubscriptionPaymentMethodId ===
                        method.stripePaymentMethodId && (
                        <span tw="rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                           Default
                        </span>
                     )}
                     <div tw="flex items-center justify-between">
                        <span tw="text-xl my-2">{method.cardHolderName}</span>
                        <div tw="flex items-center">
                           <span tw="font-medium">{method.expMonth}</span>
                           &nbsp;/&nbsp;
                           <span tw="font-medium">{method.expYear}</span>
                        </div>
                     </div>
                     <span>
                        <span tw="text-gray-500">Last 4:</span> {method.last4}
                     </span>
                  </section>
               </PaymentMethod>
            ))}
         </PaymentMethods>
         {state.tunnel.isVisible && <PaymentTunnel />}
      </>
   )
}

const PaymentMethods = styled.ul`
   ${tw`
   grid 
   gap-2
   sm:grid-cols-1
   md:grid-cols-2
`}
   grid-auto-rows: minmax(120px, auto);
`

const PaymentMethod = styled.li`
   ${tw`flex border text-gray-700`}
   > aside {
      width: 48px;
      ${tw`border-r border-gray-300 flex justify-center h-full bg-gray-200 border-r`}
   }
`

const Button = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)

const OutlineButton = styled(Button)`
   ${tw`bg-transparent hover:bg-green-600 text-green-600 border border-green-600 hover:text-white`}
`

const NoPaymentInfo = styled.div`
   height: 48px;
   ${tw`w-full flex justify-between items-center px-3 rounded bg-indigo-200 text-indigo-800 mb-3`}
   button {
      ${tw`border border-indigo-800 py-1 px-2 rounded text-sm hover:bg-indigo-300`}
   }
`
