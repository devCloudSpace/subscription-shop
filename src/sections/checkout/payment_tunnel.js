import React from 'react'
import tw from 'twin.macro'

import { usePayment } from './state'
import { Tunnel } from '../../components'
import { PaymentForm } from './payment_form'
import { CloseIcon } from '../../assets/icons'

export const PaymentTunnel = () => {
   const { state, dispatch } = usePayment()

   const toggleTunnel = (value = false) => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            isVisible: value,
         },
      })
   }
   return (
      <Tunnel
         size="sm"
         toggleTunnel={toggleTunnel}
         isOpen={state.tunnel.isVisible}
      >
         <Tunnel.Header title="Add Payment Method">
            <button
               onClick={() => toggleTunnel(false)}
               tw="border w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
               <CloseIcon size={20} tw="stroke-current text-green-800" />
            </button>
         </Tunnel.Header>
         <Tunnel.Body>
            <PaymentForm />
         </Tunnel.Body>
      </Tunnel>
   )
}
