import React from 'react'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

export const StepsNavbar = () => {
   const [keycloak] = useKeycloak()
   return (
      <Navbar>
         <li>Step 1</li>
         <li>Step 2</li>
         <li>Step 3</li>
         <li>Step 4</li>
         <button
            onClick={() =>
               keycloak?.logout({
                  redirectUri:
                     window !== undefined ? window.location.origin : '',
               })
            }
         >
            Logout
         </button>
      </Navbar>
   )
}

const Navbar = styled.ul`
   height: 64px;
   ${tw`flex border-b`}
`
