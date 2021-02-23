import React from 'react'
import tw from 'twin.macro'
import { navigate } from 'gatsby'

import Billing from './billing'
import Products from './products'
import { useMenu } from '../state'
import { SaveButton } from './styled'
import Fulfillment from './fulfillment'
import { useConfig } from '../../../lib'
import { HelperBar } from '../../../components'

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
         <div tw="pt-3">
            <HelperBar type="success">
               <HelperBar.SubTitle>
                  Order for this week has been placed.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() => navigate('/subscription/account/orders')}
               >
                  Go to Order
               </HelperBar.Button>
            </HelperBar>
         </div>
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
