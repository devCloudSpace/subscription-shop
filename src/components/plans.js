import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { PLANS } from '../graphql'
import { isClient } from '../utils'
import { Loader } from './loader'

export const Plans = () => {
   const { addToast } = useToasts()
   const { loading, error, data: { plans = [] } = {} } = useSubscription(
      PLANS,
      {
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   if (loading) return <Loader inline />
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
   const { addToast } = useToasts()
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)

   React.useEffect(() => {
      if (plan.defaultServingId) {
         setDefaultServing(plan.defaultServing)
      }
      setDefaultServing(plan.servings[0])
   }, [plan])

   React.useEffect(() => {
      if (defaultServing) {
         if (defaultServing.defaultItemCountId) {
            return setDefaultItemCount(defaultServing.defaultItemCount)
         }
         setDefaultItemCount(defaultServing.itemCounts[0])
      }
   }, [defaultServing])

   const selectPlan = () => {
      if (isClient) {
         window.localStorage.setItem('plan', defaultItemCount.id)
      }
      addToast('Successfully selected a plan.', {
         appearance: 'success',
      })
      navigate('/get-started/register')
   }

   if (!defaultItemCount || !defaultServing) return <Loader inline />
   return (
      <div css={tw`border rounded-lg p-8`}>
         <h2 css={tw`mb-5 text-2xl font-medium tracking-wide text-green-700`}>
            {plan.title}
         </h2>
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
                     onClick={() => setDefaultServing(serving)}
                     className={`${
                        serving.id === defaultServing.id ? 'active' : ''
                     }`}
                  >
                     {serving.size}
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
                     onClick={() => setDefaultItemCount(item)}
                     className={`${
                        item.id === defaultItemCount.id ? 'active' : ''
                     }`}
                  >
                     {item.count}
                  </CountListItem>
               ))}
            </CountList>
         </section>
         <hr />
         <div tw="mb-6 flex items-center">
            <section tw="h-full flex-1">
               <span tw="text-green-700 font-medium">
                  {Number.parseFloat(
                     defaultItemCount.price /
                        (defaultItemCount.count * defaultServing.size)
                  ).toFixed(2)}{' '}
               </span>
               <span tw="text-gray-600">per serving</span>
            </section>
            <section tw="h-full flex-1 flex flex-col text-right border-l py-1">
               <span tw="text-green-700 text-2xl font-medium">
                  {defaultItemCount.price}
               </span>
               <span tw="text-gray-600">Weekly total</span>
            </section>
         </div>
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
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`

const CountList = styled.ul`
   border-radius: 4px;
   ${tw`
      p-1
      border
      flex items-center justify-between 
   `}
`

const CountListItem = styled.li`
   border-radius: 2px;
   &.active {
      ${tw`text-white bg-green-600`}
   }
   ${tw`
         h-12 w-12 
         cursor-pointer
         flex items-center justify-center 
         hover:text-white hover:bg-green-600 hover:rounded 
      `}
`

const Button = styled.button`
   ${tw`w-full h-12 bg-blue-400 uppercase tracking-wider font-medium text-white rounded-full`}
`
