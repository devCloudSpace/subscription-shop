import React from 'react'

const initialState = {
   address: {
      selected: {},
      error: '',
      tunnel: false,
   },
   delivery: {
      selected: {},
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            address: {
               ...state.address,
               tunnel: payload,
            },
         }
      case 'SET_ADDRESS_ERROR':
         return {
            ...state,
            address: {
               ...state.address,
               error: payload,
            },
         }
      case 'SET_ADDRESS':
         return {
            ...state,
            address: {
               ...state.address,
               selected: payload,
            },
         }
      case 'SET_DAY':
         return {
            ...state,
            delivery: {
               selected: payload,
            },
         }
      default:
         return state
   }
}

const DeliveryContext = React.createContext()

export const DeliveryProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <DeliveryContext.Provider value={{ state, dispatch }}>
         {children}
      </DeliveryContext.Provider>
   )
}

export const useDelivery = () => React.useContext(DeliveryContext)
