import React from 'react'
import tw, { styled } from 'twin.macro'

import { SEO, Layout, Plans, StepsNavbar } from '../../components'

const SelectPlan = () => (
   <Layout noHeader>
      <SEO title="Plans" />
      <StepsNavbar />
      <main>
         <Header>
            <h1 css={tw`text-4xl text-gray-700`}>Plans</h1>
         </Header>
         <Plans />
      </main>
   </Layout>
)

export default SelectPlan

const Header = styled.header`
   height: 360px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`
