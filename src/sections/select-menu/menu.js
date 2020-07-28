import React from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
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

   const isAdded = id => {
      return state?.weeks[state.week.id]?.cart.products.findIndex(
         node => node?.option?.id === id
      ) === -1
         ? false
         : true
   }

   if (loading) return <SkeletonProduct />
   return (
      <main>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} ({category.productsAggregate.aggregate.count})
               </h4>
               <Products>
                  {category.productsAggregate.nodes.map((node, index) => (
                     <Product
                        key={`${index}-${node.productOption.id}`}
                        className={`${
                           isAdded(node.productOption.id) && 'active'
                        }`}
                     >
                        <div
                           css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
                        >
                           {node.productOption.product.assets?.images.length >
                           0 ? (
                              <img
                                 alt={node.productOption.product.recipe.name}
                                 title={node.productOption.product.recipe.name}
                                 src={
                                    node.productOption.product.assets.images[0]
                                 }
                                 css={tw`h-full w-full object-cover select-none`}
                              />
                           ) : (
                              <span>No Photos</span>
                           )}
                        </div>
                        {node.addonLabel && (
                           <Label>
                              {node.addonLabel} {node.addonPrice}
                           </Label>
                        )}
                        <div css={tw`flex items-center justify-between`}>
                           <section tw="flex items-center">
                              <Check
                                 size={16}
                                 className={`${
                                    isAdded(node.productOption.id) && 'active'
                                 }`}
                              />
                              <Link
                                 tw="text-gray-700"
                                 to={`/subscription/recipes?id=${node.productOption.product.id}&serving=${node.productOption.simpleRecipeYieldId}`}
                              >
                                 {node.productOption.product.name}
                              </Link>
                           </section>
                           {state?.week?.isValid &&
                              !isAdded(node.productOption.id) && (
                                 <button
                                    onClick={() =>
                                       selectRecipe(
                                          node.cartItem,
                                          node.addonPrice
                                       )
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
   ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
   &.active {
      ${tw`border border-2 border-red-400`}
   }
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
