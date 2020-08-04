import React from 'react'
import { Link } from 'gatsby'
import tw, { styled } from 'twin.macro'

export const ProfileSidebar = () => {
   const [menu] = React.useState([
      { title: 'Profile', href: '/subscription/account/profile/' },
      { title: 'Order History', href: '/subscription/account/orders/' },
   ])

   return (
      <aside tw="bg-gray-100 border-r">
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
      </aside>
   )
}

const MenuLink = styled(Link)`
   ${tw`pl-3 flex items-center w-full h-12`}
   &.active {
      ${tw`bg-gray-300`}
   }
`
