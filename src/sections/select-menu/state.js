import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useLocation } from '@reach/router'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'

import { useUser } from '../../context'
import { isClient } from '../../utils'
import { Loader } from '../../components'
import {
   ZIPCODE,
   MUTATIONS,
   CART_BY_WEEK,
   INSERT_CART_ITEM,
   DELETE_CART_ITEM,
   OCCURENCES_BY_SUBSCRIPTION,
} from '../../graphql'

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   isOccurencesLoading: true,
   occurences: [],
   isCartFull: false,
   cartState: 'IDLE',
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
      case 'IS_CART_FULL':
         return { ...state, isCartFull: payload }
      case 'CART_STATE':
         return {
            ...state,
            cartState: payload,
         }
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

const insertCartId = (node, cartId) => {
   if (node.childs.data.length > 0) {
      node.childs.data = node.childs.data.map(item => {
         if (item.childs.data.length > 0) {
            item.childs.data = item.childs.data.map(item => ({
               ...item,
               cartId,
            }))
         }
         return { ...item, cartId }
      })
   }
   node.cartId = cartId

   return node
}

export const MenuProvider = ({ children }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const [cart, setCart] = React.useState({})
   const [fulfillment, setFulfillment] = React.useState({})
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      {
         onError: error =>
            console.log('updateOccurenceCustomer => error =>', error),
      }
   )
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onError: error => console.log('createCart => error =>', error),
   })
   const [insertCartItem] = useMutation(INSERT_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => console.log('insertCartItem => error =>', error),
   })
   const [deleteCartItem] = useMutation(DELETE_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => console.log('deleteCartItem => error =>', error),
   })
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
   const [insertOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.CREATE.ONE,
      {
         skip:
            state.isOccurencesLoading ||
            !state?.week?.id ||
            occurenceCustomerLoading,
         onError: error => console.log(error),
      }
   )
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
      skip: !state.week.id || !user.keycloakId || !user.brandCustomerId,
      variables: {
         weekId: state.week.id,
         keycloakId: user?.keycloakId,
         brand_customerId: user?.brandCustomerId,
      },
      onSubscriptionData: () => {
         dispatch({ type: 'IS_CART_FULL', payload: false })
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (
         !state.isOccurencesLoading &&
         state.week?.id &&
         !occurenceCustomerLoading
      ) {
         if (isEmpty(occurenceCustomer)) {
            insertOccurenceCustomer({
               variables: {
                  object: {
                     isAuto: false,
                     keycloakId: user.keycloakId,
                     isSkipped: !state.week.isValid,
                     subscriptionOccurenceId: state.week.id,
                     brand_customerId: user.brandCustomerId,
                  },
               },
            })
         } else {
            setCart(occurenceCustomer)
         }
      }
   }, [
      state.isOccurencesLoading,
      state.week,
      occurenceCustomerLoading,
      occurenceCustomer,
   ])

   const removeProduct = item => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })
      deleteCartItem({
         variables: { id: item.id },
      }).then(() =>
         addToast(`You've removed the product - ${item.name}.`, {
            appearance: 'info',
         })
      )
   }

   const addProduct = item => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })

      const isSkipped = occurenceCustomer?.isSkipped
      if (occurenceCustomer?.validStatus?.hasCart) {
         const cart = insertCartId(item, occurenceCustomer?.cart?.id)
         insertCartItem({
            variables: { object: cart },
         }).then(({ data: { createCartItem = {} } = {} }) => {
            const { products = [] } = createCartItem
            if (!isEmpty(products)) {
               const [product] = products
               addToast(`You've added the product - ${product.name}.`, {
                  appearance: 'info',
               })
            }

            updateOccurenceCustomer({
               variables: {
                  pk_columns: {
                     keycloakId: user.keycloakId,
                     subscriptionOccurenceId: state.week.id,
                     brand_customerId: user.brandCustomerId,
                  },
                  _set: {
                     isSkipped: false,
                     cartId: createCartItem?.cart?.id,
                  },
               },
            }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
               if (!item?.isAddOn) {
                  dispatch({
                     type: 'IS_CART_FULL',
                     payload:
                        updateOccurenceCustomer?.validStatus?.itemCountValid,
                  })
               }
               if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                  if (!updateOccurenceCustomer?.isSkipped) {
                     addToast('This week has been unskipped.', {
                        appearance: 'info',
                     })
                  }
               }
            })
         })
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
                  status: 'CART_PENDING',
                  customerId: user.id,
                  source: 'subscription',
                  paymentStatus: 'PENDING',
                  address: user.defaultAddress,
                  fulfillmentInfo: fulfillment,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
                  ...(user?.subscriptionPaymentMethodId && {
                     paymentMethodId: user?.subscriptionPaymentMethodId,
                  }),
                  stripeCustomerId: user?.platform_customer?.stripeCustomerId,
               },
            },
         }).then(({ data: { createCart = {} } = {} }) => {
            const cart = insertCartId(item, createCart?.id)
            insertCartItem({
               variables: { object: cart },
            }).then(({ data: { createCartItem = {} } = {} }) => {
               const { products = [] } = createCartItem
               if (!isEmpty(products)) {
                  const [product] = products
                  addToast(`You've added the product - ${product.name}.`, {
                     appearance: 'info',
                  })
               }
               updateOccurenceCustomer({
                  variables: {
                     pk_columns: {
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: state.week.id,
                        brand_customerId: user.brandCustomerId,
                     },
                     _set: {
                        isSkipped: false,
                        cartId: createCartItem?.cart?.id,
                     },
                  },
               }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
                  if (!item?.isAddOn) {
                     dispatch({
                        type: 'IS_CART_FULL',
                        payload:
                           updateOccurenceCustomer?.validStatus?.itemCountValid,
                     })
                  }
                  if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                     if (!updateOccurenceCustomer?.isSkipped) {
                        addToast('This week has been unskipped.', {
                           appearance: 'info',
                        })
                     }
                  }
               })
            })

            isClient && window.localStorage.setItem('cartId', createCart.id)

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
         })
      }
   }

   if (state.isOccurencesLoading && state.week.id) return <Loader inline />
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
