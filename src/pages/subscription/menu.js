import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { SEO, Layout, HelperBar, Loader } from '../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
} from '../../sections/select-menu'
import { useUser } from '../../context'
import { useConfig } from '../../lib'

const MenuPage = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/select-plan')
      }
   }, [isAuthenticated])

   return (
      <MenuProvider>
         <Layout>
            <SEO title="Select Menu" />
            <MenuContent />
         </Layout>
      </MenuProvider>
   )
}

export default MenuPage

const MenuContent = () => {
   const { user } = useUser()
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')
   if (isEmpty(user))
      return (
         <Main>
            <Loader inline />
         </Main>
      )
   if (user?.isSubscriber)
      return (
         <Main>
            <div>
               <WeekPicker />
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
            </div>
            <Content>
               <Menu />
               <CartPanel />
            </Content>
         </Main>
      )
   return (
      <Main>
         <div tw="py-3 mx-auto container">
            <HelperBar type="info">
               <HelperBar.Title>No plans selected?</HelperBar.Title>
               <HelperBar.SubTitle>
                  Let's start with setting up a plan for you.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() =>
                     navigate('/subscription/get-started/select-plan')
                  }
               >
                  Select Plan
               </HelperBar.Button>
            </HelperBar>
         </div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   padding-bottom: 24px;
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

const Content = styled.section`
   ${tw`px-4 grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`
