import React from 'react'

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   occurences: [],
   recipe: {},
   isTunnelOpen: false,
   cart: {
      total: 0,
      products: [],
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK':
         return {
            ...state,
            week: payload,
         }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      case 'TOGGLE_TUNNEL':
         return {
            ...state,
            recipe: payload.recipe,
            isTunnelOpen: payload.tunnel,
         }
      case 'SELECT_RECIPE': {
         const products = state.cart.products
         const index = products.findIndex(
            node => Object.keys(node).length === 0
         )
         products[index] = payload
         return {
            ...state,
            cart: {
               ...state.cart,
               products,
            },
         }
      }
      case 'REMOVE_RECIPE': {
         const products = state.cart.products
         const index = products.findIndex(node => node?.option?.id === payload)
         products[index] = {}
         return {
            ...state,
            cart: {
               ...state.cart,
               products,
            },
         }
      }
      case 'PREFILL_CART':
         return {
            ...state,
            cart: {
               ...state.cart,
               products: payload,
            },
         }
      default:
         return 'No such type!'
   }
}

export const MenuProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   return (
      <MenuContext.Provider value={{ state, dispatch }}>
         {children}
      </MenuContext.Provider>
   )
}

export const useMenu = () => React.useContext(MenuContext)
