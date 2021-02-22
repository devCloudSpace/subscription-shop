import React from 'react'
import { Link } from 'gatsby'
import { isEmpty, uniqBy } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { formatCurrency } from '../../utils'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'

export const Menu = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state } = useMenu()
   const { configOf } = useConfig()
   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: { _eq: state?.week?.id },
            subscriptionId: { _eq: user?.subscriptionId },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const isAdded = id => {
      const products = state.occurenceCustomer?.cart?.cartInfo?.products || []

      const index = products?.findIndex(
         node => node.subscriptionOccurenceProductId === id
      )
      return index === -1 ? false : true
   }
   const theme = configOf('theme-color', 'Visual')

   if (loading) return <SkeletonProduct />
   if (isEmpty(categories))
      return (
         <main tw="pt-4">
            <HelperBar>
               <HelperBar.SubTitle>
                  No products available yet!
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   return (
      <main>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                     ).length
                  }
                  )
               </h4>
               <Products>
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                  ).map((node, index) => (
                     <Product
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                     />
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Product = ({ node, isAdded, theme }) => {
   const { state, methods } = useMenu()
   const type = node?.simpleRecipeProductOption?.id ? 'SRP' : 'IP'
   const option =
      type === 'SRP'
         ? node.simpleRecipeProductOption
         : node.inventoryProductOption

   const add = item => {
      if (state.occurenceCustomer?.validStatus?.itemCountValid) {
         addToast("Your're cart is already full!", {
            appearance: 'warning',
         })
         return
      }
      methods.products.add(item)
   }

   const canAdd = () => {
      const conditions = [
         !node.isSingleSelect,
         state?.week?.isValid,
         !isAdded(node?.cartItem?.cartItemId),
      ]
      return (
         conditions.every(node => node) ||
         ['PENDING', undefined].includes(state.occurenceCustomer?.cart?.status)
      )
   }
   return (
      <Styles.Product
         theme={theme}
         className={`${isAdded(node?.id) ? 'active' : ''}`}
      >
         <div
            css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
         >
            {node?.cartItem?.image ? (
               <img
                  alt={node?.cartItem?.name}
                  title={node?.cartItem?.name}
                  src={node?.cartItem?.image}
                  css={tw`h-full w-full object-cover select-none`}
               />
            ) : (
               <span>No Photos</span>
            )}
         </div>
         {node.addonLabel && (
            <Label>
               {node.addonLabel} {formatCurrency(Number(node.addonPrice) || 0)}
            </Label>
         )}
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  tw="flex-shrink-0"
                  className={`${isAdded(node?.id) ? 'active' : ''}`}
               />
               <Link
                  tw="text-gray-700"
                  to={`/subscription/${
                     type === 'SRP' ? 'recipes' : 'inventory'
                  }?id=${node?.cartItem?.id}${
                     type === 'SRP'
                        ? `&serving=${option?.simpleRecipeYieldId}`
                        : `&option=${option?.id}`
                  }`}
               >
                  {node?.cartItem?.name}
               </Link>
            </section>
            {canAdd() && (
               <button
                  onClick={() => add(node.cartItem)}
                  tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
               >
                  {isAdded(node?.id) ? 'Add Again' : 'Add'}
               </button>
            )}
         </div>
         <p>
            {type === 'SRP'
               ? option?.simpleRecipeProduct?.additionalText
               : option?.inventoryProduct?.additionalText}
         </p>
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li(
      ({ theme }) => css`
         ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
         &.active {
            ${tw`border border-2 border-red-400`}
            border-color: ${theme?.highlight ? theme.highlight : '#38a169'}
         }
      `
   ),
}

const Products = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Check = styled(CheckIcon)(
   () => css`
      ${tw`mr-2 stroke-current text-gray-300`}
      &.active {
         ${tw`text-green-700`}
      }
   `
)

const Label = styled.span`
   top: 16px;
   ${tw`
      px-2
      absolute 
      rounded-r
      bg-green-500 
      text-sm uppercase font-medium tracking-wider text-white 
   `}
`
