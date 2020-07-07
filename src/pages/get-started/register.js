import React from 'react'
import { navigate } from '@reach/router'
import tw, { styled } from 'twin.macro'
import { useKeycloak } from '@react-keycloak/web'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { SEO, Layout, StepsNavbar } from '../../components'
import { CUSTOMERS, UPDATE_CUSTOMER, CREATE_CUSTOMER } from '../../graphql'

export default () => {
   const [keycloak, initialized] = useKeycloak()
   const [create] = useMutation(CREATE_CUSTOMER)
   const [update] = useMutation(UPDATE_CUSTOMER)

   const [customers] = useLazyQuery(CUSTOMERS, {
      onCompleted: ({ customers }) => {
         if (customers.length > 0) {
            const [customer] = customers
            update({
               variables: {
                  id: customer.id,
                  keycloakId: customer.keycloakId,
                  _set: { isSubscriber: true },
               },
            })
            if (customer.subscriptionId) {
               navigate('/')
            }
         }
         if (customers.length === 0) {
            create({
               variables: {
                  object: {
                     isSubscriber: true,
                     source: 'subscription',
                     email: keycloak.userInfo.email,
                     keycloakId: keycloak.userInfo.sub,
                     clientId: process.env.GATSBY_CLIENTID,
                  },
               },
            })
         }
         navigate('/get-started/select-delivery')
      },
   })

   React.useEffect(() => {
      if (initialized && keycloak.authenticated) {
         if (window.location !== window.parent.location) {
            window.parent.location.reload()
         }
         if ('tokenParsed' in keycloak) {
            customers({
               variables: {
                  where: { keycloakId: { _eq: keycloak.tokenParsed.sub } },
               },
            })
         }
      }
   }, [keycloak.authenticated, initialized, customers])

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
