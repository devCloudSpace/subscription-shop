import React from 'react'
import { isEmpty } from 'lodash'
import tw, { styled } from 'twin.macro'

import { useConfig } from '../../../lib'
import { InfoSection } from '../../../sections'
import { Plans } from '../../../sections/select-plan'
import { SEO, Layout, StepsNavbar } from '../../../components'

const SelectPlan = () => {
   const { configOf } = useConfig('Select-Plan')
   const config = configOf('select-plan-header')
   return (
      <Layout noHeader>
         <SEO title="Plans" />
         <StepsNavbar />
         <Main>
            <Header
               url={
                  !isEmpty(config?.header?.images)
                     ? config?.header?.images[0]?.url
                     : ''
               }
            >
               {config?.header?.heading && (
                  <h1 css={tw`text-4xl text-white z-10`}>
                     {config?.header?.heading}
                  </h1>
               )}
               {config?.header?.subHeading && (
                  <h3 css={tw`text-xl text-gray-100 z-10`}>
                     {config?.header?.subHeading}
                  </h3>
               )}
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
   height: 480px;
   position: relative;
   ${tw`bg-gray-100 flex flex-col items-center justify-center`}
   ::before {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 0;
      background-image: url(${props => props.url});
      ${tw`bg-no-repeat bg-center bg-cover`}
   }
   ::after {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
      ${tw`bg-black opacity-25`}
   }
`
