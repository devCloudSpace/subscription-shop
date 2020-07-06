import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { PLANS } from '../graphql'

export const Plans = () => {
   const { loading, error, data: { plans = [] } = {} } = useSubscription(PLANS)

   if (loading) return <div>Loading...</div>
   if (error) return <div>{error.message}</div>
   return (
      <List>
         {plans.length > 0 ? (
            plans.map(plan => <Plan key={plan.id} plan={plan} />)
         ) : (
            <div>No plans</div>
         )}
      </List>
   )
}

const Plan = ({ plan }) => {
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)

   React.useEffect(() => {
      if (plan.defaultServingId) {
         setDefaultServing(plan.defaultServing)
      }
      setDefaultServing(plan.servings[0])

      if (plan?.defaultServing?.defaultItemCountId) {
         setDefaultItemCount(plan.defaultServing.defaultItemCount)
      }
      setDefaultItemCount(plan.servings[0].itemCounts[0])
   }, [plan])

   const selectDefaultServing = serving => {
      setDefaultServing(serving)
      if (serving.defaultItemCountId) {
         setDefaultItemCount(serving.defaultItemCount)
      }
      setDefaultItemCount(serving.itemCounts[0])
   }

   const selectPlan = () => {
      if (typeof window !== 'undefined') {
         window.localStorage.setItem('plan', defaultItemCount.id)
      }
   }

   if (!defaultItemCount || !defaultServing) return <div>Loading...</div>
   return (
      <div css={tw`border rounded-lg p-8`}>
         <h2 css={tw`mb-5 text-2xl font-bold text-green-700`}>{plan.title}</h2>
         <section css={tw`flex items-center justify-between`}>
            <span
               css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
            >
               Servings
            </span>
            <CountList>
               {plan.servings.map(serving => (
                  <CountListItem
                     key={serving.id}
                     isActive={serving.id === defaultServing.id}
                     onClick={() => selectDefaultServing(serving)}
                  >
                     {serving.servingSize}
                  </CountListItem>
               ))}
            </CountList>
         </section>
         <section css={tw`mb-4 flex items-center justify-between mt-3`}>
            <span
               css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
            >
               Recipes per week
            </span>
            <CountList>
               {defaultServing.itemCounts.map(item => (
                  <CountListItem
                     key={item.id}
                     isActive={item.id === defaultItemCount.id}
                     onClick={() => setDefaultItemCount(item)}
                  >
                     {item.count}
                  </CountListItem>
               ))}
            </CountList>
         </section>
         <Button onClick={() => selectPlan()}>Select</Button>
      </div>
   )
}

const List = styled.ul`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);

   display: grid;
   grid-gap: 24px;
   grid-template-columns: 1fr 1fr;

   padding: 24px 0;
`

const CountList = styled.ul`
   border-radius: 4px;
   ${tw`
      p-1
      border
      flex items-center justify-between 
   `}
`

const CountListItem = styled.li(
   ({ isActive }) => css`
      border-radius: 2px;
      ${isActive && tw`text-white bg-green-600`}
      ${tw`
         h-12 w-12 
         cursor-pointer
         flex items-center justify-center 
         hover:text-white hover:bg-green-600 hover:rounded 
      `}
   `
)

const Button = styled.button`
   ${tw`w-full h-12 bg-blue-400 uppercase tracking-wider font-medium text-white rounded-full`}
`
