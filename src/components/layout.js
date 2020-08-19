import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { Header } from './header'
import { CONFIG } from '../graphql'
import { PageLoader } from './page_loader'
import { MailIcon, PhoneIcon } from '../assets/icons'
import { UserProvider, ConfigProvider } from '../context'

export const Layout = ({ children, noHeader }) => {
   const [address, setAddress] = React.useState('')
   const [contact, setContact] = React.useState({})
   const { loading: addressLoading } = useSubscription(CONFIG, {
      variables: {
         identifier: { _eq: 'Location' },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { subscription_subscriptionStoreSetting: location = [] } = {},
         } = {},
      }) => {
         let address = ''
         if (location[0].value.line1) {
            address += location[0].value.line1 + ', '
         }
         if (location[0].value.line2) {
            address += location[0].value.line2 + ', '
         }
         if (location[0].value.city) {
            address += location[0].value.city + ', '
         }
         if (location[0].value.state) {
            address += location[0].value.state + ', '
         }
         if (location[0].value.country) {
            address += location[0].value.country + ', '
         }
         if (location[0].value.zipcode) {
            address += location[0].value.zipcode + ', '
         }
         setAddress(address)
      },
   })
   const { loading: contactLoading } = useSubscription(CONFIG, {
      variables: {
         identifier: { _eq: 'Contact' },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { subscription_subscriptionStoreSetting: contact = [] } = {},
         } = {},
      }) => {
         setContact(contact[0].value)
      },
   })

   if (addressLoading || contactLoading) return <PageLoader />
   return (
      <UserProvider>
         <ConfigProvider>
            {!noHeader && <Header />}
            {children}
            <Footer tw="bg-green-600 text-white">
               <div>
                  <section>
                     <h2 tw="text-3xl">Subscription Shop</h2>
                     <p tw="mt-2">{address}</p>
                     <span tw="mt-4 flex items-center">
                        <MailIcon size={18} tw="stroke-current mr-2" />
                        <a href={`mailto:${contact.email}`} tw="underline">
                           {contact?.email}
                        </a>
                     </span>
                     <span tw="mt-4 flex items-center">
                        <PhoneIcon size={18} tw="stroke-current mr-2" />
                        {contact?.phoneNo}
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
