import React from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useUser } from '../../context'
import { Loader } from '../../components'
import { formatDate } from '../../utils'
import { ArrowLeftIcon, ArrowRightIcon } from '../../assets/icons'
import { CART_BY_WEEK, CUSTOMER_OCCURENCES } from '../../graphql'

export const WeekPicker = () => {
   const { user } = useUser()
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
                  products: cart?.orderCart?.cartInfo?.products || products,
               },
            })
         }

         dispatch({
            type: 'PREFILL_CART',
            payload: {
               cartExists: false,
               isSkipped: false,
               orderCartId: null,
               weekId: state.week.id,
               products: isSelectionEmpty
                  ? products
                  : state.weeks[state.week.id].cart.products,
            },
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
   }, [cart])

   const { loading } = useQuery(CUSTOMER_OCCURENCES, {
      variables: {
         id: user.id,
         keycloakId: user.keycloakId,
      },
      onCompleted: ({ customer: { subscription } = {} }) => {
         if (subscription?.occurences) {
            const filtered = subscription.occurences.filter(
               occurence => occurence.isValid && occurence.isVisible
            )
            setCurrent(0)
            dispatch({ type: 'SET_OCCURENCES', payload: filtered })
            dispatch({ type: 'SET_WEEK', payload: filtered[0] })
            fetchCart({
               variables: {
                  keycloakId: user.keycloakId,
                  weekId: filtered[0].id,
               },
            })
         } else {
            navigate('/get-started/select-delivery')
         }
      },
   })

   const next = () => {
      const nextOne =
         (current + 1 + state.occurences.length) % state.occurences.length
      setCurrent(nextOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[nextOne] })
      fetchCart({
         variables: {
            keycloakId: user.keycloakId,
            weekId: state.occurences[nextOne].id,
         },
      })
   }
   const previous = () => {
      const previousOne =
         (current - 1 + state.occurences.length) % state.occurences.length
      setCurrent(previousOne)
      dispatch({ type: 'SET_WEEK', payload: state.occurences[previousOne] })
      fetchCart({
         variables: {
            keycloakId: user.keycloakId,
            weekId: state.occurences[previousOne].id,
         },
      })
   }

   if (loading) return <Loader inline />
   return (
      <Occurence>
         <SliderButton onClick={() => previous()}>
            <ArrowLeftIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
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
         <SliderButton onClick={() => next()}>
            <ArrowRightIcon css={tw`stroke-current text-green-800`} />
         </SliderButton>
      </Occurence>
   )
}

const Occurence = styled.div`
   height: 64px;
   display: grid;
   margin: auto;
   max-width: 980px;
   width: 100%;
   grid-template-columns: 64px 1fr 64px;
   @media (max-width: 567px) {
      grid-template-columns: 48px 1fr 48px;
   }
`

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
