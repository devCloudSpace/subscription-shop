import React from 'react'
import moment from 'moment'
import tw, { styled } from 'twin.macro'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { useUser } from '../../context'
import { formatDate } from '../../utils'
import {
   CUSTOMER_OCCURENCES,
   OCCURENCE_PRODUCTS_BY_CATEGORIES,
} from '../../graphql'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { SEO, Layout, StepsNavbar, Loader } from '../../components'

const SelectMenu = () => {
   const [week, setWeek] = React.useState({})
   return (
      <Layout noHeader>
         <SEO title="Select Menu" />
         <StepsNavbar />
         <Main>
            <WeekPicker week={week} setWeek={setWeek} />
            <Header>
               <h1 css={tw`text-2xl md:text-4xl text-gray-700`}>
                  Explore our Menus
               </h1>
            </Header>
            <Menu id={week.id} />
         </Main>
      </Layout>
   )
}

export default SelectMenu

const WeekPicker = ({ week, setWeek }) => {
   const { user } = useUser()
   const [current, setCurrent] = React.useState(0)
   const [occurences, setOccurences] = React.useState([])
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
         setOccurences(filtered)
         setCurrent(0)
         setWeek(filtered[0])
      },
   })

   const next = () => {
      const nextOne = (current + 1 + occurences.length) % occurences.length
      setCurrent(nextOne)
      setWeek(occurences[nextOne])
   }
   const previous = () => {
      const previousOne = (current - 1 + occurences.length) % occurences.length
      setCurrent(previousOne)
      setWeek(occurences[previousOne])
   }

   if (loading) return <Loader inline />
   return (
      <Occurence>
         <SliderButton onClick={() => previous()}>
            <ArrowLeftIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
         <h2
            css={tw`flex items-center justify-center text-base text-center md:text-xl text-indigo-800`}
         >
            Showing menu of:&nbsp;
            {formatDate(
               moment(week.fulfillmentDate)
                  .subtract(7, 'days')
                  .format('YYYY-MM-DD'),
               {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
               }
            )}
            &nbsp;-&nbsp;
            {formatDate(week.fulfillmentDate, {
               month: 'short',
               day: 'numeric',
               year: 'numeric',
            })}
         </h2>
         <SliderButton onClick={() => next()}>
            <ArrowRightIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
      </Occurence>
   )
}

const Menu = ({ id }) => {
   const { loading, data: { categories = [] } = {} } = useSubscription(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: {
               _eq: id,
            },
         },
      }
   )

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
                        <div css={tw`flex items-center`}>
                           <h3
                              css={tw`text-gray-700 cursor-pointer select-none`}
                           >
                              {node.product.name}
                           </h3>
                        </div>
                     </Product>
                  ))}
               </Products>
            </section>
         ))}
      </CategoryListing>
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
