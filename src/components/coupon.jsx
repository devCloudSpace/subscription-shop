import { useMutation, useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { styled } from 'twin.macro'
import { useUser } from '../context'
import { CART_REWARDS, MUTATIONS } from '../graphql'
import { useMenu } from '../sections/select-menu'
import { CouponsList } from './coupons_list'
import { Tunnel } from './tunnel'

export const Coupon = () => {
   const { state } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { id } = state?.occurenceCustomer?.cart

   const { data, error } = useSubscription(CART_REWARDS, {
      variables: {
         cartId: id,
         params: {
            cartId: id,
            keycloakId: user?.keycloakId,
         },
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         if (data.cartRewards.length) {
            const isCouponValid = data.cartRewards.every(
               record => record.reward.condition.isValid
            )
            if (isCouponValid) {
               console.log('Coupon is valid!')
            } else {
               console.log('Coupon is not valid anymore!')
               addToast('Coupon is not valid!', { appearance: 'error' })
               deleteCartRewards()
            }
         }
      },
   })
   console.log('🚀 Coupon ~ error', error)

   const [isCouponListOpen, setIsCouponListOpen] = React.useState(false)

   const [deleteCartRewards] = useMutation(MUTATIONS.CART_REWARDS.DELETE, {
      variables: {
         cartId: id,
      },
      onError: err => console.log(err),
   })

   return (
      <Styles.Wrapper>
         {data?.cartRewards?.length ? (
            <Styles.CouponWrapper>
               <Styles.CouponDetails>
                  <Styles.CouponCode>
                     {data.cartRewards[0].reward.coupon.code}
                  </Styles.CouponCode>
                  <Styles.Comment>Coupon applied!</Styles.Comment>
               </Styles.CouponDetails>
               <Styles.Cross onClick={deleteCartRewards}>&times;</Styles.Cross>
            </Styles.CouponWrapper>
         ) : (
            <Styles.Button onClick={() => setIsCouponListOpen(true)}>
               Apply Coupon
            </Styles.Button>
         )}
         <Tunnel
            isOpen={isCouponListOpen}
            toggleTunnel={setIsCouponListOpen}
            style={{ zIndex: 1030 }}
         >
            <CouponsList closeTunnel={() => setIsCouponListOpen(false)} />
         </Tunnel>
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      ${tw`m-2`}
      border: 1px dashed teal;
      padding: 8px;
      border-radius: 2px;
   `,
   Button: styled.button`
      color: teal;
      padding: 4px;
      text-transform: uppercase;
      text-align: center;
      width: 100%;
   `,
   Cross: styled.span`
      font-size: 18px;
      cursor: pointer;
   `,
   CouponWrapper: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   CouponDetails: styled.div``,
   CouponCode: styled.h4`
      font-weight: 700;
      text-transform: uppercase;
      padding-bottom: 0;
   `,
   Comment: styled.small`
      color: gray;
   `,
}
