import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { isClient } from '../utils'

export const Header = () => {
   const [keycloak, initialized] = useKeycloak()
   return (
      <Wrapper>
         <Brand to="/">Subscription Shop</Brand>
         {initialized && (
            <section tw="px-4 ml-auto">
               {keycloak.authenticated ? (
                  <button
                     css={tw`bg-red-600 text-white rounded px-2 py-1`}
                     onClick={() =>
                        keycloak.logout({
                           redirectUri: isClient ? window.location.origin : '',
                        })
                     }
                  >
                     Logout
                  </button>
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
