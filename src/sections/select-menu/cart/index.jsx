import React from 'react'
import tw from 'twin.macro'
import { navigate } from 'gatsby'

import Products from './products'
import { useMenu } from '../state'
import { HelperBar } from '../../../components'
import { Fulfillment } from './fulfillment'

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { state } = useMenu()

   if (
      ['ORDER_PLACED', 'PROCESS'].includes(
         state.occurenceCustomer?.cart?.status
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
      </div>
   )
}
