import React from 'react'
import { Link } from 'gatsby'
import { useLocation } from '@reach/router'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { useConfig } from '../lib'
import { isClient } from '../utils'

export const StepsNavbar = () => {
   const { hasConfig, configOf } = useConfig()
   const [keycloak, initialized] = useKeycloak()
   const [steps, setSteps] = React.useState({
      register: 'Register',
      selectDelivery: 'Select Delivery',
      selectMenu: 'Select Menu',
      checkout: 'Checkout',
   })

   React.useEffect(() => {
      if (hasConfig('steps-labels', 'conventions')) {
         setSteps(configOf('steps-labels', 'conventions'))
      }
   }, [hasConfig, configOf, setSteps])

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
         <Brand to="/subscription">Subscription Shop</Brand>
         <Progress>
            <ProgressBar current={currentStep} />
            <Steps>
               <Step>Select Plan</Step>
               <Step>{steps.register}</Step>
               <Step>{steps.selectDelivery}</Step>
               <Step>{steps.selectMenu}</Step>
               <Step>{steps.checkout}</Step>
            </Steps>
         </Progress>
         {initialized && (
            <section tw="px-4 ml-auto">
               {keycloak.authenticated ? (
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
               ) : (
                  <span />
               )}
            </section>
         )}
      </Navbar>
   )
}

const Navbar = styled.div`
   height: 64px;
   display: grid;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`bg-white top-0 fixed w-full items-center border-b`}
   @media (max-width: 767px) {
      display: flex;
   }
`

const Brand = styled(Link)`
   ${tw`w-auto h-full px-6 flex items-center border-r`}
`

const Progress = styled.section`
   min-width: 720px;
   ${tw`flex flex-col m-auto justify-center`}
   @media (max-width: 767px) {
      display: none;
   }
`

const Steps = styled.ul`
   ${tw`w-full grid grid-cols-5`}
`

const Step = styled.li`
   ${tw`text-sm text-center text-gray-600`}
`

const ProgressBar = styled.span(
   ({ current }) => css`
      margin: 8px auto;
      width: calc(100% - 128px);
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
