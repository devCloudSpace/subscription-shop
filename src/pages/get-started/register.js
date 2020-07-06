import React from 'react'
import { navigate } from '@reach/router'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'

import { SEO, Layout, StepsNavbar } from '../../components'

export default () => {
   const [keycloak, initialized] = useKeycloak()

   React.useEffect(() => {
      if (initialized && keycloak.authenticated) {
         if (window.location !== window.parent.location) {
            window.parent.location = '/get-started/select-delivery'
         }
         navigate('/get-started/select-delivery')
      }
   }, [keycloak.authenticated, initialized])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main>
            <iframe
               frameBorder="0"
               title="Register"
               css={tw`w-full h-full`}
               src={keycloak.createRegisterUrl()}
            ></iframe>
         </Main>
      </Layout>
   )
}
const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 980px;
   width: calc(100vw - 40px);
   height: calc(100vh - 64px);
`
