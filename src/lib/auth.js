import React from 'react'
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
   realm: process.env.GATSBY_KEYCLOAK_REALM,
   url: process.env.GATSBY_KEYCLOAK_URL,
   clientId: process.env.GATSBY_CLIENTID,
   'ssl-required': 'none',
   'public-client': true,
   'bearer-only': false,
   'verify-token-audience': true,
   'use-resource-role-mappings': true,
   'confidential-port': 0,
})

const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
   const [isAuthenticated, setIsAuthenticated] = React.useState(false)
   const [user, setUser] = React.useState({})
   const [isInitialized, setIsInitialized] = React.useState(false)

   const initialize = async () => {
      const authenticated = await keycloak.init({
         onLoad: 'check-sso',
         promiseType: 'native',
      })
      setIsInitialized(true)
      if (authenticated) {
         setIsAuthenticated(authenticated)
         const profile = await keycloak.loadUserInfo()
         setUser(profile)
      }
   }

   React.useEffect(() => {
      initialize()
   }, [])

   const login = () => keycloak.login()
   const logout = () => keycloak.logout()

   if (!isInitialized) return <div>Loading...</div>
   return (
      <AuthContext.Provider
         value={{
            user,
            login,
            logout,
            keycloak,
            isInitialized,
            isAuthenticated,
         }}
      >
         {children}
      </AuthContext.Provider>
   )
}

export const useAuth = () => React.useContext(AuthContext)
