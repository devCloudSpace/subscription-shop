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
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'

export const Menu = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const { configOf } = useConfig()
   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: {
               _eq: state?.week?.id,
            },
            subscriptionId: {
               _eq: user?.subscriptionId,
            },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const selectRecipe = (cart, addonPrice) => {
      const isFull = state.weeks[state.week.id].cart.products.every(
         node => Object.keys(node).length !== 0
      )
      if (isFull) {
         return addToast("Your're cart is already full!", {
            appearance: 'warning',
         })
      }
      dispatch({
         type: 'SELECT_RECIPE',
         payload: { weekId: state.week.id, cart: { ...cart, addonPrice } },
      })
      addToast(`You've selected the recipe ${cart.name}.`, {
         appearance: 'info',
      })
   }

   const isAdded = (id, optionId) => {
      const week = state?.weeks[state.week.id]
      const products = week?.cart?.products.filter(node => !isEmpty(node))
      return products.findIndex(
         node => node?.id === id && node?.option?.id === optionId
      ) === -1
         ? false
         : true
   }
   const hasColor = configOf('theme-color', 'Visual')

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
                        isAdded={isAdded}
                        hasColor={hasColor}
                        selectRecipe={selectRecipe}
                        key={`${index}-${node?.id}`}
                     />
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Product = ({ node, isAdded, hasColor, selectRecipe }) => {
   const { state } = useMenu()
   const type = node?.simpleRecipeProductOption?.id ? 'SRP' : 'IP'
   const option =
      type === 'SRP'
         ? node.simpleRecipeProductOption
         : node.inventoryProductOption
   return (
      <Styles.Product
         hasColor={hasColor}
         className={`${
            isAdded(node?.cartItem?.id, node?.cartItem?.option?.id)
               ? 'active'
               : ''
         }`}
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
         {node.addOnLabel && (
            <Label>
               {node.addOnLabel} {node.addOnPrice}
            </Label>
         )}
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  className={`${
                     isAdded(node?.cartItem?.id, node?.cartItem?.option?.id)
                        ? 'active'
                        : ''
                  }`}
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
            {['PENDING', undefined].includes(
               state?.weeks[state?.week?.id]?.orderCartStatus
            ) &&
               state?.week?.isValid &&
               !isAdded(node?.cartItem?.id, node?.cartItem?.option?.id) && (
                  <button
                     onClick={() =>
                        selectRecipe(node.cartItem, node.addonPrice)
                     }
                     tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
                  >
                     Add
                  </button>
               )}
         </div>
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li(
      ({ hasColor }) => css`
         ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
         &.active {
            ${tw`border border-2 border-red-400`}
            border-color: ${
               hasColor?.highlight ? hasColor.highlight : '#38a169'
            }
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
