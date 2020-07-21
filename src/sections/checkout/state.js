import React from 'react'

const initialState = {
   tunnel: {
      isVisible: false,
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            tunnel: payload,
         }
      default:
         return state
   }
}

const PaymentContext = React.createContext()

export const PaymentProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <PaymentContext.Provider value={{ state, dispatch }}>
         {children}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => React.useContext(PaymentContext)