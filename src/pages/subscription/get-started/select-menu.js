import React from 'react'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'

import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
   useMenu,
} from '../../../sections/select-menu'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout, StepsNavbar, HelperBar } from '../../../components'

const SelectMenu = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         console.log('navigate called')
         navigate('/subscription/get-started/select-plan')
      }
   }, [user])

   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')

   return (
      <MenuProvider>
         <Layout noHeader>
            <SEO title="Select Menu" />
            <StepsNavbar />
            <Main>
               <div>
                  <WeekPicker isFixed />
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
