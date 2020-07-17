import React from 'react'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { Loader } from '../../components'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'

export const Menu = () => {
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: {
               _eq: state?.week?.id,
            },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const showDetails = (id, yieldId) => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            tunnel: true,
            recipe: {
               id,
               yieldId,
            },
            weekId: state.week.id,
         },
      })
   }

   const selectRecipe = (cart, addonPrice) => {
      dispatch({
         type: 'SELECT_RECIPE',
         payload: { weekId: state.week.id, cart: { ...cart, addonPrice } },
      })
      addToast(`You've selected the recipe ${cart.name}.`, {
         appearance: 'info',
      })
   }

   const isAdded = id => {
      return state?.weeks[state.week.id]?.cart.products.findIndex(
         node => node?.option?.id === id
      ) === -1
         ? false
         : true
   }

   if (loading) return <Loader inline />
   return (
      <main>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} ({category.productsAggregate.aggregate.count})
               </h4>
               <Products>
                  {category.productsAggregate.nodes.map(node => (
                     <Product
                        key={node.productOption.id}
                        className={`${
                           isAdded(node.productOption.id) && 'active'
                        }`}
                     >
                        <div
                           css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
                        >
                           {node.productOption.product.recipe.image ? (
                              <img
                                 alt={node.productOption.product.recipe.name}
                                 title={node.productOption.product.recipe.name}
                                 src={node.productOption.product.recipe.image}
                                 css={tw`h-full w-full object-cover select-none`}
                              />
                           ) : (
                              <span>No Photos</span>
                           )}
                        </div>
                        <div css={tw`flex items-center justify-between`}>
                           <span
                              tabIndex="0"
                              role="button"
                              tw="text-gray-700"
                              onKeyPress={e =>
                                 e.charCode === 13 &&
                                 showDetails(
                                    node.productOption.product.id,
                                    node.productOption.simpleRecipeYieldId
                                 )
                              }
                              onClick={() =>
                                 showDetails(
                                    node.productOption.product.id,
                                    node.productOption.simpleRecipeYieldId
                                 )
                              }
                           >
                              {node.productOption.product.name}
                           </span>
                           {!isAdded(node.productOption.id) && (
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
                     </Product>
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Products = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Product = styled.li`
   ${tw`border flex flex-col bg-white p-2 rounded overflow-hidden`}
   &.active {
      ${tw`border border-2 border-red-400`}
   }
`
