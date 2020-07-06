import React from 'react'
import tw, { styled } from 'twin.macro'

export const StepsNavbar = () => {
   return (
      <Navbar>
         <li>Step 1</li>
         <li>Step 2</li>
         <li>Step 3</li>
         <li>Step 4</li>
      </Navbar>
   )
}

const Navbar = styled.ul`
   height: 64px;
   ${tw`flex border-b`}
`
