import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { MUTATIONS } from '../graphql'
import { CouponsList } from './coupons_list'
import { Tunnel } from './tunnel'

export const Coupon = () => {
   const data = {
      cartRewards: [
         // {
         //    reward: {
         //       coupon: {
         //          code: 'TESt',
         //       },
         //    },
         // },
      ],
   }

   const [isCouponListOpen, setIsCouponListOpen] = React.useState(false)

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => console.log('Wallet amount added!'),
      onError: error => console.log(error),
   })

   const deleteCartRewards = () => {}

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
               <Styles.Cross onClick={() => deleteCartRewards()}>
                  &times;
               </Styles.Cross>
            </Styles.CouponWrapper>
         ) : (
            <Styles.Button onClick={() => setIsCouponListOpen(true)}>
               Apply Coupon
            </Styles.Button>
         )}
         <Tunnel isOpen={isCouponListOpen} toggleTunnel={setIsCouponListOpen}>
            <CouponsList />
         </Tunnel>
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      ${tw`m-1`}
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
