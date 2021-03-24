import React from 'react'
import tw from 'twin.macro'

import { useMenu } from '../../state'
import { formatCurrency } from '../../../../utils'
import { Billing, LoyaltyPoints, WalletAmount } from '../../../../components'
import { PlusIcon, MinusIcon } from '../../../../assets/icons'

const BillingDetails = () => {
   const { state } = useMenu()
   const [open, toggle] = React.useState(false)
   const { billingDetails: billing = {} } = state?.occurenceCustomer?.cart || {}
   const { itemCountValid = false } =
      state?.occurenceCustomer?.validStatus || {}

   return (
      <div>
         <header tw="mt-3 mb-3 h-10 flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Your Weekly Total:{' '}
               {itemCountValid
                  ? formatCurrency(billing?.totalPrice?.value)
                  : 'N/A'}
            </h4>
            {itemCountValid && <Toggle open={open} toggle={toggle} />}
         </header>
         {itemCountValid && open && <Billing billing={billing} />}
         {/* {itemCountValid && ( */}
         <WalletAmount cart={state?.occurenceCustomer?.cart} />
         <LoyaltyPoints cart={state?.occurenceCustomer?.cart} />
         {/* )} */}
      </div>
   )
}

export default BillingDetails

const Toggle = ({ open, toggle }) => {
   return (
      <button
         onClick={() => toggle(!open)}
         tw="focus:outline-none border w-8 h-6 rounded-full flex items-center justify-center border-green-500"
      >
         {open ? (
            <MinusIcon tw="stroke-current text-green-700" size={18} />
         ) : (
            <PlusIcon tw="stroke-current text-green-700" size={18} />
         )}
      </button>
   )
}
