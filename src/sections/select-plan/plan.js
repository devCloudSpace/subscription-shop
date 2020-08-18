import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { useConfig } from '../../context'
import { isClient, formatCurrency } from '../../utils'

export const Plan = ({ plan }) => {
   const { primary } = useConfig()
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
      navigate('/subscription/get-started/register')
   }

   if (
      plan.servings.length === 0 ||
      plan.servings.every(serving => serving.itemCounts.length === 0)
   )
      return null
   return (
      <div css={tw`border rounded-lg p-8`}>
         <h2 css={tw`mb-5 text-2xl font-medium tracking-wide text-green-700`}>
            {plan.title}
         </h2>
         <section css={tw`h-12 mb-4 flex items-center justify-between`}>
            {plan.servings.length === 1 ||
            plan.servings.some(serving => serving.itemCounts.length !== 0) ? (
               <span
                  css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
               >
                  {plan.servings[0].size}{' '}
                  {plan.servings[0].size > 1
                     ? primary.yieldLabel.plural
                     : primary.yieldLabel.singular}
               </span>
            ) : (
               <>
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
                  >
                     No. of {primary.yieldLabel.plural}
                  </span>
                  <CountList>
                     {plan.servings.map(
                        serving =>
                           serving.itemCounts.length > 0 && (
                              <CountListItem
                                 key={serving.id}
                                 onClick={() => setDefaultServing(serving)}
                                 className={`${
                                    serving.id === defaultServing?.id
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 {serving.size}
                              </CountListItem>
                           )
                     )}
                  </CountList>
               </>
            )}
         </section>
         <section css={tw`h-12 mb-4 flex items-center justify-between mt-3`}>
            {defaultServing?.itemCounts.length === 1 ? (
               <span
                  css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
               >
                  {defaultServing?.itemCounts[0].count}{' '}
                  {defaultServing?.itemCounts[0].count === 1
                     ? primary.itemLabel.singular
                     : primary.itemLabel.plural}{' '}
                  per week
               </span>
            ) : (
               <>
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
                  >
                     {primary.itemLabel.plural} per week
                  </span>
                  <CountList>
                     {defaultServing?.itemCounts.map(item => (
                        <CountListItem
                           key={item.id}
                           onClick={() => setDefaultItemCount(item)}
                           className={`${
                              item.id === defaultItemCount?.id ? 'active' : ''
                           }`}
                        >
                           {item.count}
                        </CountListItem>
                     ))}
                  </CountList>
               </>
            )}
         </section>
         <hr />
         <div tw="mb-6 flex items-center">
            <section tw="h-full flex-1">
               <span tw="text-green-700 font-medium">
                  {formatCurrency(
                     Number.parseFloat(
                        defaultItemCount?.price ||
                           0 /
                              (defaultItemCount?.count ||
                                 1 * defaultServing?.size ||
                                 1)
                     ).toFixed(2)
                  )}{' '}
               </span>
               <span tw="text-gray-600">
                  / {primary.yieldLabel.singular} x{' '}
                  {defaultServing?.size || 0 * defaultItemCount?.count || 0}
               </span>
            </section>
            <section tw="h-full flex-1 flex flex-col text-right border-l py-1">
               <span tw="text-green-700 text-2xl font-medium">
                  {formatCurrency(defaultItemCount?.price)}
               </span>
               <span tw="text-gray-600">Weekly total</span>
            </section>
         </div>
         <Button onClick={() => selectPlan()}>Select</Button>
      </div>
   )
}

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
