import React from 'react'
import tw, { styled } from 'twin.macro'

import { InfoSection } from '../../../sections'
import { Plans } from '../../../sections/select-plan'
import { SEO, Layout, StepsNavbar } from '../../../components'

const SelectPlan = () => {
   return (
      <Layout noHeader>
         <SEO title="Plans" />
         <StepsNavbar />
         <Main>
            <Header>
               <h1 css={tw`text-4xl text-gray-700`}>Plans</h1>
            </Header>
            <Plans />
            <InfoSection page="select-plan" identifier="bottom-01" />
         </Main>
      </Layout>
   )
}

export default SelectPlan

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 360px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`
