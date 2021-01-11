import React from 'react'
import { groupBy, has, isEmpty } from 'lodash'
import { useSubscription } from '@apollo/react-hooks'

import { isClient } from '../utils'
import { PageLoader } from '../components'
import { SETTINGS } from '../graphql/queries'

const ConfigContext = React.createContext()

const initialState = {
   brand: {
      id: null,
   },
   settings: {},
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_BRANDID':
         return { ...state, brand: payload }
      case 'SET_SETTINGS':
         return { ...state, settings: payload }
      default:
         return state
   }
}

export const ConfigProvider = ({ children }) => {
   const [isLoading, setIsLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const { loading, data: { settings = [] } = {} } = useSubscription(SETTINGS, {
      variables: {
         domain: {
            _eq: isClient ? window.location.hostname : null,
         },
      },
   })

   const transform = React.useCallback(
      ({ value, meta }) => ({
         value,
         type: meta.type,
         identifier: meta.identifier,
      }),
      []
   )

   React.useEffect(() => {
      if (!loading && !isEmpty(settings)) {
         dispatch({ type: 'SET_BRANDID', payload: { id: settings[0].brandId } })
         dispatch({
            type: 'SET_SETTINGS',
            payload: groupBy(settings.map(transform), 'type'),
         })
      }
      setIsLoading(false)
   }, [loading, settings, transform])

   if (isLoading) return <PageLoader />
   return (
      <ConfigContext.Provider value={{ state, dispatch }}>
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = (globalType = '') => {
   const { state } = React.useContext(ConfigContext)

   const hasConfig = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return false
         if (identifier && type && has(state.settings, type)) {
            const index = state.settings[type].findIndex(
               node => node.identifier === identifier
            )
            if (index === -1) return false
            if (isEmpty(state.settings[type][index].value)) return false
            return true
         }
         return false
      },
      [state, globalType]
   )

   const configOf = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return {}
         if (identifier && type && has(state.settings, type)) {
            return (
               state.settings[type].find(node => node.identifier === identifier)
                  ?.value || {}
            )
         }
         return {}
      },
      [state, globalType]
   )

   return { brand: state.brand, configOf, hasConfig }
}
