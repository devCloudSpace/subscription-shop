import React from 'react'
import moment from 'moment'
import tw, { styled } from 'twin.macro'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { useUser } from '../../context'
import { formatDate } from '../../utils'
import {
   RECIPE_DETAILS,
   CUSTOMER_OCCURENCES,
   OCCURENCE_PRODUCTS_BY_CATEGORIES,
} from '../../graphql'
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '../../assets/icons'
import {
   SEO,
   Layout,
   StepsNavbar,
   Loader,
   Tunnel,
   Button,
} from '../../components'

const initialState = {
   week: {},
   occurences: [],
   recipe: {},
   isTunnelOpen: false,
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK':
         return {
            ...state,
            week: payload,
         }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            recipe: payload.recipe,
            isTunnelOpen: payload.tunnel,
         }
      default:
         return 'No such type!'
   }
}

const MenuContext = React.createContext()

const SelectMenu = () => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <MenuContext.Provider value={{ state, dispatch }}>
         <Layout noHeader>
            <SEO title="Select Menu" />
            <StepsNavbar />
            <Main>
               <WeekPicker />
               <Header>
                  <h1 css={tw`text-2xl md:text-4xl text-gray-700`}>
                     Explore our Menus
                  </h1>
               </Header>
               <Menu />
            </Main>
            {state.isTunnelOpen && <RecipeTunnel />}
         </Layout>
      </MenuContext.Provider>
   )
}

export default SelectMenu

const WeekPicker = () => {
   const { user } = useUser()
   const [current, setCurrent] = React.useState(0)
   const { state, dispatch } = React.useContext(MenuContext)
   const { loading } = useQuery(CUSTOMER_OCCURENCES, {
      variables: {
         id: user.id,
         keycloakId: user.keycloakId,
      },
      onCompleted: ({
         customer: { subscription: { occurences = [] } = {} } = {},
      }) => {
         const filtered = occurences.filter(
            occurence => occurence.isValid && occurence.isVisible
         )
         setCurrent(0)
         dispatch({ type: 'SET_OCCURENCES', payload: filtered })
         dispatch({ type: 'SET_WEEK', payload: filtered[0] })
      },
   })

   const next = () => {
      const nextOne =
         (current + 1 + state.occurences.length) % state.occurences.length
      setCurrent(nextOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[nextOne] })
   }
   const previous = () => {
      const previousOne =
         (current - 1 + state.occurences.length) % state.occurences.length
      setCurrent(previousOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[previousOne] })
   }

   if (loading) return <Loader inline />
   return (
      <Occurence>
         <SliderButton onClick={() => previous()}>
            <ArrowLeftIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
         <span
            css={tw`flex items-center justify-center text-base text-center md:text-lg text-indigo-800`}
         >
            Showing menu of:&nbsp;
            {formatDate(
               moment(state.week.fulfillmentDate)
                  .subtract(7, 'days')
                  .format('YYYY-MM-DD'),
               {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
               }
            )}
            &nbsp;-&nbsp;
            {formatDate(state.week.fulfillmentDate, {
               month: 'short',
               day: 'numeric',
               year: 'numeric',
            })}
         </span>
         <SliderButton onClick={() => next()}>
            <ArrowRightIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
      </Occurence>
   )
}

const Menu = () => {
   const { state, dispatch } = React.useContext(MenuContext)
   const { loading, data: { categories = [] } = {} } = useSubscription(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: {
               _eq: state?.week?.id,
            },
         },
      }
   )

   const showDetails = id => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            tunnel: true,
            recipe: {
               id,
            },
         },
      })
   }

   if (loading) return <Loader inline />
   return (
      <CategoryListing>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h2 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} ({category.productsAggregate.aggregate.count})
               </h2>
               <Products>
                  {category.productsAggregate.nodes.map(node => (
                     <Product key={node.product.id}>
                        <div
                           css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
                        >
                           {node.product.recipe.image ? (
                              <img
                                 alt={node.product.recipe.name}
                                 title={node.product.recipe.name}
                                 src={node.product.recipe.image}
                                 css={tw`h-full w-full object-cover select-none`}
                              />
                           ) : (
                              <span>No Photos</span>
                           )}
                        </div>
                        <div css={tw`flex items-center justify-between`}>
                           <h4 tw="text-gray-700">{node.product.name}</h4>
                           <button
                              onClick={() => showDetails(node.product.id)}
                              tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
                           >
                              View
                           </button>
                        </div>
                     </Product>
                  ))}
               </Products>
            </section>
         ))}
      </CategoryListing>
   )
}

const RecipeTunnel = () => {
   const { user } = useUser()
   const { state, dispatch } = React.useContext(MenuContext)
   const { loading, data: { product: { recipe = {} } = {} } = {} } = useQuery(
      RECIPE_DETAILS,
      {
         variables: {
            id: state?.recipe?.id,
            yieldId: user?.subscription?.recipes?.servingId,
         },
      }
   )

   const toggleTunnel = () => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            tunnel: false,
            recipe: {},
         },
      })
   }
   return (
      <Tunnel
         size="full"
         isOpen={state.isTunnelOpen}
         toggleTunnel={toggleTunnel}
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

const Main = styled.main`
   overflow-y: auto;
   height: calc(100vh - 64px);
`

const Header = styled.header`
   height: 320px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`

const Occurence = styled.div`
   height: 64px;
   display: grid;
   margin: auto;
   max-width: 980px;
   width: 100%;
   grid-template-columns: 64px 1fr 64px;
   @media (max-width: 567px) {
      grid-template-columns: 48px 1fr 48px;
   }
`

const SliderButton = styled.button`
   width: 48px;
   height: 48px;
   ${tw`
      mx-2
      self-center
      rounded-full
      hover:bg-gray-100
      border border-green-800 
      flex items-center justify-center 
   `}
   @media (max-width: 567px) {
      width: 32px;
      height: 32px;
   }
`

const CategoryListing = styled.main`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
`

const Products = styled.ul`
   ${tw`grid sm:grid-cols-1 md:grid-cols-3 gap-3`}
`

const Product = styled.li`
   ${tw`border flex flex-col bg-white p-2 rounded overflow-hidden`}
`

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
