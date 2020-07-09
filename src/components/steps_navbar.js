import React from 'react'
import { useLocation } from '@reach/router'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { isClient } from '../utils'

export const StepsNavbar = () => {
   const [keycloak, initialized] = useKeycloak()
   const location = useLocation()
   const [currentStep] = React.useState(() => {
      if (location.pathname.includes('/get-started/select-plan')) return 0
      if (location.pathname.includes('/get-started/register')) return 25
      if (location.pathname.includes('/get-started/select-delivery')) return 50
      if (location.pathname.includes('/get-started/select-menu')) return 75
      if (location.pathname.includes('/get-started/checkout')) return 100
   })

   return (
      <Navbar>
         <section>Logo</section>
         <Progress>
            <ProgressBar current={currentStep} />
            <Steps>
               <Step>Select Plan</Step>
               <Step>Register</Step>
               <Step>Select Delivery</Step>
               <Step>Select Menu</Step>
               <Step>Checkout</Step>
            </Steps>
         </Progress>
         {initialized && (
            <>
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
            </>
         )}
      </Navbar>
   )
}

const Navbar = styled.div`
   height: 64px;
   ${tw`px-8 flex justify-around items-center border-b`}
`

const Progress = styled.section`
   ${tw`flex flex-col justify-center`}
`

const Steps = styled.ul`
   ${tw`grid grid-cols-5`}
`

const Step = styled.li`
   width: 160px;
   ${tw`text-sm text-center text-gray-600`}
`

const ProgressBar = styled.span(
   ({ current }) => css`
      margin: 8px auto;
      width: calc(100% - 160px);
      ${tw`bg-gray-200 h-2 rounded relative`}
      :before {
         top: 0;
         left: 0;
         content: '';
         height: inherit;
         position: absolute;
         width: ${current}%;
         ${tw`bg-green-600 rounded`}
      }
      :after {
         top: -4px;
         content: '';
         width: 16px;
         height: 16px;
         position: absolute;
         left: calc(${current}% - 8px);
         ${tw`bg-green-600 rounded-full`}
      }
   `
)
