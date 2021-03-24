import { useSubscription } from '@apollo/react-hooks'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { COUPONS } from '../graphql'
import { useMenu } from '../sections/select-menu'
import { useUser } from '../context'
import { Loader } from './loader'

export const CouponsList = () => {
   const { state } = useMenu()
   const { user } = useUser()
   // const { id } = state?.occurenceCustomer?.cart
   // console.log(id)

   const [availableCoupons, setAvailableCoupons] = React.useState([])

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: 96,
            keycloakId: user?.keycloakId,
         },
         brandId: 1,
      },
      onSubscriptionData: data => {
         console.log(data)
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(coupon => coupon.visibilityCondition?.isValid),
         ])
      },
   })
   console.log('🚀 ~ CouponsList ~ error', error)

   const handleApplyCoupon = coupon => {
      console.log(coupon)
   }

   if (loading) return <Loader />
   return (
      <Styles.Wrapper>
         <Styles.ListHeader>
            <Styles.Heading>Available Coupons</Styles.Heading>
         </Styles.ListHeader>
         {availableCoupons.map(coupon => (
            <Styles.Coupon key={coupon.id}>
               <Styles.CouponTop>
                  <Styles.Code>{coupon.code} </Styles.Code>
                  <Styles.Button
                     onClick={() => handleApplyCoupon(coupon)}
                     disabled={
                        !coupon.rewards.every(
                           reward => reward.condition?.isValid
                        )
                     }
                  >
                     Apply
                  </Styles.Button>
               </Styles.CouponTop>
               <Styles.CouponBottom>
                  <Styles.Title>{coupon.metaDetails.title}</Styles.Title>
                  <Styles.Description>
                     {coupon.metaDetails.description}
                  </Styles.Description>
               </Styles.CouponBottom>
            </Styles.Coupon>
         ))}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      padding: 16px;
   `,
   ListHeader: styled.div`
      margin-bottom: 16px;
   `,
   Heading: styled.h3`
      color: gray;
   `,
   Coupon: styled.div`
      padding: 8px;
      border: 1px dashed #cacaca;
      margin-bottom: 16px;
      border-radius: 4px;
   `,
   CouponTop: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
   `,
   Code: styled.h3`
      text-transform: uppercase;
      font-weight: 500;
   `,
   Button: styled.button`
      color: teal;

      &:disabled {
         color: gray;
      }
   `,
   CouponBottom: styled.div``,
   Title: styled.p``,
   Description: styled.p``,
}
