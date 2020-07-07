import React from 'react'
import tw, { styled } from 'twin.macro'
import { navigate } from '@reach/router'
import { useKeycloak } from '@react-keycloak/web'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { SEO, Layout, StepsNavbar } from '../../components'
import { CUSTOMERS, UPDATE_CUSTOMER, CREATE_CUSTOMER } from '../../graphql'

export default () => {
   const [keycloak] = useKeycloak()

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
                     email: keycloak?.tokenParsed?.email,
                     clientId: process.env.GATSBY_CLIENTID,
                     keycloakId: keycloak?.tokenParsed?.sub,
                  },
               },
            })
         }
         navigate('/get-started/select-delivery')
      },
   })

   React.useEffect(() => {
      if (keycloak?.authenticated) {
         if ('tokenParsed' in keycloak) {
            customers({
               variables: {
                  where: { keycloakId: { _eq: keycloak?.tokenParsed?.sub } },
               },
            })
         }
      }
   }, [keycloak, customers])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main>
            {!keycloak?.authenticated && (
               <iframe
                  frameBorder="0"
                  title="Register"
                  css={tw`w-full h-full`}
                  src={keycloak?.createRegisterUrl()}
               ></iframe>
            )}
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
