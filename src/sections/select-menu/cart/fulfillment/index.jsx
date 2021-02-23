import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import tw, { css, styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { useMenu } from '../../state'
import { useUser } from '../../../../context'
import { Loader } from '../../../../components'
import { CheckIcon } from '../../../../assets/icons'
import {
   ZIPCODE,
   UPDATE_CART,
   CREATE_CART,
   UPDATE_OCCURENCE_CUSTOMER,
   INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS,
} from '../../../../graphql'
import { formatCurrency, normalizeAddress } from '../../../../utils'

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const Fulfillment = () => {
   const { state } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const [createOccurenceCustomer] = useMutation(
      INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS,
      {
         onError: error => console.log(error),
      }
   )
   const [updateOccurenceCustomer] = useMutation(UPDATE_OCCURENCE_CUSTOMER, {
      onError: error => console.log(error),
   })
   const [createCart] = useMutation(CREATE_CART, {
      onCompleted: ({ createCart: { id = '' } = {} }) => {
         updateOccurenceCustomer({
            variables: {
               pk_columns: {
                  keycloakId: user.keycloakId,
                  brand_customerId: user.brandCustomerId,
                  subscriptionOccurenceId: state.week.id,
               },
               _set: { isSkipped: false, orderCartId: id },
            },
         })
      },
      onError: error => console.log(error),
   })
   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: ({ updateCart: { id = '' } = {} }) => {
         updateOccurenceCustomer({
            variables: {
               pk_columns: {
                  keycloakId: user.keycloakId,
                  brand_customerId: user.brandCustomerId,
                  subscriptionOccurenceId: state.week.id,
               },
               _set: { isSkipped: false, orderCartId: id },
            },
         })
      },
      onError: error => console.log(error),
   })
   const { loading, data: { zipcode = {} } = {} } = useSubscription(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })

   const setFulfillment = mode => {
      let fulfillmentInfo = {}
      const fulfillmentDate = state.week.fulfillmentDate

      if (mode === 'DELIVERY') {
         const { from = '', to = '' } = zipcode?.deliveryTime
         fulfillmentInfo = {
            type: 'PREORDER_DELIVERY',
            slot: {
               from: evalTime(fulfillmentDate, from),
               to: evalTime(fulfillmentDate, to),
            },
         }
      } else if (mode === 'PICKUP') {
         const { from = '', to = '' } = zipcode?.pickupOption?.time
         fulfillmentInfo = {
            type: 'PREORDER_PICKUP',
            slot: {
               from: evalTime(fulfillmentDate, from),
               to: evalTime(fulfillmentDate, to),
            },
            address: zipcode?.pickupOption?.address,
         }
      }

      if (isEmpty(fulfillmentInfo)) {
         return addToast('Fulfillment mode is not available!', {
            appearance: 'error',
         })
      }
      if (state.occurenceCustomer?.validStatus?.hasCart) {
         updateCart({
            variables: {
               id: state.occurenceCustomer?.cart?.id,
               _set: { fulfillmentInfo },
            },
         }).then(() =>
            addToast('Your fulfillment preference has been saved', {
               appearance: 'success',
            })
         )
      } else {
         const customerInfo = {
            customerEmail: user?.platform_customer?.email || '',
            customerPhone: user?.platform_customer?.phoneNumber || '',
            customerLastName: user?.platform_customer?.lastName || '',
            customerFirstName: user?.platform_customer?.firstName || '',
         }

         createCart({
            variables: {
               object: {
                  customerInfo,
                  fulfillmentInfo,
                  customerId: user.id,
                  cartSource: 'subscription',
                  address: user.defaultAddress,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
               },
            },
         }).then(() =>
            addToast('Your fulfillment preference has been saved', {
               appearance: 'success',
            })
         )
      }
   }
   return (
      <div>
         <section tw="mt-3">
            <h4 tw="text-lg text-gray-700 border-b mb-2">Fulfillment Mode</h4>
            {loading ? (
               <Loader inline />
            ) : (
               <section tw="space-y-2">
                  {zipcode.isDeliveryActive && (
                     <Option
                        onClick={() => setFulfillment('DELIVERY')}
                        isActive={
                           state.occurenceCustomer?.validStatus?.hasCart
                              ? state.occurenceCustomer?.cart?.fulfillmentInfo?.type.includes(
                                   'DELIVERY'
                                )
                              : state.fulfillment.type.includes('DELIVERY')
                        }
                     >
                        <aside>
                           <CheckIcon
                              size={18}
                              tw="stroke-2 stroke-current text-gray-400"
                           />
                        </aside>
                        <main>
                           {zipcode.deliveryPrice === 0 ? (
                              <h3>Free Delivery</h3>
                           ) : (
                              <h3>
                                 Delivery at{' '}
                                 {formatCurrency(zipcode.deliveryPrice)}
                              </h3>
                           )}
                           <p tw="text-gray-500 text-sm">
                              Your box will be delivered on{' '}
                              <span>
                                 {moment(state?.week?.fulfillmentDate).format(
                                    'MMM D'
                                 )}
                                 &nbsp;between {zipcode?.deliveryTime?.from}
                                 &nbsp;-&nbsp;
                                 {zipcode?.deliveryTime?.to}
                              </span>{' '}
                              at{' '}
                              <span>
                                 {normalizeAddress(
                                    state?.occurenceCustomer?.cart?.address
                                 )}
                              </span>
                           </p>
                        </main>
                     </Option>
                  )}
                  {zipcode.isPickupActive && zipcode?.pickupOptionId && (
                     <Option
                        onClick={() => setFulfillment('PICKUP')}
                        isActive={
                           state.occurenceCustomer?.validStatus?.hasCart
                              ? state.occurenceCustomer?.cart?.fulfillmentInfo?.type.includes(
                                   'PICKUP'
                                )
                              : state.fulfillment.type.includes('PICKUP')
                        }
                     >
                        <aside>
                           <CheckIcon
                              size={18}
                              tw="stroke-2 stroke-current text-gray-400"
                           />
                        </aside>
                        <main>
                           <h3>Pick Up</h3>
                           <p tw="text-gray-500 text-sm">
                              Pickup your box in between{' '}
                              {moment(state?.week?.fulfillmentDate).format(
                                 'MMM D'
                              )}
                              , {zipcode?.pickupOption?.time?.from} -{' '}
                              {zipcode?.pickupOption?.time?.to} from{' '}
                              {normalizeAddress(zipcode?.pickupOption?.address)}
                           </p>
                        </main>
                     </Option>
                  )}
               </section>
            )}
         </section>
      </div>
   )
}

export default Fulfillment

const Option = styled.section`
   ${tw`py-2 pr-2 rounded cursor-pointer flex items-center border text-gray-700`}
   aside {
      ${tw`flex-shrink-0 h-10 w-10 flex items-center justify-center`}
      ${({ isActive }) =>
         isActive &&
         css`
            svg {
               ${tw`text-green-700`}
            }
         `}
   }
   ${({ isActive }) =>
      isActive &&
      css`
         ${tw`border-2 border-green-600`}
      `}
`
