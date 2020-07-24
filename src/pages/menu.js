import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { SEO, Layout, HelperBar } from '../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
} from '../sections/select-menu'
import { useUser } from '../context'

const MenuPage = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

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

   if (!user.subscriptionId)
      return (
         <MenuProvider>
            <Layout>
               <SEO title="Select Menu" />
               <Main>
                  <div tw="py-3 mx-auto container">
                     <HelperBar type="info">
                        <HelperBar.Title>No plans selected?</HelperBar.Title>
                        <HelperBar.SubTitle>
                           Let's start with setting up a plan for you.
                        </HelperBar.SubTitle>
                        <HelperBar.Button
                           onClick={() => navigate('/get-started/select-plan')}
                        >
                           Select Plan
                        </HelperBar.Button>
                     </HelperBar>
                  </div>
               </Main>
            </Layout>
         </MenuProvider>
      )
   return (
      <Main>
         <div>
            <WeekPicker />
            <Header>
               <h1 css={tw`text-2xl md:text-4xl text-gray-700`}>
                  Explore our Menus
               </h1>
            </Header>
         </div>
         <Content>
            <Menu />
            <CartPanel />
         </Content>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 320px;
   ${tw`bg-gray-100 flex items-center justify-center`}
`

const Content = styled.section`
   ${tw`px-4 grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`
