import React from 'react'
import { navigate } from 'gatsby'
import { rrulestr } from 'rrule'
import tw, { styled, css } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { useDelivery } from './state'
import { Loader } from '../../components'
import { ITEM_COUNT } from '../../graphql'
import { CheckIcon } from '../../assets/icons'

export const DeliverySection = () => {
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
         <div>
            <h2 css={tw`mb-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
            <Loader inline />
         </div>
      )
   if (Object.keys(state.address.selected).length === 0)
      return (
         <>
            <h2 css={tw`my-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
            <SelectAddressInfo>
               <span>Select an address to get started</span>
            </SelectAddressInfo>
         </>
      )
   return (
      <>
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Select Delivery Day</h2>
         {itemCount?.valid?.length === 0 && itemCount?.invalid?.length === 0 && (
            <NoPlans>
               <span>No days are available for delivery on this address.</span>
               <button onClick={() => navigate('/get-started/select-plan')}>
                  Select Plan
               </button>
            </NoPlans>
         )}
         {itemCount?.valid?.length === 0 && itemCount?.invalid?.length > 0 && (
            <NoPlans>
               <span>
                  Following days are not available for delivery on this address.
               </span>
            </NoPlans>
         )}
         <DeliveryDays
            onChange={e =>
               daySelection(Number(e.target.getAttribute('data-id')))
            }
         >
            {itemCount?.valid?.map(day => (
               <DeliveryDay key={day.id} onClick={() => daySelection(day.id)}>
                  <DeliveryDayLeft
                     className={`${
                        day.id === state.delivery.selected?.id && 'active'
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

const NoPlans = styled.div`
   height: 48px;
   ${tw`w-full flex justify-between items-center px-3 rounded bg-orange-200 text-orange-800 mb-3`}
   button {
      ${tw`border border-orange-800 py-1 px-2 rounded text-sm hover:bg-orange-300`}
   }
`

const SelectAddressInfo = styled.div`
   height: 48px;
   ${tw`w-full flex justify-between items-center px-3 rounded bg-blue-200 text-blue-800 mb-3`}
   button {
      ${tw`border border-blue-800 py-1 px-2 rounded text-sm hover:bg-blue-300`}
   }
`
