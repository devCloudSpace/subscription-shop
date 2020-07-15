import React from 'react'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'

import { useMenu } from './state'
import { RECIPE_DETAILS } from '../../graphql'
import { CloseIcon } from '../../assets/icons'
import { Tunnel, Button, Loader } from '../../components'

export const RecipeTunnel = () => {
   const { state, dispatch } = useMenu()
   const { loading, data: { product: { recipe = {} } = {} } = {} } = useQuery(
      RECIPE_DETAILS,
      {
         variables: {
            id: state.weeks[state.week.id]?.recipe?.id,
            yieldId: state.weeks[state.week.id]?.recipe?.yieldId,
         },
      }
   )

   const toggleTunnel = () => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            tunnel: false,
            recipe: {},
            weekId: state.week.id,
         },
      })
   }
   return (
      <Tunnel
         size="full"
         toggleTunnel={toggleTunnel}
         isOpen={state?.weeks[state.week.id]?.isTunnelOpen}
      >
         <Tunnel.Header title={recipe?.name}>
            <Button size="sm" onClick={toggleTunnel}>
               <CloseIcon size={20} tw="stroke-current" />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            {loading && <Loader inline />}
            {!loading && Object.keys(recipe).length > 0 && (
               <RecipeContainer>
                  <RecipeImage>
                     {recipe?.image ? (
                        <img
                           src={recipe.image}
                           alt={recipe.name}
                           tw="w-full h-full border-gray-100 object-cover rounded-lg"
                        />
                     ) : (
                        'N/A'
                     )}
                  </RecipeImage>
                  <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal">
                     Ingredients
                  </h2>
                  <span tw="text-sm text-gray-500 mb-3 block">
                     *Some items may be hidden.
                  </span>
                  <ol tw="list-decimal ml-6">
                     {recipe.yields.length > 0 &&
                        recipe.yields[0].sachets.map(
                           ({ isVisible, slipName, ingredient }) => (
                              <li key={ingredient.id} tw="h-8 text-teal-900">
                                 {isVisible
                                    ? slipName
                                    : 'Hidden by recipe author'}
                              </li>
                           )
                        )}
                  </ol>
                  <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-500 mb-3 text-lg font-medium">
                     Cooking Process
                  </h2>
                  <ol tw="list-decimal ml-4">
                     {recipe.procedures.map(procedure => (
                        <li tw="h-auto mb-4" key={procedure.name}>
                           <ol tw="list-decimal">
                              <span tw="text-lg font-normal text-gray-700">
                                 {procedure.title}
                              </span>
                              {procedure.steps.map(step =>
                                 step.isVisible ? (
                                    <li
                                       key={step.title}
                                       tw="h-auto mb-4 ml-4 mt-2"
                                    >
                                       {step.title && (
                                          <span tw="text-gray-800">
                                             {step.title}
                                          </span>
                                       )}
                                       <StepImage>
                                          {step.assets.images.length > 0 && (
                                             <img
                                                src={step.assets.images[0].url}
                                                alt={
                                                   step.assets.images[0].title
                                                }
                                                title={
                                                   step.assets.images[0].title
                                                }
                                             />
                                          )}
                                       </StepImage>
                                       <p tw="mt-1 text-gray-600">
                                          {step.description}
                                       </p>
                                    </li>
                                 ) : (
                                    <li
                                       key={step.title}
                                       tw="h-auto mb-4 ml-4 mt-2"
                                    >
                                       <span tw="text-gray-800">
                                          Hidden by recipe author
                                       </span>
                                    </li>
                                 )
                              )}
                           </ol>
                        </li>
                     ))}
                  </ol>
               </RecipeContainer>
            )}
         </Tunnel.Body>
      </Tunnel>
   )
}

const RecipeContainer = styled.div`
   margin: auto;
   max-width: 640px;
   width: calc(100vw - 40px);
`

const RecipeImage = styled.div`
   height: 320px;
`

const StepImage = styled.div`
   max-width: 340px;
   ${tw`my-2`}
   img {
      width: 100%;
      height: 220px;
      ${tw`object-cover rounded`}
   }
`
