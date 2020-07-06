import React from 'react'

import { Header } from './header'

export const Layout = ({ children, noHeader, isFullWidth }) => {
   return (
      <>
         {!noHeader && <Header />}
         {children}
      </>
   )
}
