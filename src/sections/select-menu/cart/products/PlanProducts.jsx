import React from 'react'
import tw, { css, styled } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from '../../state'
import { CartProducts } from '../styled'
import { useUser } from '../../../../context'
import { MUTATIONS } from '../../../../graphql'
import { ProductSkeleton, CartProduct } from '../../../../components'

const PlanProducts = ({ noSkip }) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, methods } = useMenu()

   const [upsertOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPSERT,
      {
         onCompleted: ({ upsertOccurenceCustomerCart = {} }) => {
            if (upsertOccurenceCustomerCart.isSkipped) {
               return addToast('Skipped this week', { appearance: 'warning' })
            }
            addToast('This week is now available for menu selection', {
               appearance: 'success',
            })
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const skipWeek = () => {
      upsertOccurenceCustomer({
         variables: {
            object: {
               keycloakId: user.keycloakId,
               brand_customerId: user.brandCustomerId,
               subscriptionOccurenceId: state.week.id,
               isSkipped: Boolean(!state.occurenceCustomer?.isSkipped),
            },
         },
      })
   }

   const isSkippable =
      ['PENDING', undefined].includes(state?.occurenceCustomer?.cart?.status) &&
      state?.week?.isValid &&
      !noSkip

   const isRemovable =
      ['PENDING', undefined].includes(state?.occurenceCustomer?.cart?.status) &&
      state?.week?.isValid

   return (
      <div>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">
               Your Box{' '}
               {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>
            {isSkippable && (
               <SkipWeek>
                  <label htmlFor="skip" tw="mr-2 text-gray-600">
                     Skip
                  </label>
                  <input
                     name="skip"
                     type="checkbox"
                     className="toggle"
                     onChange={skipWeek}
                     checked={state?.occurenceCustomer?.isSkipped}
                     tw="cursor-pointer appearance-none"
                  />
               </SkipWeek>
            )}
         </header>
         <CartProducts>
            {state?.occurenceCustomer?.cart?.cartInfo?.products?.map(
               product =>
                  !product.isAddOn && (
                     <CartProduct
                        product={product}
                        key={product.cartItemId}
                        isRemovable={isRemovable}
                        onDelete={methods.products.delete}
                     />
                  )
            )}
            {Array.from(
               {
                  length:
                     state?.occurenceCustomer?.validStatus
                        ?.pendingProductsCount,
               },
               (_, index) => (
                  <ProductSkeleton key={index} />
               )
            )}
         </CartProducts>
      </div>
   )
}

export default PlanProducts

const SkipWeek = styled.span(
   () => css`
      ${tw`flex items-center`}

      .toggle {
         height: 18px;
         transition: all 0.2s ease;
         ${tw`relative w-8 inline-block rounded-full border border-gray-400`}
      }
      .toggle:after {
         content: '';
         top: 1px;
         left: 1px;
         width: 14px;
         height: 14px;
         transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
         ${tw`absolute bg-green-500 rounded-full`}
      }
      .toggle:checked {
         ${tw`border-green-500 bg-green-500`}
      }
      .toggle:checked:after {
         transform: translatex(14px);
         ${tw`bg-white`}
      }
   `
)
