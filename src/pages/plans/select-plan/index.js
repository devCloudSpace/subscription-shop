import React from 'react'
import tw, { styled } from 'twin.macro'

import { SEO, Layout, Plans } from '../../../components'

export default () => (
   <Layout noHeader>
      <SEO title="Home" />
      <Navbar>
         <li>Step 1</li>
         <li>Step 2</li>
         <li>Step 3</li>
         <li>Step 4</li>
      </Navbar>
      <Main>
         <Header>
            <h1 css={tw`text-4xl text-gray-700`}>Plans</h1>
         </Header>
         <Plans />
      </Main>
   </Layout>
)

const Navbar = styled.ul`
   height: 64px;
   ${tw`flex border-b`}
`

const Main = styled.main`
   overflow-y: auto;
   height: calc(100vh - 64px);
`

const Header = styled.header`
   height: 360px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`
