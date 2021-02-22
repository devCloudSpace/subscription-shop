import React from 'react'
import moment from 'moment'
import tw, { styled, css } from 'twin.macro'

import { useMenu } from './state'
import { Loader } from '../../components'
import { formatDate } from '../../utils'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'

export const WeekPicker = ({ isFixed }) => {
   const { state, dispatch } = useMenu()

   const next = () => {
      const nextOne =
         (state.currentWeekIndex + 1 + state.occurences.length) %
         state.occurences.length
      dispatch({
         type: 'SET_CURRENT_WEEK_INDEX',
         payload: nextOne,
      })
      dispatch({ type: 'SET_WEEK', payload: state.occurences[nextOne] })
   }
   const previous = () => {
      const previousOne =
         (state.currentWeekIndex - 1 + state.occurences.length) %
         state.occurences.length
      dispatch({
         type: 'SET_CURRENT_WEEK_INDEX',
         payload: previousOne,
      })
      dispatch({ type: 'SET_WEEK', payload: state.occurences[previousOne] })
   }

   if (state.isOccurencesLoading) return <Loader inline />
   if (!state?.week?.id) return null
   return (
      <Occurence isFixed={isFixed}>
         {!isFixed && (
            <SliderButton onClick={() => previous()}>
               <ArrowLeftIcon css={tw`stroke-current text-green-800`} />
            </SliderButton>
         )}
         <span
            css={tw`flex items-center justify-center text-base text-center md:text-lg text-indigo-800`}
         >
            Showing menu of:&nbsp;
            {formatDate(
               moment(state?.week?.fulfillmentDate)
                  .subtract(7, 'days')
                  .format('YYYY-MM-DD'),
               {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
               }
            )}
            &nbsp;-&nbsp;
            {formatDate(state?.week?.fulfillmentDate, {
               month: 'short',
               day: 'numeric',
               year: 'numeric',
            })}
         </span>
         {!isFixed && (
            <SliderButton onClick={() => next()}>
               <ArrowRightIcon css={tw`stroke-current text-green-800`} />
            </SliderButton>
         )}
      </Occurence>
   )
}

const Occurence = styled.div(
   ({ isFixed }) => css`
      height: 64px;
      display: grid;
      margin: auto;
      max-width: 980px;
      width: 100%;
      grid-template-columns: ${isFixed ? '1fr' : '64px 1fr 64px'};
      @media (max-width: 567px) {
         grid-template-columns: ${isFixed ? '1fr' : '48px 1fr 48px'};
         position: fixed;
         background-color: #fff;
         z-index: 20;
         top: 64px;
      }
   `
)

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
