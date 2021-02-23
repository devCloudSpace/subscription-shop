import React from 'react'
import tw, { styled } from 'twin.macro'

import { useMenu } from '../../state'
import { formatCurrency } from '../../../../utils'
import { PlusIcon, MinusIcon } from '../../../../assets/icons'

const Billing = () => {
   const { state } = useMenu()
   const [open, toggle] = React.useState(false)
   const { billingDetails: billing = {} } = state?.occurenceCustomer?.cart || {}
   const { itemCountValid = false } =
      state?.occurenceCustomer?.validStatus || {}
   return (
      <div>
         <header tw="mb-3 h-10 flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Your Weekly Total:{' '}
               {itemCountValid
                  ? formatCurrency(billing?.totalPrice?.value)
                  : 'N/A'}
            </h4>
            {itemCountValid && <Toggle open={open} toggle={toggle} />}
         </header>
         {itemCountValid && open && <Table billing={billing} />}
      </div>
   )
}

export default Billing

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

const parseText = text =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return formatCurrency(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

const Table = ({ billing }) => {
   return (
      <Styles.Table>
         <tbody>
            <tr>
               <Styles.Cell title={billing?.itemTotal?.description}>
                  {billing?.itemTotal?.label}
                  <Styles.Comment>
                     {parseText(billing?.itemTotal?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.itemTotal?.value)}
               </Styles.Cell>
            </tr>
            <tr>
               <Styles.Cell title={billing?.deliveryPrice?.description}>
                  {billing?.deliveryPrice?.label}
                  <Styles.Comment>
                     {parseText(billing?.deliveryPrice?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.deliveryPrice?.value)}
               </Styles.Cell>
            </tr>
            {!billing?.isTaxIncluded && (
               <tr>
                  <Styles.Cell title={billing?.subTotal?.description}>
                     {billing?.subTotal?.label}
                     <Styles.Comment>
                        {parseText(billing?.subTotal?.comment)}
                     </Styles.Comment>
                  </Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.subTotal?.value)}
                  </Styles.Cell>
               </tr>
            )}
            {!billing?.isTaxIncluded && (
               <tr>
                  <Styles.Cell title={billing?.tax?.description}>
                     {billing?.tax?.label}
                     <Styles.Comment>
                        {parseText(billing?.tax?.comment)}
                     </Styles.Comment>
                  </Styles.Cell>
                  <Styles.Cell>
                     {formatCurrency(billing?.tax?.value)}
                  </Styles.Cell>
               </tr>
            )}
            <tr>
               <Styles.Cell title={billing?.totalPrice?.description}>
                  {billing?.totalPrice?.label}
                  <Styles.Comment>
                     {parseText(billing?.totalPrice?.comment)}
                  </Styles.Comment>
               </Styles.Cell>
               <Styles.Cell>
                  {formatCurrency(billing?.totalPrice?.value)}
               </Styles.Cell>
            </tr>
         </tbody>
      </Styles.Table>
   )
}

const Styles = {
   Table: styled.table`
      ${tw`my-2 w-full table-auto`}
      tr:nth-child(even) {
         ${tw`bg-gray-100`}
      }
      tr {
         td:last-child {
            text-align: right;
         }
      }
   `,
   Cell: styled.td`
      ${tw`border px-2 py-1`}
   `,
   Comment: styled.p`
      ${tw`text-sm text-gray-600`}
   `,
}
