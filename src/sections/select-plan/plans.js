import React from 'react'
import { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { Plan } from './plan'
import { PLANS } from '../../graphql'
import { SkeletonPlan } from './skeletons'
import { HelperBar } from '../../components'

export const Plans = () => {
   const { addToast } = useToasts()
   const [plans, setPlans] = React.useState([])
   const { loading, error } = useSubscription(PLANS, {
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         const { plans } = data
         const filtered = plans
            .filter(plan => plan.servings.length > 0)
            .map(plan => ({
               ...plan,
               servings: plan.servings.filter(
                  serving => serving.itemCounts.length > 0
               ),
            }))
         console.log('Plans -> filtered', filtered)
         setPlans(filtered)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   if (loading)
      return (
         <List>
            <SkeletonPlan />
            <SkeletonPlan />
         </List>
      )
   if (error) return <div>{error.message}</div>
   if (plans.length === 0)
      return (
         <Wrapper tw="py-3">
            <HelperBar type="info">
               <HelperBar.SubTitle>No plans available yet!</HelperBar.SubTitle>
            </HelperBar>
         </Wrapper>
      )
   return (
      <List>
         {plans.map(plan => (
            <Plan key={plan.id} plan={plan} />
         ))}
      </List>
   )
}

const Wrapper = styled.div`
   margin: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
`

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
