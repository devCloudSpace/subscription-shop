import React from 'react'
import { navigate } from 'gatsby'
import { rrulestr } from 'rrule'
import tw, { styled, css } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useDelivery } from './state'
import { isClient } from '../../utils'
import { useUser } from '../../context'
import { ITEM_COUNT } from '../../graphql'
import { CheckIcon } from '../../assets/icons'
import { Loader, HelperBar } from '../../components'

export const DeliverySection = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, dispatch } = useDelivery()
   const [fetchDays, { loading, data: { itemCount = {} } = {} }] = useLazyQuery(
      ITEM_COUNT,
      {
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   React.useEffect(() => {
      if (user.subscriptionId) {
         dispatch({
            type: 'SET_DAY',
            payload: {
               id: user.subscriptionId,
            },
         })
      }
   }, [user.subscriptionId, dispatch])

   React.useEffect(() => {
      if (Object.keys(state.address.selected).length > 0) {
         fetchDays({
            variables: {
               id: isClient && window.localStorage.getItem('plan'),
               zipcode: state.address.selected.zipcode,
            },
         })
      }
   }, [state.address.selected, fetchDays])

   const daySelection = id => {
      const day = itemCount.valid.find(day => day.id === id)
      dispatch({ type: 'SET_DAY', payload: day })
   }

   if (loading)
      return (
         <>
            <Loader inline />
         </>
      )
   if (Object.keys(state.address.selected).length === 0)
      return (
         <>
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Select an address to get started
               </HelperBar.SubTitle>
            </HelperBar>
         </>
      )
   return (
      <>
         {itemCount?.valid?.length === 0 && itemCount?.invalid?.length === 0 && (
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  No days are available for delivery on this address.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() => navigate('/get-started/select-plan')}
               >
                  Select Plan
               </HelperBar.Button>
            </HelperBar>
         )}
         {itemCount?.valid?.length === 0 && itemCount?.invalid?.length > 0 && (
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  Following days are not available for delivery on this address.
               </HelperBar.SubTitle>
            </HelperBar>
         )}
         <DeliveryDays>
            {itemCount?.valid?.map(day => (
               <DeliveryDay key={day.id} onClick={() => daySelection(day.id)}>
                  <DeliveryDayLeft
                     className={`${
                        state.delivery.selected?.id === day.id && 'active'
                     }`}
                  >
                     <CheckIcon size={20} tw="stroke-current text-gray-400" />
                  </DeliveryDayLeft>
                  <label css={tw`w-full cursor-pointer`}>
                     {rrulestr(day.rrule).toText()}
                  </label>
               </DeliveryDay>
            ))}
            {itemCount?.invalid?.map(day => (
               <DeliveryDay
                  key={day.id}
                  className="invalid"
                  title="Not available on this address"
                  onClick={() => daySelection(day.id)}
               >
                  <DeliveryDayLeft
                     className={`${
                        day.id === state.delivery.selected?.id && 'active'
                     }`}
                  >
                     <CheckIcon size={20} tw="stroke-current text-gray-400" />
                  </DeliveryDayLeft>
                  <label css={tw`w-full`}>{rrulestr(day.rrule).toText()}</label>
               </DeliveryDay>
            ))}
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

const DeliveryDayLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`border-r border-gray-300 h-full mr-2 flex flex-shrink-0 items-center justify-center bg-gray-200`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)

const DeliveryDay = styled.li`
   height: 48px;
   ${tw`cursor-pointer flex items-center border capitalize text-gray-700`}
   &.invalid {
      opacity: 0.6;
      position: relative;
      :after {
         top: 0;
         left: 0;
         content: '';
         width: 100%;
         height: 100%;
         position: absolute;
      }
   }
`
