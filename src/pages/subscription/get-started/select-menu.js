import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { SEO, Layout, StepsNavbar, HelperBar } from '../../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
   useMenu,
} from '../../../sections/select-menu'

const SelectMenu = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/subscription/get-started/select-plan')
      }
   }, [keycloak])

   return (
      <MenuProvider>
         <Layout noHeader>
            <SEO title="Select Menu" />
            <StepsNavbar />
            <Main>
               <div>
                  <WeekPicker isFixed />
                  <Header>
                     <h1 css={tw`text-2xl md:text-4xl text-gray-700`}>
                        Explore our Menus
                     </h1>
                  </Header>
               </div>
               <MenuContent />
            </Main>
         </Layout>
      </MenuProvider>
   )
}

export default SelectMenu

const MenuContent = () => {
   const { state } = useMenu()

   if (!state?.week?.id)
      return (
         <section tw="p-3">
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  No menu available for this week!
               </HelperBar.SubTitle>
            </HelperBar>
         </section>
      )
   return (
      <Content>
         <Menu />
         <CartPanel noSkip isCheckout />
      </Content>
   )
}

const Main = styled.main`
   margin: auto;
   padding-bottom: 24px;
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
