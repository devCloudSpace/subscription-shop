import React from 'react'
import { styled } from 'twin.macro'
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
         <Footer tw="bg-gray-200">Footer</Footer>
      </UserProvider>
   )
}

const Footer = styled.footer`
   height: 180px;
`
