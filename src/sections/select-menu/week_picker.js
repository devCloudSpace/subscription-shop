import React from 'react'
import moment from 'moment'
import tw, { styled } from 'twin.macro'

import { useMenu } from './state'
import { Loader } from '../../components'

export const WeekPicker = ({ isFixed }) => {
   const { state, dispatch } = useMenu()

   if (state.isOccurencesLoading) return <Loader inline />
   if (!state?.week?.id) return null
   if (isFixed)
      return (
         <Occurence isFixed={isFixed}>
            <span
               css={tw`flex items-center justify-center text-base text-center md:text-lg text-indigo-800`}
            >
               Showing menu of:&nbsp;
               {moment(state?.week?.fulfillmentDate)
                  .subtract(7, 'days')
                  .format('MMM D')}
               &nbsp;-&nbsp;
               {moment(state?.week?.fulfillmentDate).format('MMM D')}
            </span>
         </Occurence>
      )
   return (
      <Occurences>
         {state.occurences.map(occurence => (
            <Occurence
               onClick={() =>
                  dispatch({ type: 'SET_WEEK', payload: occurence })
               }
               className={
                  state.week?.fulfillmentDate === occurence.fulfillmentDate
                     ? 'active'
                     : ''
               }
            >
               {moment(occurence?.fulfillmentDate)
                  .subtract(7, 'days')
                  .format('MMM D')}
               &nbsp;-&nbsp;
               {moment(occurence?.fulfillmentDate).format('MMM D')}
            </Occurence>
         ))}
      </Occurences>
   )
}

const Occurences = styled.ul`
   height: 64px;
   max-width: 980px;
   ${tw`w-full mx-auto overflow-x-auto flex items-center justify-center space-x-4`}
`

const Occurence = styled.li`
   ${tw`flex-shrink-0 px-3 rounded-full border`}
   &.active {
      ${tw`bg-green-200 text-green-700`}
   }
`
