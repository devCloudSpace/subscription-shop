import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { SEO, Layout, StepsNavbar } from '../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
} from '../../sections/select-menu'

const SelectMenu = () => {
   const [keycloak] = useKeycloak()

   React.useEffect(() => {
      if (!keycloak?.tokenParsed?.sub) {
         navigate('/get-started/select-plan')
      }
   }, [keycloak])

   return (
      <MenuProvider>
         <Layout noHeader>
            <SEO title="Select Menu" />
            <StepsNavbar />
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
         </Layout>
      </MenuProvider>
   )
}

export default SelectMenu

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
