import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { isClient, getInitials } from '../utils'
import { useUser } from '../context'

export const Header = () => {
   const [keycloak, initialized] = useKeycloak()
   const { user } = useUser()
   return (
      <Wrapper>
         <Brand to="/">Subscription Shop</Brand>
         {initialized && (
            <section tw="px-4 ml-auto">
               {keycloak.authenticated ? (
                  <>
                     {user.firstName && (
                        <Link
                           to="/account/profile"
                           tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                        >
                           {getInitials(`${user.firstName} ${user.lastName}`)}
                        </Link>
                     )}
                     <button
                        css={tw`bg-red-600 text-white rounded px-2 py-1`}
                        onClick={() =>
                           keycloak.logout({
                              redirectUri: isClient
                                 ? window.location.origin
                                 : '',
                           })
                        }
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <button css={tw`bg-blue-600 text-white rounded px-2 py-1`}>
                     Log In
                  </button>
               )}
            </section>
         )}
      </Wrapper>
   )
}

const Wrapper = styled.header`
   height: 64px;
   ${tw`border-b flex items-center`}
`

const Brand = styled(Link)`
   ${tw`w-auto h-full px-6 flex items-center border-r`}
`
