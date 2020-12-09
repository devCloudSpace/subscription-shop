/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import moment from 'moment'
import { Link } from 'gatsby'
import { rrulestr } from 'rrule'
import tw, { styled } from 'twin.macro'
import { isEmpty, uniqBy } from 'lodash'
import { useLazyQuery } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { formatDate } from '../../utils'
import { Layout, SEO, Form, HelperBar, Loader, Spacer } from '../../components'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES, OUR_MENU } from '../../graphql'

const OurMenu = () => {
   return (
      <Layout>
         <SEO title="Our Menu" />
         <Content />
      </Layout>
   )
}

export default OurMenu

const Content = () => {
   const [current, setCurrent] = React.useState(0)
   const { configOf, brand } = useConfig('conventions')
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
            setCurrent(0)
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
      fetchTitles({
         variables: { brandId: brand.id },
      })
      return () => {
         setOccurences([])
         setCurrent(0)
         setCategories([])
      }
   }, [fetchTitles, brand.id])

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
   const config = configOf('primary-labels')
   const yieldLabel = {
      singular: config?.yieldLabel?.singular || 'serving',
      plural: config?.yieldLabel?.singular || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular || 'recipe',
      plural: config?.itemLabel?.singular || 'recipes',
   }
   if (loading)
      return (
         <Main>
            <Loader inline />
         </Main>
      )
   if (isEmpty(titles))
      return (
         <Main>
            <Spacer size="sm" />
            <HelperBar type="info">
               <HelperBar.SubTitle>No Menu Available!</HelperBar.SubTitle>
            </HelperBar>
         </Main>
      )
   return (
      <Main>
         <Header>
            <div>
               {!loading && titles.length > 0 && (
                  <SelectSection>
                     <Form.Label htmlFor="plans">Plans</Form.Label>
                     <select
                        id="plans"
                        name="plans"
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
                        <Form.Label htmlFor="serving">
                           {yieldLabel.plural}
                        </Form.Label>
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
                        <Form.Label htmlFor="counts">
                           {itemCountLabel.plural}
                        </Form.Label>
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
                           Delivery Day
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
            </div>
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
         {!loadingProducts ? (
            <main tw="mt-3">
               {categories.length > 0 ? (
                  categories.map(category => (
                     <section key={category.name} css={tw`mb-8`}>
                        <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                           {category.name} (
                           {
                              uniqBy(category.productsAggregate.nodes, v =>
                                 [
                                    v?.cartItem?.id,
                                    v?.cartItem?.option?.id,
                                 ].join()
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
                                 key={`${index}-${
                                    node.simpleRecipeProductOption?.id ||
                                    node.inventoryProductOption?.id
                                 }`}
                              />
                           ))}
                        </Products>
                     </section>
                  ))
               ) : (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        No products available this week!
                     </HelperBar.SubTitle>
                  </HelperBar>
               )}
            </main>
         ) : (
            <Loader inline />
         )}
      </Main>
   )
}

const Product = ({ node }) => {
   const type = node?.simpleRecipeProductOption?.id ? 'SRP' : 'IP'
   const option =
      type === 'SRP'
         ? node.simpleRecipeProductOption
         : node.inventoryProductOption
   return (
      <Styles.Product>
         <div tw="flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden">
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
         {node?.addOnLabel && (
            <Label>
               {node?.addOnLabel} {node?.addOnPrice}
            </Label>
         )}
         <div tw="flex items-center justify-between">
            <section tw="flex items-center">
               <Link
                  tw="text-gray-700"
                  to={`/subscription/${
                     type === 'SRP' ? 'recipes' : 'inventory'
                  }?id=${node?.id}${
                     type === 'SRP'
                        ? `&serving=${option?.simpleRecipeYieldId}`
                        : `&option=${option?.id}`
                  }`}
               >
                  {node?.cartItem?.name}
               </Link>
            </section>
         </div>
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li`
      ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
      &.active {
         ${tw`border border-2 border-red-400`}
      }
   `,
}

const Main = styled.main`
   max-width: 1180px;
   margin: 0 auto;
   width: calc(100% - 40px);
   min-height: calc(100vh - 128px);
`

const SelectSection = styled.section`
   ${tw`flex flex-col px-3`}
`

const Header = styled.header`
   ${tw`w-full border-b flex justify-center`}
   div {
      ${tw`flex items-center space-x-3 divide-x py-3`}
   }
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
