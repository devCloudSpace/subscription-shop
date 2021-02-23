import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useLocation } from '@reach/router'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'

import { useUser } from '../../context'
import { isClient } from '../../utils'
import {
   ZIPCODE,
   MUTATIONS,
   CART_BY_WEEK,
   OCCURENCES_BY_SUBSCRIPTION,
} from '../../graphql'

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   isOccurencesLoading: true,
   currentWeekIndex: 0,
   occurences: [],
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK': {
         return {
            ...state,
            week: payload,
         }
      }
      case 'SET_IS_OCCURENCES_LOADING':
         return { ...state, isOccurencesLoading: payload }
      case 'SET_CURRENT_WEEK_INDEX':
         return { ...state, currentWeekIndex: payload }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      default:
         return 'No such type!'
   }
}

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

export const MenuProvider = ({ children }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const [cart, setCart] = React.useState({})
   const [fulfillment, setFulfillment] = React.useState({})
   const [state, dispatch] = React.useReducer(reducers, initialState)
   useSubscription(ZIPCODE, {
      skip: !user?.subscriptionId || !user?.defaultAddress?.zipcode,
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { zipcode = {} } = {} } = {},
      }) => {
         if (zipcode.isDeliveryActive) {
            setFulfillment({
               type: 'PREORDER_DELIVERY',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.to
                  ),
               },
            })
         } else if (zipcode.isPickupActive && zipcode.pickupOptionId) {
            setFulfillment({
               type: 'PREORDER_PICKUP',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.to
                  ),
               },
               address: zipcode?.pickupOption?.address,
            })
         }
      },
   })
   const [insertOccurenceCustomers] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.CREATE.MULTIPLE,
      {
         onError: error => console.log(error),
      }
   )
   const [upsertCart] = useMutation(MUTATIONS.CART.UPSERT, {
      refetchQueries: () => ['subscriptionOccurenceCustomer'],
      onCompleted: ({ upsertCart }) => {
         isClient && window.localStorage.setItem('cartId', upsertCart.id)

         const skipList = new URL(location.href).searchParams.get('previous')

         if (skipList && skipList.split(',').length > 0) {
            insertOccurenceCustomers({
               variables: {
                  objects: skipList.split(',').map(id => ({
                     isSkipped: true,
                     keycloakId: user.keycloakId,
                     subscriptionOccurenceId: id,
                     brand_customerId: user.brandCustomerId,
                  })),
               },
            })
         }
         addToast('Selected menu has been saved.', {
            appearance: 'success',
         })
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   useQuery(OCCURENCES_BY_SUBSCRIPTION, {
      skip: !user?.subscriptionId,
      variables: {
         id: user?.subscriptionId,
         where: {
            subscriptionOccurenceView: {
               isValid: { _eq: true },
               isVisible: { _eq: true },
            },
            ...(Boolean(new URL(location.href).searchParams.get('date')) && {
               fulfillmentDate: {
                  _eq: new URL(location.href).searchParams.get('date'),
               },
            }),
         },
      },
      onCompleted: ({ subscription = {} } = {}) => {
         if (subscription?.occurences?.length > 0) {
            if (state.occurences.length === 0) {
               const validWeekIndex = subscription?.occurences.findIndex(
                  node => node.isValid
               )
               if (validWeekIndex === -1) return
               dispatch({
                  type: 'SET_CURRENT_WEEK_INDEX',
                  payload: validWeekIndex,
               })
               dispatch({ type: 'SET_IS_OCCURENCES_LOADING', payload: false })
               dispatch({
                  type: 'SET_OCCURENCES',
                  payload: subscription?.occurences,
               })
               dispatch({
                  type: 'SET_WEEK',
                  payload: subscription?.occurences[validWeekIndex],
               })
            }
         } else if (
            subscription?.occurences?.length === 0 &&
            user?.subscriptionId
         ) {
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
   const {
      loading: occurenceCustomerLoading,
      data: { subscriptionOccurenceCustomer: occurenceCustomer = {} } = {},
   } = useSubscription(CART_BY_WEEK, {
      variables: {
         weekId: state.week.id,
         keycloakId: user?.keycloakId,
         brand_customerId: user?.brandCustomerId,
      },
      onCompleted: () => {},
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (state.week?.id && !occurenceCustomerLoading) {
         if (isEmpty(occurenceCustomer)) {
            insertOccurenceCustomers({
               variables: {
                  objects: [
                     {
                        isAuto: false,
                        keycloakId: user.keycloakId,
                        isSkipped: !state.week.isValid,
                        subscriptionOccurenceId: state.week.id,
                        brand_customerId: user.brandCustomerId,
                     },
                  ],
               },
            })
         } else {
            setCart(occurenceCustomer)
         }
      }
   }, [state.week, occurenceCustomerLoading, occurenceCustomer])

   const removeProduct = item => {
      const products = occurenceCustomer?.cart?.cartInfo?.products.filter(
         node => node.cartItemId !== item.cartItemId
      )
      upsertCart({
         variables: {
            object: {
               id: occurenceCustomer?.cart?.id,
               cartInfo: { products },
            },
            on_conflict: {
               constraint: 'orderCart_pkey',
               update_columns: ['cartInfo'],
            },
         },
      }).then(() =>
         addToast(`You've removed the product - ${item.name}.`, {
            appearance: 'info',
         })
      )
   }

   const addProduct = item => {
      const subscriptionOccurenceCustomers = {
         data: [
            {
               isSkipped: false,
               keycloakId: user.keycloakId,
               subscriptionOccurenceId: state.week.id,
               brand_customerId: user.brandCustomerId,
            },
         ],
         on_conflict: {
            constraint: 'subscriptionOccurence_customer_pkey',
            update_columns: ['isSkipped', 'orderCartId'],
         },
      }
      if (occurenceCustomer?.validStatus?.hasCart) {
         upsertCart({
            variables: {
               object: {
                  id: occurenceCustomer?.cart?.id,
                  subscriptionOccurenceCustomers,
                  cartInfo: {
                     products: [
                        ...occurenceCustomer?.cart?.cartInfo?.products,
                        { ...item, cartItemId: uuidv4() },
                     ],
                  },
               },
               on_conflict: {
                  constraint: 'orderCart_pkey',
                  update_columns: ['cartInfo'],
               },
            },
         }).then(() =>
            addToast(`You've added the product - ${item.name}.`, {
               appearance: 'info',
            })
         )
      } else {
         const customerInfo = {
            customerEmail: user?.platform_customer?.email || '',
            customerPhone: user?.platform_customer?.phoneNumber || '',
            customerLastName: user?.platform_customer?.lastName || '',
            customerFirstName: user?.platform_customer?.firstName || '',
         }

         upsertCart({
            variables: {
               object: {
                  customerInfo,
                  status: 'PENDING',
                  customerId: user.id,
                  paymentStatus: 'PENDING',
                  cartSource: 'subscription',
                  fulfillmentInfo: fulfillment,
                  address: user.defaultAddress,
                  cartInfo: { products: [item] },
                  subscriptionOccurenceCustomers,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
                  ...(user?.subscriptionPaymentMethodId && {
                     paymentMethodId: user?.subscriptionPaymentMethodId,
                  }),
                  stripeCustomerId: user?.platform_customer?.stripeCustomerId,
                  ...(state?.occurenceCustomer?.cart?.id && {
                     id: state?.occurenceCustomer?.cart?.id,
                  }),
               },
               on_conflict: {
                  constraint: 'orderCart_pkey',
                  update_columns: [
                     'amount',
                     'address',
                     'cartInfo',
                     'fulfillmentInfo',
                  ],
               },
            },
         }).then(() =>
            addToast(`You've added the product - ${item.name}.`, {
               appearance: 'info',
            })
         )
      }
   }

   return (
      <MenuContext.Provider
         value={{
            state: { ...state, occurenceCustomer: cart, fulfillment },
            methods: {
               products: {
                  add: addProduct,
                  delete: removeProduct,
               },
            },
            dispatch,
         }}
      >
         {children}
      </MenuContext.Provider>
   )
}

export const useMenu = () => React.useContext(MenuContext)
