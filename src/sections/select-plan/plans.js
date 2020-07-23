import React from 'react'
import { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { Plan } from './plan'
import { PLANS } from '../../graphql'
import { Loader } from '../../components'

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
