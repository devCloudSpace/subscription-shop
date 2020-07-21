import React from 'react'
import tw from 'twin.macro'

import { Layout, SEO } from '../components'

const Menu = () => {
   return (
      <Layout>
         <SEO title="Menu" />
         <h2 css={tw`my-3 text-gray-600 text-xl`}>Menu Page</h2>
      </Layout>
   )
}

export default Menu
