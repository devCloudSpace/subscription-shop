import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'

import { Header } from './header'
import { MailIcon, PhoneIcon } from '../assets/icons'
import { UserProvider, ConfigProvider } from '../context'

export const Layout = ({ children, noHeader }) => {
   return (
      <UserProvider>
         <ConfigProvider>
            {!noHeader && <Header />}
            {children}
            <Footer tw="bg-green-600 text-white">
               <div>
                  <section>
                     <h2 tw="text-3xl">Subscription Shop</h2>
                     <p tw="mt-2">
                        1700 East Willow Street, Signal Hill, California, United
                        States, 90755
                     </p>
                     <span tw="mt-4 flex items-center">
                        <MailIcon size={18} tw="stroke-current mr-2" />
                        <a href="mailto:example@example.com" tw="underline">
                           me@example.com
                        </a>
                     </span>
                     <span tw="mt-4 flex items-center">
                        <PhoneIcon size={18} tw="stroke-current mr-2" />+ 002-
                        01008431112
                     </span>
                  </section>
                  <section>
                     <h4 tw="text-2xl mb-4 mt-2">Navigation</h4>
                     <ul>
                        <li tw="mb-3">
                           <Link to="/subscription">Home</Link>
                        </li>
                        <li tw="mb-3">
                           <Link to="/subscription/account/profile/">
                              Profile
                           </Link>
                        </li>
                        <li tw="mb-3">
                           <Link to="/subscription/menu">Menu</Link>
                        </li>
                     </ul>
                  </section>
               </div>
            </Footer>
         </ConfigProvider>
      </UserProvider>
   )
}

const Footer = styled.footer`
   height: 320px;
   padding: 24px 0;
   background-size: 160px;
   background-color: transparent;
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
