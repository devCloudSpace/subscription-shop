import React, { useState } from 'react'
import { User } from '../assets/icons/User'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

export const ProfileSidebar = () => {
   const [menu] = useState([
      { title: 'Profile', href: '/subscription/account/profile/' },
      { title: 'Order History', href: '/subscription/account/orders/' },
      { title: 'Manage Addresses', href: '/subscription/account/addresses/' },
      { title: 'Manage Cards', href: '/subscription/account/cards/' },
   ])
   const [toggle, setToggle] = useState(true)
   return (
      <>
         <div
            tw="px-5 pt-2 w-max m-auto cursor-pointer md:hidden"
            onClick={() => setToggle(!toggle)}
         >
            <User />
         </div>
         <Aside toggle={toggle}>
            <ul>
               {menu.map(node => (
                  <MenuLink
                     to={node.href}
                     key={node.href}
                     activeClassName="active"
                  >
                     {node.title}
                  </MenuLink>
               ))}
            </ul>
         </Aside>
      </>
   )
}

const MenuLink = styled(Link)`
   ${tw`pl-3 flex items-center w-full h-12`}
   &.active {
      ${tw`bg-gray-300`}
   }
`
const Aside = styled.aside(
   ({ toggle }) => css`
      ${tw`bg-gray-100 border-r block transition`}
      ${toggle ? tw`hidden md:block` : tw`block md:hidden`}
   `
)
