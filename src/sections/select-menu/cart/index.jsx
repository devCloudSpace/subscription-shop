import React from 'react'
import tw from 'twin.macro'
import { navigate } from 'gatsby'

import Billing from './billing'
import Products from './products'
import { useMenu } from '../state'
import { SaveButton } from './styled'
import OrderInfo from '../../OrderInfo'
import Fulfillment from './fulfillment'
import { useConfig } from '../../../lib'

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { state } = useMenu()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   if (
      ['ORDER_PLACED', 'PROCESS'].includes(
         state?.occurenceCustomer?.cart?.status
      )
   )
      return (
         <OrderInfo cart={state.occurenceCustomer?.cart} showViewOrderButton />
      )
   return (
      <div>
         {/* Products */}
         <Products noSkip={noSkip} isCheckout={isCheckout} />
         {/* Fulfilment Mode */}
         <Fulfillment />
         {/* Billing Details */}
         <Billing />
         {/* Checkout */}
         {isCheckout && (
            <SaveButton
               bg={theme?.accent}
               onClick={() => navigate('/subscription/get-started/checkout/')}
               disabled={
                  !state?.week?.isValid ||
                  !state?.occurenceCustomer?.validStatus?.itemCountValid
               }
            >
               Proceed to Checkout
            </SaveButton>
         )}
      </div>
   )
}
