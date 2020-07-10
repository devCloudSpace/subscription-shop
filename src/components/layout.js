import React from 'react'
import { useKeycloak } from '@react-keycloak/web'

import { Header } from './header'
import { UserProvider } from '../context'

export const Layout = ({ children, noHeader }) => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (keycloak?.authenticated) {
         if (window.location !== window.parent.location) {
            window.parent.location.reload()
         }
      }
   }, [keycloak])

   return (
      <UserProvider>
         {!noHeader && <Header />}
         {children}
      </UserProvider>
   )
}
