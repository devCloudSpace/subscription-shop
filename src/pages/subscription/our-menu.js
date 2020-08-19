/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import moment from 'moment'
import { Link } from 'gatsby'
import { rrulestr } from 'rrule'
import tw, { styled } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'

import { formatDate } from '../../utils'
import { Layout, SEO, Form } from '../../components'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES, OUR_MENU } from '../../graphql'

const OurMenu = () => {
   const [current, setCurrent] = React.useState(0)
   const [occurences, setOccurences] = React.useState([])
   const [categories, setCategories] = React.useState([])

   const [fetchProducts, { loading: loadingProducts }] = useLazyQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         onCompleted: ({ categories = [] }) => {
            if (categories.length > 0) {
               setCategories(categories)
            }
         },
      }
   )

   const [
      fetchSubscription,
      { loading: loadingSubscription, data: { subscription = {} } = {} },
   ] = useLazyQuery(OUR_MENU.SUBSCRIPTION, {
      onCompleted: ({ subscription = {} }) => {
         if (subscription.occurences.length > 0) {
            const validOccurences = subscription.occurences.filter(
               node => node.isVisible
            )
            setOccurences(validOccurences)
            fetchProducts({
               variables: {
                  occurenceId: { _eq: validOccurences[0].id },
                  subscriptionId: { _eq: subscription.id },
               },
            })
         }
      },
   })

   const [
      fetchItemCount,
      { loading: loadingItemCount, data: { itemCount = {} } = {} },
   ] = useLazyQuery(OUR_MENU.ITEM_COUNT, {
      onCompleted: ({ itemCount = {} }) => {
         if (itemCount.subscriptions.length > 0) {
            const [subscription] = itemCount.subscriptions
            fetchSubscription({ variables: { id: subscription.id } })
         }
      },
   })

   const [
      fetchServing,
      { loading: loadingServing, data: { serving = {} } = {} },
   ] = useLazyQuery(OUR_MENU.SERVING, {
      onCompleted: ({ serving = {} }) => {
         if (serving.counts.length > 0) {
            const [count] = serving.counts
            fetchItemCount({ variables: { id: count.id } })
         }
      },
   })

   const [
      fetchTitle,
      { loading: loadingTitle, data: { title = {} } = {} },
   ] = useLazyQuery(OUR_MENU.TITLE, {
      onCompleted: ({ title = {} }) => {
         if (title?.servings.length > 0) {
            const [serving] = title?.servings
            fetchServing({ variables: { id: serving.id } })
         }
      },
   })

   const [fetchTitles, { loading, data: { titles = [] } = {} }] = useLazyQuery(
      OUR_MENU.TITLES,
      {
         onCompleted: ({ titles = [] }) => {
            if (titles.length > 0) {
               const [title] = titles
               fetchTitle({ variables: { id: title.id } })
            }
         },
      }
   )

   React.useEffect(() => {
      fetchTitles()
      return () => {
         setOccurences([])
         setCurrent(0)
         setCategories([])
      }
   }, [fetchTitles])

   const next = () => {
      const nextOne = (current + 1 + occurences.length) % occurences.length
      setCurrent(nextOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[nextOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   const previous = () => {
      const previousOne = (current - 1 + occurences.length) % occurences.length
      setCurrent(previousOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[previousOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   return (
      <Layout>
         <SEO title="Our Menu" />
         <Main>
            <Header>
               {!loading && titles.length > 0 && (
                  <SelectSection>
                     <Form.Label htmlFor="titles">Titles</Form.Label>
                     <select
                        id="titles"
                        name="titles"
                        value={title.id}
                        onChange={e =>
                           fetchTitle({ variables: { id: e.target.value } })
                        }
                     >
                        {titles.map(({ id, title }) => (
                           <option key={id} value={id}>
                              {title}
                           </option>
                        ))}
                     </select>
                  </SelectSection>
               )}

               {[!loading, !loadingTitle].every(node => node) &&
                  title?.servings?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="serving">Servings</Form.Label>
                        <select
                           id="servings"
                           name="servings"
                           value={serving.id}
                           onChange={e =>
                              fetchServing({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {title?.servings.map(({ id, size }) => (
                              <option key={id} value={id}>
                                 {size}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}

               {[!loading, !loadingTitle, !loadingServing].every(
                  node => node
               ) &&
                  serving?.counts?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="counts">Item Counts</Form.Label>
                        <select
                           id="counts"
                           name="counts"
                           value={itemCount.id}
                           onChange={e =>
                              fetchItemCount({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {serving?.counts.map(({ id, count }) => (
                              <option key={id} value={id}>
                                 {count}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
               {[
                  !loading,
                  !loadingTitle,
                  !loadingServing,
                  !loadingItemCount,
               ].every(node => node) &&
                  itemCount?.subscriptions?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="subscriptions">
                           Subscriptions
                        </Form.Label>
                        <select
                           id="subscriptions"
                           name="subscriptions"
                           value={subscription.id}
                           onChange={e =>
                              fetchSubscription({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {itemCount?.subscriptions.map(({ id, rrule }) => (
                              <option key={id} value={id}>
                                 {rrulestr(rrule).toText()}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
            </Header>
            {!loadingSubscription && occurences.length > 0 && (
               <Occurence>
                  <SliderButton onClick={previous}>
                     <ArrowLeftIcon tw="stroke-current text-green-800" />
                  </SliderButton>
                  <span tw="flex items-center justify-center text-base text-center md:text-lg text-indigo-800">
                     Showing menu of:&nbsp;
                     {formatDate(
                        moment(occurences[current].fulfillmentDate)
                           .subtract(7, 'days')
                           .format('YYYY-MM-DD'),
                        {
                           month: 'short',
                           day: 'numeric',
                           year: 'numeric',
                        }
                     )}
                     &nbsp;-&nbsp;
                     {formatDate(occurences[current].fulfillmentDate, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                     })}
                  </span>

                  <SliderButton onClick={next}>
                     <ArrowRightIcon tw="stroke-current text-green-800" />
                  </SliderButton>
               </Occurence>
            )}
            <main tw="px-3">
               {!loadingProducts &&
                  categories.length > 0 &&
                  categories.map(category => (
                     <section key={category.name} css={tw`mb-8`}>
                        <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                           {category.name} (
                           {category.productsAggregate.aggregate.count})
                        </h4>
                        <Products>
                           {category.productsAggregate.nodes.map(
                              (node, index) => (
                                 <Product
                                    key={`${index}-${node.productOption.id}`}
                                 >
                                    <div tw="flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden">
                                       {node.productOption.product.assets
                                          ?.images.length > 0 ? (
                                          <img
                                             alt={
                                                node.productOption.product
                                                   .recipe.name
                                             }
                                             title={
                                                node.productOption.product
                                                   .recipe.name
                                             }
                                             src={
                                                node.productOption.product
                                                   .assets.images[0]
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
                                    <div tw="flex items-center justify-between">
                                       <section tw="flex items-center">
                                          <Link
                                             tw="text-gray-700"
                                             to={`/subscription/recipes?id=${node.productOption.product.id}&serving=${node.productOption.simpleRecipeYieldId}`}
                                          >
                                             {node.productOption.product.name}
                                          </Link>
                                       </section>
                                    </div>
                                 </Product>
                              )
                           )}
                        </Products>
                     </section>
                  ))}
            </main>
         </Main>
      </Layout>
   )
}

export default OurMenu

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const SelectSection = styled.section`
   ${tw`flex flex-col px-3`}
`

const Header = styled.header`
   ${tw`flex items-center space-x-3 divide-x border-b py-3`}
`

const Occurence = styled.div`
   width: 100%;
   height: 64px;
   display: grid;
   margin: auto;
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
