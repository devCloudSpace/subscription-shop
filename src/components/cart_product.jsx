import React from 'react'
import tw, { styled } from 'twin.macro'

import { formatCurrency } from '../utils'
import { CloseIcon } from '../assets/icons'

export const CartProduct = ({ product, isRemovable, onDelete }) => {
   return (
      <Wrapper>
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
            <p tw="text-gray-800" title={product.name}>
               {product.name}
            </p>
            <p tw="text-green-600">
               {product.isAddOn && formatCurrency(product.unitPrice)} x
               {product?.quantity || 1}
            </p>
            {!product.isAddOn && product.isAutoAdded && (
               <span tw="text-sm px-1 rounded bg-gray-200 text-gray-600 border border-gray-200">
                  Auto Selected
               </span>
            )}
            {Boolean(product.addOnPrice) && (
               <span tw="text-sm px-1 rounded bg-gray-200 text-gray-600 border border-gray-200">
                  {product.addOnLabel}&nbsp;
                  {formatCurrency(product.addOnPrice)}
               </span>
            )}
         </main>
         {isRemovable && (
            <section>
               <button onClick={() => onDelete(product)} title="Remove Product">
                  <CloseIcon size={16} tw="stroke-current text-gray-700" />
               </button>
            </section>
         )}
      </Wrapper>
   )
}

const Wrapper = styled.li`
   ${tw`h-auto py-2 bg-white border grid items-start px-2 rounded`}
   grid-template-columns: 96px 1fr auto;
   aside {
      ${tw`w-full h-16 bg-gray-300 rounded flex items-start justify-center`}

      :hover {
         span.remove_product {
            display: flex;
         }
      }
   }
   section {
      ${tw`h-full flex items-center justify-center`}
      > button {
         ${tw`cursor-pointer bg-gray-100 h-6 w-6 rounded-full flex items-center justify-center`}
      }
   }
`
