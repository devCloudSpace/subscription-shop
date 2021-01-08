import React from 'react'
import moment from 'moment'
import { useLocation } from '@reach/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useUser } from '../../context'
import { Loader } from '../../components'
import { formatDate } from '../../utils'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { CART_BY_WEEK, OCCURENCES_BY_SUBSCRIPTION } from '../../graphql'

export const WeekPicker = ({ isFixed }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const [current, setCurrent] = React.useState(0)
   const [fetchCart, { data: { cart } = {} }] = useLazyQuery(CART_BY_WEEK, {
      onCompleted: ({ cart }) => {
         let products = Array.from(
            { length: user.subscription.recipes.count },
            () => ({})
         )

         const isSelectionEmpty = state.weeks[
            state.week.id
         ].cart.products.every(node => Object.keys(node).length === 0)

         if (cart && isSelectionEmpty) {
            return dispatch({
               type: 'PREFILL_CART',
               payload: {
                  cartExists: true,
                  weekId: state.week.id,
                  isSkipped: cart.isSkipped,
                  orderCartId: cart.orderCartId,
                  orderCartStatus: cart?.orderCart?.status,
                  products: cart?.orderCart?.cartInfo?.products || products,
               },
            })
         }

         const week = state?.weeks[state?.week?.id]
         dispatch({
            type: 'PREFILL_CART',
            payload: {
               weekId: state.week.id,
               cartExists: week.cartExists || false,
               isSkipped: week.isSkipped || false,
               orderCartId: week.orderCartId || null,
               orderCartStatus: week.orderCartStatus || undefined,
               products: isSelectionEmpty ? products : week.cart.products,
            },
         })
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (cart?.orderCartId) {
         dispatch({
            type: 'SET_ORDER_CART_ID',
            payload: {
               weekId: state.week.id,
               orderCartId: cart.orderCartId,
            },
         })
      }
   }, [cart, state.week, dispatch])

   const { loading } = useQuery(OCCURENCES_BY_SUBSCRIPTION, {
      variables: {
         id: user.subscriptionId,
         where: {
            fulfillmentDate: {
               _eq: new URL(location.href).searchParams.get('date'),
            },
         },
      },
      onCompleted: ({ subscription = {} } = {}) => {
         if (subscription?.occurences?.length > 0) {
            const visibleOccurences = subscription.occurences.filter(
               occurence => occurence.isVisible
            )
            if (state.occurences.length === 0) {
               const validWeekIndex = visibleOccurences.findIndex(
                  node => node.isValid
               )
               if (validWeekIndex === -1) return
               setCurrent(validWeekIndex)
               dispatch({ type: 'SET_OCCURENCES', payload: visibleOccurences })
               dispatch({
                  type: 'SET_WEEK',
                  payload: visibleOccurences[validWeekIndex],
               })
               fetchCart({
                  variables: {
                     keycloakId: user?.keycloakId,
                     weekId: visibleOccurences[validWeekIndex].id,
                  },
               })
            }
         } else {
            addToast('No weeks are available for menu selection.', {
               appearance: 'error',
            })
         }
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const next = () => {
      const nextOne =
         (current + 1 + state.occurences.length) % state.occurences.length
      setCurrent(nextOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[nextOne] })
      fetchCart({
         variables: {
            keycloakId: user?.keycloakId,
            weekId: state.occurences[nextOne].id,
         },
      })
      addToast("Showing next week's menu.", {
         appearance: 'info',
      })
   }
   const previous = () => {
      const previousOne =
         (current - 1 + state.occurences.length) % state.occurences.length
      setCurrent(previousOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[previousOne] })
      fetchCart({
         variables: {
            keycloakId: user?.keycloakId,
            weekId: state.occurences[previousOne].id,
         },
      })
      addToast("Showing previous week's menu.", {
         appearance: 'info',
      })
   }

   if (loading) return <Loader inline />
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
