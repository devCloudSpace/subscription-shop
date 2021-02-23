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
            {isRemovable && (
               <span className="remove_product">
                  <button onClick={() => onDelete(product)}>
                     <CloseIcon size={16} tw="stroke-current text-green-400" />
                  </button>
               </span>
            )}
         </aside>
         <main tw="pl-3">
            <p tw="text-gray-800" title={product.name}>
               {product.name}
            </p>
            {product.isAddOn && (
               <p tw="text-green-600">{formatCurrency(product.unitPrice)}</p>
            )}
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
      </Wrapper>
   )
}

const Wrapper = styled.li`
   ${tw`h-auto py-2 bg-white border flex items-start px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-gray-300 rounded flex items-start justify-center`}
      span.remove_product {
         display: none;
         background: rgba(0, 0, 0, 0.3);
         ${tw`absolute h-full w-full items-center justify-center`}
         button {
            ${tw`bg-white h-6 w-6 rounded-full flex items-center justify-center`}
         }
      }
      :hover {
         span.remove_product {
            display: flex;
         }
      }
   }
`
