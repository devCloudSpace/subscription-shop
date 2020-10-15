import React from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { Header } from './header'
import { normalizeAddress } from '../utils'
import { UserProvider } from '../context'
import { useConfig } from '../lib/config'
import { MailIcon, PhoneIcon } from '../assets/icons'

export const Layout = ({ children, noHeader }) => {
   const { hasConfig, configOf } = useConfig()
   const [keycloak] = useKeycloak()
   return (
      <UserProvider>
         {!noHeader && <Header />}
         {children}
         <Footer hasColor={configOf('theme-color', 'Visual')}>
            <div>
               <section>
                  <h2 tw="text-3xl">Subscription Shop</h2>
                  {hasConfig('Location', 'availability') && (
                     <p tw="mt-2">
                        {normalizeAddress(configOf('Location', 'availability'))}
                     </p>
                  )}

                  {hasConfig('Contact', 'brand') && (
                     <>
                        <span tw="mt-4 flex items-center">
                           <MailIcon size={18} tw="stroke-current mr-2" />
                           <a
                              href={`mailto:${
                                 configOf('Contact', 'brand')?.email
                              }`}
                              tw="underline"
                           >
                              {configOf('Contact', 'brand')?.email}
                           </a>
                        </span>
                        <span tw="mt-4 flex items-center">
                           <PhoneIcon size={18} tw="stroke-current mr-2" />
                           {configOf('Contact', 'brand')?.phoneNo}
                        </span>
                     </>
                  )}
               </section>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Navigation</h4>
                  <ul>
                     <li tw="mb-3">
                        <Link to="/subscription">Home</Link>
                     </li>
                     {keycloak?.authenticated && (
                        <li tw="mb-3">
                           <Link to="/subscription/account/profile/">
                              Profile
                           </Link>
                        </li>
                     )}
                     <li tw="mb-3">
                        <Link to="/subscription/menu">Menu</Link>
                     </li>
                  </ul>
               </section>
            </div>
         </Footer>
      </UserProvider>
   )
}

const Footer = styled.footer(
   ({ hasColor }) => css`
      height: 320px;
      padding: 24px 0;
      background-size: 160px;
      ${tw`bg-green-600 text-white`}
      ${hasColor?.accent && `background-color: ${hasColor.accent}`};
      background-image: url('https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/pattern.png');
      div {
         margin: 0 auto;
         max-width: 980px;
         width: calc(100% - 40px);
         ${tw`grid gap-6`}
         grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      @media (max-width: 768px) {
         height: auto;
      }
   `
)
