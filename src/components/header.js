import React from 'react'
import { Link, navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import { useConfig } from '../lib'
import { useUser } from '../context'
import { isClient, getInitials } from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon } from '../assets/icons'

export const Header = () => {
   const { isAuthenticated, user } = useUser()
   const { configOf } = useConfig()
   const logout = () => {
      isClient && localStorage.removeItem('token')
      if (isClient) {
         window.location.href = window.location.origin + ''
      }
   }

   const brand = configOf('theme-brand', 'brand')
   const theme = configOf('theme-color', 'Visual')

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)

   return (
      <>
         <Wrapper>
            <Brand to="/" title={brand?.name || 'Subscription Shop'}>
               {brand?.logo?.logoMark && (
                  <img
                     tw="h-auto md:h-12"
                     src={brand?.logo?.logoMark}
                     alt={brand?.name || 'Subscription Shop'}
                  />
               )}
               {brand?.name && <span tw="ml-2">{brand?.name}</span>}
            </Brand>
            <section tw="flex items-center justify-between">
               <ul />
               <ul tw="px-4 flex space-x-4">
                  <Link
                     to="/how-it-works/"
                     tw="text-gray-800 hidden md:inline-block"
                  >
                     How It Works
                  </Link>
                  {!user.isSubscriber && (
                     <SelectPlanLink to="/get-started/select-plan">
                        Select Plan
                     </SelectPlanLink>
                  )}
                  {isAuthenticated && user?.isSubscriber ? (
                     <li tw="text-gray-800 hidden hidden md:inline-block">
                        <Link to="/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="text-gray-800 hidden md:inline-block">
                        <Link to="/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!isAuthenticated && (
                     <li tw="text-gray-800 hidden md:inline-block">
                        <Link to="/get-started/select-plan">Our Plans</Link>
                     </li>
                  )}
               </ul>
            </section>
            <section tw="px-4 ml-auto flex justify-center">
               {isAuthenticated ? (
                  <>
                     {user?.platform_customer?.firstName &&
                        (isClient && window.innerWidth > 786 ? (
                           <Link
                              to="/account/profile/"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ) : (
                           <Link
                              to="#"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                              onClick={() => setToggle(!toggle)}
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ))}

                     <button
                        css={tw`text-red-600 rounded px-2 py-1 hidden md:inline-block `}
                        onClick={logout}
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <Login onClick={() => navigate('/login')} bg={theme?.accent}>
                     Log In
                  </Login>
               )}
               <button
                  css={tw`rounded px-2 py-1 inline-block md:hidden ml-2`}
                  onClick={() => setIsMobileNavVisible(!isMobileNavVisible)}
               >
                  {isMobileNavVisible ? (
                     <CrossIcon stroke="#111" size={24} />
                  ) : (
                     <MenuIcon />
                  )}
               </button>
            </section>
            {isMobileNavVisible && (
               <section tw="absolute block md:hidden bg-white px-4 w-full top-16 list-none transition-all duration-200 ease-in-out">
                  <li tw="text-gray-800 py-4">
                     <Link to="/how-it-works/">How It Works</Link>
                  </li>
                  {isAuthenticated && user?.isSubscriber ? (
                     <li tw="text-gray-800 py-4">
                        <Link to="/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="text-gray-800 py-4">
                        <Link to="/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!isAuthenticated && (
                     <li tw="text-gray-800 py-4">
                        <Link to="/get-started/select-plan">Our Plans</Link>
                     </li>
                  )}
               </section>
            )}
         </Wrapper>
         {isClient && window.innerWidth < 786 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
      </>
   )
}

const Wrapper = styled.header`
   height: 64px;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`w-full grid top-0 bg-white fixed border-b items-center`}
`

const Brand = styled(Link)`
   ${tw`h-full px-6 flex items-center border-r`}
`

const Login = styled.button(
   ({ bg }) => css`
      ${tw`bg-blue-600 text-white rounded px-2 py-1`}
      ${bg && `background-color: ${bg};`}
   `
)

const SelectPlanLink = styled(Link)`
   text-decoration: none;
   ${tw`text-gray-800 hover:text-indigo-600 mr-3`}
`
