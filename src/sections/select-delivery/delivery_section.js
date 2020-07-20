import React from 'react'
import { rrulestr } from 'rrule'
import tw, { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/react-hooks'

import { isClient } from '../../utils'
import { useDelivery } from './state'
import { Loader } from '../../components'
import { ITEM_COUNT } from '../../graphql'

export const DeliverySection = ({ setDay }) => {
   const { addToast } = useToasts()
   const { dispatch } = useDelivery()
   const { loading, data: { itemCount = {} } = {} } = useSubscription(
      ITEM_COUNT,
      {
         variables: {
            id: isClient && window.localStorage.getItem('plan'),
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const daySelection = id => {
      const day = itemCount.days.find(day => day.id === id)
      dispatch({ type: 'SET_DAY', payload: day })
   }

   if (loading)
      return (
         <div>
            <h2 css={tw`mb-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
            <Loader inline />
         </div>
      )
   return (
      <>
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
         <DeliveryDays
            onChange={e =>
               daySelection(Number(e.target.getAttribute('data-id')))
            }
         >
            {itemCount?.days?.length > 0 ? (
               itemCount.days.map((day, index) => (
                  <DeliveryDay key={day.id}>
                     <span>
                        <input
                           type="radio"
                           data-id={day.id}
                           name="delivery-day"
                           id={`day-${index + 1}`}
                           css={tw`w-full h-full cursor-pointer`}
                        />
                     </span>
                     <label
                        htmlFor={`day-${index + 1}`}
                        css={tw`w-full cursor-pointer`}
                     >
                        {rrulestr(day.rrule).toText()}
                     </label>
                  </DeliveryDay>
               ))
            ) : (
               <div>No delivery dates available</div>
            )}
         </DeliveryDays>
      </>
   )
}

const DeliveryDays = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-2 
      md:grid-cols-3 
   `}
`

const DeliveryDay = styled.li`
   height: 48px;
   ${tw`flex items-center border capitalize text-gray-700`}
   span {
      width: 48px;
      height: 48px;
      ${tw`border-r border-gray-300 h-full mr-2 flex flex-shrink-0 items-center justify-center bg-gray-200`}
   }
`
