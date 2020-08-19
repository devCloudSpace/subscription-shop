import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { useUser } from '../context'
import { isClient, getInitials } from '../utils'

export const Header = () => {
   const { user } = useUser()
   const [keycloak, initialized] = useKeycloak()
   return (
      <Wrapper>
         <Brand to="/subscription">Subscription Shop</Brand>
         <section tw="flex items-center justify-between">
            <ul />
            <ul tw="px-4 flex space-x-4">
               {keycloak.authenticated && (
                  <li tw="text-gray-800">
                     <Link to="/subscription/menu">Select Menu</Link>
                  </li>
               )}
               {!keycloak.authenticated && (
                  <li tw="text-gray-800">
                     <Link to="/subscription/get-started/select-plan">
                        Our Plans
                     </Link>
                  </li>
               )}
            </ul>
         </section>
         {initialized && (
            <section tw="px-4 ml-auto">
               {keycloak.authenticated ? (
                  <>
                     {user?.platform_customer?.firstName && (
                        <Link
                           to="/subscription/account/profile/"
                           tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                        >
                           {getInitials(
                              `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                           )}
                        </Link>
                     )}
                     <button
                        css={tw`bg-red-600 text-white rounded px-2 py-1`}
                        onClick={() =>
                           keycloak.logout({
                              redirectUri: isClient
                                 ? `${window.location.origin}/subscription`
                                 : '',
                           })
                        }
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <Link
                     to="/subscription/login"
                     css={tw`bg-blue-600 text-white rounded px-2 py-1`}
                  >
                     Log In
                  </Link>
               )}
            </section>
         )}
      </Wrapper>
   )
}

const Wrapper = styled.header`
   height: 64px;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`w-full grid top-0 bg-white fixed border-b items-center`}
`

const Brand = styled(Link)`
   ${tw`w-auto h-full px-6 flex items-center border-r`}
`
