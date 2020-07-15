import React from 'react'

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   occurences: [],
   weeks: {},
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK': {
         const weeks = state.weeks
         if (!weeks.hasOwnProperty(payload.id)) {
            weeks[payload.id] = {
               recipe: {},
               isTunnelOpen: false,
               cart: {
                  total: 0,
                  products: [],
               },
            }
         }
         return {
            ...state,
            weeks,
            week: payload,
         }
      }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      case 'TOGGLE_TUNNEL': {
         const weeks = state.weeks
         weeks[payload.weekId] = {
            ...weeks[payload.weekId],
            recipe: payload.recipe,
            isTunnelOpen: payload.tunnel,
         }
         return {
            ...state,
            weeks,
         }
      }
      case 'SELECT_RECIPE': {
         const weeks = state.weeks
         const products = weeks[payload.weekId].cart.products
         const index = products.findIndex(
            node => Object.keys(node).length === 0
         )
         products[index] = payload.cart

         weeks[payload.weekId] = {
            ...weeks[payload.weekId],
            isSkipped: false,
            cart: {
               ...weeks[payload.weekId].cart,
               products,
            },
         }

         return {
            ...state,
            weeks,
         }
      }
      case 'REMOVE_RECIPE': {
         const weeks = state.weeks
         const products = weeks[payload.weekId].cart.products
         const index = products.findIndex(
            node => node?.option?.id === payload.productId
         )
         products[index] = {}

         weeks[payload.weekId] = {
            ...weeks[payload.weekId],
            cart: {
               ...weeks[payload.weekId].cart,
               products,
            },
         }

         return {
            ...state,
            weeks,
         }
      }
      case 'PREFILL_CART': {
         const weeks = state.weeks
         weeks[payload.weekId] = {
            ...weeks[payload.weekId],
            isSkipped: payload.isSkipped,
            cart: {
               ...state.weeks[payload.weekId].cart,
               products: payload.products,
            },
         }
         return {
            ...state,
            weeks,
         }
      }
      case 'SKIP_WEEK': {
         const weeks = state.weeks
         weeks[payload.weekId] = {
            ...weeks[payload.weekId],
            isSkipped: payload.checked,
         }

         return {
            ...state,
            weeks,
         }
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
